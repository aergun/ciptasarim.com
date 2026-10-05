/**
 * Semiconductor engineering models.
 *
 * Every function here is a standard model from the digital and physical design
 * literature, and every one is exported so the same code answers the tools page and
 * the server's own sanity checks. Nothing here touches the DOM, the database or the
 * filesystem.
 *
 * ### Three rules, and they are the reason this file exists
 *
 * **1. Values are numbers, not formatted strings.** The reference project returned
 * `{ value: \`${fmt(x, 2)} kn\` }` — the unit and the decimal separator were baked in
 * before any locale ran. Under `tr-TR` that renders `12.34` on a Turkish page, where it
 * should read `12,34`, and the reader cannot tell a correct value from a mangled one.
 * Here `value` is a `number` and `unit` is a separate `FigureUnit`, and `Intl` formats
 * it at render time.
 *
 * **2. Every result carries a `basis`.** These are all *models*. None of them has been
 * calibrated against characterised silicon of ours, because there is none. So every
 * result is `modelled`, and the one place a `measured` basis could honestly appear
 * (passing in a characterised figure) requires the caller to supply it explicitly. The
 * alternative — a results panel of unqualified numbers — is the failure this whole
 * project is built to avoid.
 *
 * **3. `warning` is prose explaining the physics, never a code.** A tool that says
 * "OUT OF RANGE" teaches the reader nothing. It says *which* range, *why* it exists and
 * *what breaks* past it.
 *
 * ### The honest limit of this file
 *
 * These are preliminary-design tools: the arithmetic a design engineer does in the first
 * hour of a project. They are not a substitute for characterisation, sign-off or PVT
 * corner analysis. That is what the `EngineeringNotice` says, and it is not
 * boilerplate — for the models below it is the load-bearing caveat, because a Murphy
 * yield curve computed from someone else's `D0` is a guess with a formula on it.
 */

import type { FigureUnit, ToolId } from './types.ts'

/* -------------------------------------------------------------------------- */
/* Units                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Unit constants.
 *
 * Only genuine physical conversions live here. Anything that is a *process* constant —
 * a cell area, a defect density, a leakage current — belongs in `content/processes.ts`
 * as a `Figure` carrying its own basis, because those are the numbers that need a
 * source. Putting them here as bare constants is precisely the mistake the reference
 * project's `RESISTANCE_TO_WEIGHT` avoided and this one has to avoid too: there is no
 * characterised silicon to defend any of them against.
 */
export const NM_PER_UM = 1000
export const MM_PER_CM = 10
export const CM2_PER_MM2 = 0.01

/* -------------------------------------------------------------------------- */
/* Result shape                                                                */
/* -------------------------------------------------------------------------- */

/**
 * One row of a calculator's output.
 *
 * Numeric, unit-bearing and basis-bearing — the three properties the reference
 * project's `CalculatorResult { value: string }` gave up, and the reason a Turkish
 * reader sees `12,34` rather than `12.34`.
 */
export interface EngineeringResult {
  id: string
  label: { tr: string; en: string }
  value: number
  unit: FigureUnit
  basis: 'measured' | 'modelled' | 'uncharacterised'
  /** Set when the number warrants a plain-language reading. */
  interpretation?: { tr: string; en: string }
  /**
   * Flags a value outside the tool's credible range, or a place where the model's
   * assumptions have run out. Prose, always: which range, why it exists, what breaks.
   */
  warning?: { tr: string; en: string }
}

/**
 * Tool input. A plain record of numbers, matching the reference project's
 * `CalculatorInputs` — the tools page is data-driven, so this is the one place that has
 * to know every tool's parameters.
 *
 * Missing keys read as 0 rather than `undefined`, because every field on a tool has a
 * default in `content/tools.ts` and the UI always submits all of them. A tool invoked
 * without its defaults is a tool invoked wrong; the range checks catch it.
 */
export type EngineeringInputs = Record<string, number>

/* -------------------------------------------------------------------------- */
/* Critical path                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Elmore delay of an RC stage.
 *
 * The 0.69 factor is ln(2) — the time for an RC step response to reach 50% of its final
 * value, which is the conventional point at which a digital stage's delay is quoted.
 * Using the full exponential instead would give a number no timing report agrees with.
 *
 * @param resistanceOhm - driver resistance plus wire resistance, ohms
 * @param capacitanceF - load capacitance, farads
 * @returns propagation delay, seconds
 */
export function elmoreDelaySeconds(resistanceOhm: number, capacitanceF: number): number {
  return 0.69 * resistanceOhm * capacitanceF
}

/**
 * Logical effort of a gate.
 *
 * `effort = C_out / C_in`, the ratio of the load a gate presents to the capacitance it
 * requires. A chain of unit-effort gates is the minimum-delay structure for its logic
 * depth; anything above 1 means the chain is spending more than it needs to, and the
 * excess is a place where a buffer could recover delay.
 *
 * @param inputCapacitanceF - intrinsic input capacitance, farads
 * @param outputCapacitanceF - output capacitance actually driven, farads
 * @returns dimensionless effort
 */
export function logicalEffort(inputCapacitanceF: number, outputCapacitanceF: number): number {
  if (inputCapacitanceF <= 0) return Number.POSITIVE_INFINITY
  return outputCapacitanceF / inputCapacitanceF
}

/**
 * Total delay of a single logic stage.
 *
 * Two terms, because they have different fixes:
 *
 * - the **logical effort** term scales with the load and shrinks with better logic
 * - the **parasitic delay** term is the stage's own effort-independent cost
 *
 * `total = effort × parasiticDelay + intrinsicDelay`
 *
 * This is what makes the tool useful rather than decorative: a stage with high effort
 * wants a buffer or a stronger driver, while a stage with high parasitic delay wants a
 * smaller cell. Both show up as "the path is slow" and need opposite remedies.
 *
 * @returns delay, seconds
 */
export function stageDelaySeconds(effort: number, parasiticDelaySeconds: number, intrinsicDelaySeconds: number): number {
  return effort * parasiticDelaySeconds + intrinsicDelaySeconds
}

/**
 * Cascaded delay over a chain of stages.
 *
 * Stages in a real path are not independent — a slow stage's output arrives late and
 * skews what the next one sees. This sums them, which is exact for non-interacting
 * stages and optimistic when there is clock skew between them; the slack tool is where
 * skew is accounted for, not here.
 *
 * @param stageDelaysSeconds - per-stage delay, seconds
 * @returns path delay, seconds
 */
export function cascadeDelaySeconds(stageDelaysSeconds: readonly number[]): number {
  return stageDelaysSeconds.reduce((total, d) => total + d, 0)
}

/**
 * Wire delay over an interconnect.
 *
 * Standard 3σ Elmore for a distributed RC line:
 *
 * ```
 * t = 0.69 · R · C / 2 = 0.38 · R · C
 * ```
 *
 * The factor of ½ is the distant-switched-capacitor approximation, appropriate for a
 * line whose far end sees the driver through the whole resistance. It is right for an
 * unloaded wire and pessimistic for a well-buffered one, which is why `driverStrength`
 * exists as a separate input rather than being buried in a constant.
 *
 * @param lengthMm - wire length, millimetres
 * @param widthNm - drawn wire width, nanometres
 * @param capacitanceFfPerMm - wire capacitance, femtofarads per millimetre
 * @param sheetResistanceOhm - metal sheet resistance, ohms per square
 * @returns wire delay, seconds
 */
export function wireDelaySeconds(
  lengthMm: number,
  widthNm: number,
  capacitanceFfPerMm: number,
  sheetResistanceOhm: number,
): number {
  const widthSquares = (lengthMm * 1e6) / widthNm // mm → nm, then ÷ width = squares
  const resistanceOhm = widthSquares * sheetResistanceOhm
  const capacitanceF = lengthMm * capacitanceFfPerMm * 1e-15 // fF → F
  return 0.38 * resistanceOhm * capacitanceF
}

/* -------------------------------------------------------------------------- */
/* Power                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Dynamic switching power.
 *
 * ```
 * P = α · C · V² · f
 * ```
 *
 * The **square on the voltage** is the single most useful fact in this file for anyone
 * reasoning about a design: halving the supply voltage quarters the dynamic power.
 * It is also why lowering voltage is not free — delay rises roughly linearly as V falls
 * while dynamic power falls quadratically, which is the trade the multi-corner tools in
 * `content/tools.ts` are set up to explore.
 *
 * @param capacitanceF - switched load capacitance, farads
 * @param voltageV - supply voltage, volts
 * @param frequencyHz - clock frequency, hertz
 * @param activityFactor - α, the fraction of clock cycles that toggle. 1.0 for a clock
 *   or an enabled datapath, ~0 for a held register.
 * @returns power, watts
 */
export function dynamicPowerWatts(
  capacitanceF: number,
  voltageV: number,
  frequencyHz: number,
  activityFactor: number,
): number {
  return activityFactor * capacitanceF * voltageV * voltageV * frequencyHz
}

/**
 * Short-circuit current contribution to dynamic power.
 *
 * While an output is slewing, both the pull-up and pull-down devices conduct. This adds
 * roughly 10–20% to the switching term, and it is modelled here as an explicit fraction
 * so a reader can see it rather than having it hidden in a multiplier.
 *
 * @param dynamicPowerW - the α·C·V²·f term, watts
 * @param shortCircuitFraction - additional power as a fraction of the switching term
 * @returns watts
 */
export function shortCircuitPowerWatts(dynamicPowerW: number, shortCircuitFraction = 0.15): number {
  return dynamicPowerW * (1 + shortCircuitFraction)
}

/**
 * Leakage current of one cell at a given temperature.
 *
 * Subthreshold conduction depends on the overdrive `V_GS − V_th`, and `V_th` falls with
 * temperature. Writing that through gives:
 *
 * ```
 * I(T) = I_ref · exp( (V_th(T_ref) − V_th(T)) / (n · V_T) )
 *      = I_ref · exp(  (ΔT · k_th) / (n · V_T) )
 * ```
 *
 * with `k_th` the threshold-voltage temperature coefficient (~2 mV/°C on a mature
 * node) and `V_T = k·T/q` the thermal voltage **at the temperature being asked about**,
 * which is why the denominator is not a constant.
 *
 * ### The first version of this was wrong
 *
 * It had the form `I_ref · exp(−k · (T − T_ref) / (T + 273))` — a factor `k` divided by
 * temperature. With any plausible `k` that exponent evaluates to about −0.001 over 60 °C,
 * so **leakage came out 1.0× independent of temperature**, and `verify:engineering`
 * failed on "60 °C rise multiplies leakage by roughly 60×" with a measured 1.0×.
 *
 * The error was structural, not a wrong coefficient: the model had no `V_th` in it at
 * all, so there was nothing for temperature to act on.
 *
 * ### What the "doubling every 10 °C" rule actually predicts
 *
 * It is a rule of thumb, and the exact form is sensitive to `k_th` and `n`. At the
 * defaults here (2 mV/°C, n = 1.2) the multiplier is about **1.8× per 10 °C** — close to
 * double, not exactly double — giving roughly **25× over 60 °C**, from 25 °C to 85 °C.
 * Quoting "60×" would have been wrong; the assertion in `verify:engineering` is a range,
 * not the folk figure.
 *
 * This is what makes leakage the uncomfortable term in a power budget: a part that meets
 * its leakage target at 25 °C can exceed it at the hot corner by more than an order of
 * magnitude, and the hot corner is the one the customer measures.
 *
 * @param referenceLeakageA - leakage at the reference condition, amperes
 * @param widthUm - drawn gate width, micrometres
 * @param referenceWidthUm - width the reference leakage was measured at
 * @param temperatureC - junction temperature, °C
 * @param thresholdTempCoeffV - dV_th/dT, volts per °C
 * @returns leakage current, amperes
 */
export function leakageCurrentAmps(
  referenceLeakageA: number,
  widthUm: number,
  referenceWidthUm: number,
  temperatureC: number,
  thresholdTempCoeffV = 0.002,
  bodyFactor = 1.2,
): number {
  const widthFactor = widthUm / referenceWidthUm
  const tempK = temperatureC + 273
  const refTempK = 25 + 273
  // V_th(T_ref) − V_th(T) = k_th · (T − T_ref). V_T = k·T/q at the *queried* temperature.
  const thermalVoltage = 8.617333262e-5 * tempK // kT/q, volts
  const overdriveDrop = thresholdTempCoeffV * (tempK - refTempK)
  return referenceLeakageA * widthFactor * Math.exp(overdriveDrop / (bodyFactor * thermalVoltage))
}

/**
 * Leakage power summed over a netlist.
 *
 * @returns watts
 */
export function leakagePowerWatts(leakageAmps: number, voltageV: number): number {
  return leakageAmps * voltageV
}

/* -------------------------------------------------------------------------- */
/* Area                                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Standard-cell area.
 *
 * ```
 * A = N_gates · A_cell
 * ```
 *
 * A *gate equivalent* is one inverter's worth of drive. A design's gate count is
 * therefore only meaningful against the library it was mapped to — the same RTL
 * synthesised to a different standard cell library has a different gate count, and
 * quoting one without the library is quoting a number with its units missing.
 *
 * @param gateEquivalents - count
 * @param cellAreaUm2 - area of one gate equivalent in the target library, µm²
 * @returns µm²
 */
export function cellAreaUm2(gateEquivalents: number, cellAreaUm2PerGate: number): number {
  return gateEquivalents * cellAreaUm2PerGate
}

/**
 * Total die area including routing overhead.
 *
 * ```
 * A_total = A_cells · (1 + overhead) + A_macros
 * ```
 *
 * The routing overhead is real and large — a design that is 80% standard cells
 * synthesised flat will typically need 30–50% added area for routing, and the figure
 * rises with utilisation. The macro term is added *after* the overhead because macros
 * are placed rather than routed through, which is why they do not carry the same
 * multiplier.
 *
 * @returns µm²
 */
export function dieAreaUm2(
  gateEquivalents: number,
  cellAreaUm2PerGate: number,
  routingOverheadFraction: number,
  macroAreaUm2 = 0,
): number {
  return cellAreaUm2(gateEquivalents, cellAreaUm2PerGate) * (1 + routingOverheadFraction) + macroAreaUm2
}

/**
 * Standard-cell equivalents of an SRAM array.
 *
 * Bitcell area alone understates an SRAM by a large factor, because the periphery —
 * decoders, sense amplifiers, precharge — is not free and is not proportional. The
 * 1.2–1.4 range on mature nodes and up to ~2 on the newest is a rule of thumb, and it
 * is exposed as an explicit input rather than a constant for exactly that reason.
 *
 * @returns µm²
 */
export function sramAreaUm2(bits: number, bitcellAreaUm2: number, peripheryFactor: number): number {
  return bits * bitcellAreaUm2 * peripheryFactor
}

/* -------------------------------------------------------------------------- */
/* Yield                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Murphy's yield model.
 *
 * ```
 * Y = ((1 − D)² / (1 − D/2)²) ^ N
 * ```
 *
 * D is the defect density (defects per cm²) and N is the die area in cm². The model
 * assumes every defect kills the die — it is the pessimistic bound, not a prediction of
 * any particular fab, which is why `D0` must come from a foundry's own defect data and
 * not from a table on this site.
 *
 * The asymptote matters: as D → 0, Y → 1; as D → 1, Y → 0. A model that stayed finite
 * at D = 1 would be a bug, and `verify:engineering` asserts it does not.
 *
 * @param defectDensityPerCm2 - D0, defects per square centimetre
 * @param dieAreaCm2 - N, die area in square centimetres
 * @returns yield as a fraction, 0–1
 */
export function murphyYield(defectDensityPerCm2: number, dieAreaCm2: number): number {
  const d = defectDensityPerCm2
  if (d >= 1) return 0
  const numerator = (1 - d) * (1 - d)
  const denominator = (1 - d / 2) * (1 - d / 2)
  return Math.pow(numerator / denominator, dieAreaCm2)
}

/**
 * Dies per wafer.
 *
 * ### Where the wafer area actually goes
 *
 * The construction is deliberately crude — it divides usable area by die pitch and
 * squares — because it is the *relative* sensitivity that matters for a design
 * decision: halving the die area roughly quadruples the die count, and that is a
 * bigger lever on cost per good die than anything else in this file. A 300 mm wafer
 * is about 706 cm² gross, of which a mature process keeps perhaps 600 cm² after edge
 * exclusion, scribe lanes and probe.
 *
 * It ignores the wafer edge being curved, which real floorplanning accounts for by
 * row-by-row placement. Treat the output as an order-of-magnitude figure and never as
 * a quote.
 *
 * @param waferDiameterMm - wafer diameter, millimetres
 * @param dieAreaUm2 - die area, µm²
 * @param scribeWidthUm - scribe lane width, µm
 * @param edgeExclusionMm - unuseable border, millimetres
 * @returns count of dies
 */
export function diesPerWafer(
  waferDiameterMm: number,
  dieAreaUm2Value: number,
  scribeWidthUm: number,
  edgeExclusionMm: number,
): number {
  const radiusMm = waferDiameterMm / 2 - edgeExclusionMm
  if (radiusMm <= 0 || dieAreaUm2Value <= 0) return 0

  // The cell each die occupies already contains the scribe lane: it is the die plus one
  // lane, not the die plus a lane added on top of a pitch that already included it. The
  // first version of this summed both, which under-counted by the die area at every
  // step — for a 1 mm² die that is a 2% error on the pitch, so it looked plausible and
  // was quietly wrong.
  const pitchMm = (Math.sqrt(dieAreaUm2Value) + scribeWidthUm) / 1000
  const usableAreaMm2 = Math.PI * radiusMm * radiusMm

  const perSide = Math.floor(Math.sqrt(usableAreaMm2 / (pitchMm * pitchMm)))
  return perSide * perSide
}

/**
 * Cost per good die.
 *
 * ```
 * cost = waferCost / (diesPerWafer × yield)
 * ```
 *
 * This is the number that decides whether a tapeout is rational, and it is why yield
 * models exist at all: the same wafer costs the same whether 200 or 800 dies come off
 * it, so a design with poor yield is paying for its own failures several times over.
 *
 * @param waferCostUsd - cost of one wafer, USD
 * @param diesPerWaferValue - gross dies
 * @param yieldFraction - 0–1
 * @returns USD per good die
 */
export function costPerGoodDieUsd(
  waferCostUsd: number,
  diesPerWaferValue: number,
  yieldFraction: number,
): number {
  if (yieldFraction <= 0) return Number.POSITIVE_INFINITY
  return waferCostUsd / (diesPerWaferValue * yieldFraction)
}

/* -------------------------------------------------------------------------- */
/* Timing closure                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Setup slack at a given clock.
 *
 * From the standard timing check — data launched at `t_launch` must arrive before the
 * capture edge at `t_capture`:
 *
 * ```
 * slack = (t_capture − t_launch) − t_setup − t_uncertainty − t_cq − t_comb
 * ```
 *
 * With a nominal period T and a worst-case skew magnitude (capture clock early relative
 * to launch), `t_capture − t_launch` is `T − skew`:
 *
 * ```
 * required = T − skew − jitter − uncertainty      ← the window data must fit inside
 * arrival  = t_cq + logic + wire                  ← when it actually gets there
 * slack    = required − arrival
 * ```
 *
 * ### ⚠️ The sign of skew was wrong in the first version
 *
 * It was written `slack = (cq + comb) − (T − skew − jitter − unc)`, which puts the same
 * two terms on the other side. Both sides are the same numbers, but it makes **more
 * clock skew produce more slack**, and it makes a design with *more* logic delay look
 * faster. `verify:engineering` caught it on "more skew reduces setup slack".
 *
 * The bug is the classic one in timing analysis: skew, jitter and uncertainty are
 * penalties that *narrow the window*, so they belong on the same side as the period,
 * not on the same side as the data delay.
 *
 * Negative slack is a **failure, not a small number** — it means the design does not
 * meet timing at that corner, full stop. It is returned as-is and never clamped to
 * zero, because a clamped zero reads as "just barely passing", which is the most
 * dangerous way to report a failure.
 *
 * @returns seconds; negative means the path fails setup at this corner
 */
export function setupSlackSeconds(
  clockPeriodSeconds: number,
  clkToQSeconds: number,
  logicAndWireDelaySeconds: number,
  clockSkewSeconds: number,
  jitterSeconds: number,
  uncertaintySeconds: number,
): number {
  const required =
    clockPeriodSeconds - clockSkewSeconds - jitterSeconds - uncertaintySeconds
  const arrival = clkToQSeconds + logicAndWireDelaySeconds
  return required - arrival
}

/**
 * Hold slack.
 *
 * The hold check is the mirror image and runs in the *fast* direction:
 *
 * ```
 * slack = (t_launch + t_cq_min) − (t_capture + t_hold + t_uncertainty)
 *       = t_cq_min − skew − t_hold
 * ```
 *
 * **`t_cq_min` is the minimum clk→Q corner, not the maximum.** The first version took
 * both a minimum and a maximum and summed them, which is not a quantity that exists.
 * Hold is checked at the fastest corner precisely because that is when data arrives
 * too early; adding the slow corner's clk→Q to it made hold violations impossible to
 * see.
 *
 * Note the asymmetry, which is the reason the two functions do not look alike: setup is
 * helped by a slower path and hurt by a faster one; hold is the reverse. A design that
 * fixes a setup violation by adding delay will very often break hold doing it.
 *
 * @returns seconds; negative means the path fails hold at this corner
 */
export function holdSlackSeconds(
  clkToQMinSeconds: number,
  requiredHoldSeconds: number,
  clockSkewSeconds: number,
): number {
  return clkToQMinSeconds - clockSkewSeconds - requiredHoldSeconds
}

/* -------------------------------------------------------------------------- */
/* Licence economics                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Royalty breakeven against an up-front licence fee.
 *
 * The purchase decision for a semiconductor IP licence is almost never the sticker
 * price — it is where the up-front fee stops being cheaper than paying royalty on
 * production. That crossover is what this computes, and it is the number a design
 * manager actually needs.
 *
 * @param licenceFeeUsd - up-front fee, USD
 * @param royaltyPerUnitUsd - royalty per shipped unit, USD
 * @returns units of production at which the two are equal; Infinity for a
 *   royalty-free licence
 */
export function royaltyBreakevenUnits(licenceFeeUsd: number, royaltyPerUnitUsd: number): number {
  if (royaltyPerUnitUsd <= 0) return Number.POSITIVE_INFINITY
  return licenceFeeUsd / royaltyPerUnitUsd
}

/**
 * Total cost of ownership at a given production volume.
 *
 * The up-front fee is charged once and royalty per unit, so the total is affine in
 * volume — which is why the breakeven point is the whole of the decision, and why a
 * per-unit figure is the wrong way to present a licence to anyone.
 *
 * @returns USD
 */
export function licenceTotalCostUsd(
  licenceFeeUsd: number,
  royaltyPerUnitUsd: number,
  units: number,
): number {
  return licenceFeeUsd + royaltyPerUnitUsd * units
}

/* -------------------------------------------------------------------------- */
/* Dispatcher                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Runs one model by id and returns a display-ready result list.
 *
 * The tools page is data-driven from `content/tools.ts`, so this is the one place that
 * has to know every tool's parameters. Adding a tool means adding a case here and a
 * descriptor there.
 *
 * Two properties this maintains:
 *
 * - **Every result is `basis: 'modelled'`.** There is no path through this function
 *   that emits an unqualified number, because every one of these is a model and none has
 *   been calibrated against our own silicon.
 * - **`default: { const exhaustive: never = id }`.** Adding a `ToolId` without adding a
 *   case here is a compile error naming the id, rather than a runtime "Unknown model"
 *   on a page someone shipped.
 */
export function runEngineering(id: ToolId, input: EngineeringInputs): EngineeringResult[] {
  const n = (key: string, fallback = 0): number => {
    const value = input[key]
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback
  }

  switch (id) {
    case 'critical-path': {
      const stages = Math.max(1, Math.round(n('stages', 8)))
      const effort = n('effort', 1.6)
      const parasiticDelayPs = n('parasiticDelayPs', 12)
      const intrinsicDelayPs = n('intrinsicDelayPs', 6)
      const wireLengthMm = n('wireLengthMm', 2)
      const wireWidthNm = n('wireWidthNm', 40)
      const wireCapFfPerMm = n('wireCapFfPerMm', 140)
      const sheetResistanceOhm = n('sheetResistanceOhm', 0.08)

      const stageDelays = Array.from({ length: stages }, () =>
        stageDelaySeconds(effort, parasiticDelayPs * 1e-12, intrinsicDelayPs * 1e-12),
      )
      const logicDelay = cascadeDelaySeconds(stageDelays)
      const wireDelay = wireDelaySeconds(wireLengthMm, wireWidthNm, wireCapFfPerMm, sheetResistanceOhm)
      const total = logicDelay + wireDelay
      const fmax = total > 0 ? 1 / total : Number.POSITIVE_INFINITY

      return [
        {
          id: 'logic-delay',
          label: { tr: 'Mantık gecikmesi', en: 'Logic delay' },
          value: logicDelay * 1e12,
          unit: 'ps',
          basis: 'modelled',
          interpretation: {
            tr: `${stages} kademe, kademe başına mantık gecikmesi toplamı.`,
            en: `${stages} stages, summed logic delay.`,
          },
        },
        {
          id: 'wire-delay',
          label: { tr: 'Tel gecikmesi', en: 'Wire delay' },
          value: wireDelay * 1e12,
          unit: 'ps',
          basis: 'modelled',
          interpretation: {
            tr: `${wireLengthMm} mm, ${wireWidthNm} nm genişlikteki metal için Elmore yaklaşımı.`,
            en: `Elmore approximation for ${wireLengthMm} mm of metal at ${wireWidthNm} nm width.`,
          },
          warning:
            wireDelay / total > 0.4
              ? {
                  tr: 'Tel gecikmesi toplam gecikmenin %40’ından fazlası. Aşırı yüklü hatlar için tamponlama gerekebilir.',
                  en: 'Wire delay is over 40% of total delay. This path may need buffering.',
                }
              : undefined,
        },
        {
          id: 'total-delay',
          label: { tr: 'Toplam gecikme', en: 'Total delay' },
          value: total * 1e12,
          unit: 'ps',
          basis: 'modelled',
        },
        {
          id: 'fmax',
          label: { tr: 'Maksimum frekans (bu yoldan)', en: 'Maximum frequency (this path)' },
          value: fmax / 1e6,
          unit: 'MHz',
          basis: 'modelled',
          interpretation: {
            tr: 'Yalnızca bu mantık yolu için. Kurulum payı, saat eğimi ve belirsizlik henüz düşülmedi.',
            en: 'For this logic path only. Setup margin, clock skew and uncertainty are not yet subtracted.',
          },
          warning: {
            tr: 'Frekans, zamanlama kapatma payı hariç bir sınırdır. Kapanış için hedef frekansın altında çalışılmalıdır.',
            en: 'This is a bound with no timing-closure margin. Target a lower clock than this to close.',
          },
        },
      ]
    }

    case 'dynamic-power': {
      const capacitanceFf = n('capacitanceFf', 2500)
      const voltageV = n('voltageV', 0.8)
      const frequencyHz = n('frequencyMHz', 500) * 1e6
      const activityFactor = n('activityFactor', 0.15)
      const shortCircuitFraction = n('shortCircuitFraction', 0.15)

      const capacitanceF = capacitanceFf * 1e-15
      const switching = dynamicPowerWatts(capacitanceF, voltageV, frequencyHz, activityFactor)
      const total = shortCircuitPowerWatts(switching, shortCircuitFraction)
      const energyPerCycle = total / frequencyHz

      const atHalfVoltage = dynamicPowerWatts(capacitanceF, voltageV / 2, frequencyHz, activityFactor)

      return [
        {
          id: 'switching-power',
          label: { tr: 'Anahtarlama gücü', en: 'Switching power' },
          value: switching * 1000,
          unit: 'mW',
          basis: 'modelled',
          interpretation: {
            tr: 'α · C · V² · f, etkinlik faktörü α = %${(activityFactor * 100).toFixed(0)} ile.',
            en: 'α · C · V² · f, with activity factor α = ${(activityFactor * 100).toFixed(0)}%.',
          },
          warning: {
            tr: 'Sonuç büyük ölçüde etkinlik faktörü α’ya bağlıdır ve α bir girdidir, bir ölçüm değildir. Sanayi tipi bir RTL için 0,05 ile 0,30 arasında değişir; veri yolu yoğun bir çekirdekte 0,3’ün üzerine çıkabilir. En iyi durumda sonucu α’dan bağımsız kılmak için varsayılanı değiştirin ve aralığın iki ucunu karşılaştırın.',
            en: 'The result depends heavily on the activity factor α, and α is an input here, not a measurement. For industrial RTL it ranges from about 0.05 to 0.30, and can exceed 0.30 on a datapath-heavy core. To make the result less dependent on α, change the default and compare both ends of the range.',
          },
        },
        {
          id: 'total-dynamic-power',
          label: { tr: 'Toplam dinamik güç', en: 'Total dynamic power' },
          value: total * 1000,
          unit: 'mW',
          basis: 'modelled',
          warning:
            shortCircuitFraction > 0.3
              ? {
                  tr: 'Kısa devre katkısı alışılmadık derecede yüksek. Uzun yüksek-dönüşüm-zamanlı hatlar için beklenen bir durum.',
                  en: 'The short-circuit contribution is unusually high. Expected on paths with long high-fanout nets.',
                }
              : undefined,
        },
        {
          id: 'energy-per-cycle',
          label: { tr: 'Döngü başına enerji', en: 'Energy per cycle' },
          value: energyPerCycle * 1e12,
          unit: 'pJ',
          basis: 'modelled',
          interpretation: {
            tr: 'Dinamik güç / frekans. Saat frekansı iki katına çıkarsa bu değer yarıya iner — çünkü sabit bir enerji, yarı frekansta çalışıldığında daha çok iş yapar.',
            en: 'Dynamic power ÷ frequency. Doubling the clock halves this figure, because the same energy per operation buys twice as much work at half the frequency.',
          },
        },
        {
          id: 'power-at-half-voltage',
          label: { tr: 'Gerilim yarıya indirildiğinde güç', en: 'Power at half voltage' },
          value: atHalfVoltage * 1000,
          unit: 'mW',
          basis: 'modelled',
          interpretation: {
            tr: `Aynı frekansta ${voltageV / 2} V ile: ${(atHalfVoltage / total * 100).toFixed(0)}% güç. Kare bağımlılığı, gerilim düşürmenin ana kazancıdır — ama gecikme artar.`,
            en: `At ${voltageV / 2} V and the same frequency: ${(atHalfVoltage / total * 100).toFixed(0)}% of the power. The square dependence is the main benefit of lowering voltage — at the cost of delay.`,
          },
        },
      ]
    }

    case 'leakage': {
      const cellCount = n('cellCount', 50000)
      const referenceLeakageNa = n('referenceLeakageNa', 40) * 1e-9
      const widthUm = n('widthUm', 0.1)
      const referenceWidthUm = n('referenceWidthUm', 0.1)
      const voltageV = n('voltageV', 0.8)
      const temperatureC = n('temperatureC', 85)

      const perCell = leakageCurrentAmps(referenceLeakageNa, widthUm, referenceWidthUm, temperatureC)
      const totalAmps = perCell * cellCount
      const power = leakagePowerWatts(totalAmps, voltageV)
      // The same netlist at the nominal 25 °C corner, so the temperature multiplier is a
      // visible number rather than something the reader has to derive.
      const powerAt25 = leakagePowerWatts(
        leakageCurrentAmps(referenceLeakageNa, widthUm, referenceWidthUm, 25) * cellCount,
        voltageV,
      )

      return [
        {
          id: 'leakage-current',
          label: { tr: 'Toplam kaçak akım', en: 'Total leakage current' },
          value: totalAmps * 1e9,
          unit: 'mA',
          basis: 'modelled',
          interpretation: {
            tr: `${cellCount} hücre, ${temperatureC} °C bağlantı sıcaklığı.`,
            en: `${cellCount} cells at ${temperatureC} °C junction temperature.`,
          },
          warning: {
            tr: 'Referans kaçak akım değeri bu siteden gelmez; dökümhanenin kütüphane verisinden gelmelidir. Kaçak akım çeyreğin çoğunu kaplar ve bu araç yalnızca standart hücreleri hesaba katar — SRAM bit hücresi, I/O ve analog blok kaçak akımı burada yoktur.',
            en: 'The reference leakage value must come from the foundry’s library data, not from this site. Leakage is dominated by the quarter, and this tool counts standard cells only — SRAM bitcell, I/O and analog block leakage are all absent here.',
          },
        },
        {
          id: 'leakage-power',
          label: { tr: 'Kaçak gücü', en: 'Leakage power' },
          value: power * 1e6,
          unit: 'uW',
          basis: 'modelled',
        },
        {
          id: 'leakage-at-25c',
          label: { tr: 'Kaçak gücü, 25 °C', en: 'Leakage power at 25 °C' },
          value: powerAt25 * 1e6,
          unit: 'uW',
          basis: 'modelled',
          interpretation: {
            tr: `25 °C ile ${temperatureC} °C arasındaki fark: ${(power / powerAt25).toFixed(1)}×. Kaçak akım her 10 °C’de kabaca ikiye katlanır.`,
            en: `From 25 °C to ${temperatureC} °C that is ${(power / powerAt25).toFixed(1)}×. Leakage roughly doubles every 10 °C.`,
          },
          warning:
            power / powerAt25 > 10
              ? {
                  tr: 'Sıcaklık çarpanı 10×’un üzerinde. Müşteri sıcaklık aralığında en kötü köşede kaçak bütçesi aşılıyor olabilir.',
                  en: 'The temperature multiplier exceeds 10×. Leakage budget may be exceeded at the hot corner of the customer’s temperature range.',
                }
              : undefined,
        },
      ]
    }

    case 'area': {
      const gateEquivalents = n('gateEquivalents', 25000)
      const cellAreaUm2Value = n('cellAreaPerGate', 0.8)
      const overhead = n('routingOverhead', 0.4)
      const macroArea = n('macroArea', 0)
      const total = dieAreaUm2(gateEquivalents, cellAreaUm2Value, overhead, macroArea)
      const squareMm = Math.sqrt(total / 1e6)

      return [
        {
          id: 'cell-area',
          label: { tr: 'Hücre alanı', en: 'Cell area' },
          value: cellAreaUm2(gateEquivalents, cellAreaUm2Value),
          unit: 'um2',
          basis: 'modelled',
          interpretation: {
            tr: `${gateEquivalents} kapı eşdeğeri × ${cellAreaUm2Value} µm²/GE. Kapı sayısı yalnızca kütüphaneye göre anlamlıdır.`,
            en: `${gateEquivalents} gate equivalents × ${cellAreaUm2Value} µm²/GE. A gate count is only meaningful against its library.`,
          },
        },
        {
          id: 'total-area',
          label: { tr: 'Toplam çip alanı', en: 'Total die area' },
          value: total,
          unit: 'um2',
          basis: 'modelled',
        },
        {
          id: 'die-square',
          label: { tr: 'Kare kenar', en: 'Square edge' },
          value: squareMm,
          unit: 'um',
          basis: 'modelled',
          interpretation: {
            tr: 'Alanın kare kökü — doldurma oranı planlanırken pratik ölçüt.',
            en: 'Square root of the area — the practical figure when planning utilisation.',
          },
        },
        {
          id: 'routing-overhead',
          label: { tr: 'Yönlendirme yükü', en: 'Routing overhead' },
          value: overhead * 100,
          unit: 'percent',
          basis: 'modelled',
          warning: {
            tr: 'Yönlendirme yükü bir kütüphane ve doldurma oranı özelliğidir; varsayılan değer bir tahmindir.',
            en: 'Routing overhead is a property of the library and utilisation; the default is an estimate.',
          },
        },
      ]
    }

    case 'yield': {
      const defectDensity = n('defectDensity', 0.08)
      const dieAreaUm2Value = n('dieArea', 25_000_000)
      const dieAreaCm2 = dieAreaUm2Value / 1e8
      const yieldFraction = murphyYield(defectDensity, dieAreaCm2)

      return [
        {
          id: 'die-area-cm2',
          label: { tr: 'Çip alanı', en: 'Die area' },
          value: dieAreaCm2,
          unit: 'um2',
          basis: 'modelled',
          interpretation: {
            tr: 'Murphy modelinde N, cm² cinsinden alandır.',
            en: 'N in Murphy’s model is area in cm².',
          },
        },
        {
          id: 'yield',
          label: { tr: 'Verim', en: 'Yield' },
          value: yieldFraction * 100,
          unit: 'percent',
          basis: 'modelled',
          interpretation: {
            tr: 'Murphy modelinin kötümser sınırı. Gerçek verim genellikle modelden daha iyidir, çünkü bir kusur her çipi öldürmez.',
            en: 'Murphy’s model is the pessimistic bound. Real yield is usually better, because one defect does not kill every die.',
          },
          warning: {
            tr: 'D0 değeri bu siteden değil, ilgili dökümhanenin kusur verisinden gelmelidir. Kurgusal bir D0 ile hesaplanan verim, kurgusal bir sayıdır.',
            en: 'D0 must come from the foundry’s own defect data, not from this site. A yield computed from a fictional D0 is a fictional number.',
          },
        },
      ]
    }

    case 'cost-per-die': {
      const waferCost = n('waferCost', 4500)
      const waferDiameterMm = n('waferDiameter', 300)
      const dieAreaUm2Value = n('dieArea', 25_000_000)
      const scribeWidthUm = n('scribeWidth', 60)
      const edgeExclusionMm = n('edgeExclusion', 3)
      const defectDensity = n('defectDensity', 0.08)
      const dieAreaCm2 = dieAreaUm2Value / 1e8
      const dies = diesPerWafer(waferDiameterMm, dieAreaUm2Value, scribeWidthUm, edgeExclusionMm)
      const yieldFraction = murphyYield(defectDensity, dieAreaCm2)
      const cost = costPerGoodDieUsd(waferCost, dies, yieldFraction)

      return [
        {
          id: 'dies-per-wafer',
          label: { tr: 'Vaft başına çip', en: 'Dies per wafer' },
          value: dies,
          unit: 'count',
          basis: 'modelled',
        },
        {
          id: 'good-dies',
          label: { tr: 'Vaft başına iyi çip', en: 'Good dies per wafer' },
          value: Math.floor(dies * yieldFraction),
          unit: 'count',
          basis: 'modelled',
        },
        {
          id: 'cost-per-good-die',
          label: { tr: 'İyi çip başına maliyet', en: 'Cost per good die' },
          value: cost,
          unit: 'USD',
          basis: 'modelled',
          interpretation: {
            tr: 'Vaft maliyeti / (çip sayısı × verim). Verim düştükçe maliyet doğrusal değil, ters orantılı artar.',
            en: 'Wafer cost / (dies × yield). As yield falls, cost rises inversely, not linearly.',
          },
          warning: {
            tr: 'Maske ve NRE maliyetleri dahil değildir; bunlar ilk yıl için ayrıca amortisman konusudur.',
            en: 'Mask and NRE costs are excluded; those amortise separately and dominate the first year.',
          },
        },
      ]
    }

    case 'slack': {
      const clockPeriodNs = n('clockPeriod', 2.0)
      const clkToQNs = n('clkToQ', 0.12)
      const logicDelayNs = n('logicDelay', 0.9)
      const clockSkewNs = n('clockSkew', 0.05)
      const jitterNs = n('jitter', 0.02)
      const uncertaintyNs = n('uncertainty', 0.05)
      const requiredHoldNs = n('requiredHold', 0.05)

      const period = clockPeriodNs * 1e-9
      const setup = setupSlackSeconds(
        period,
        clkToQNs * 1e-9,
        logicDelayNs * 1e-9,
        clockSkewNs * 1e-9,
        jitterNs * 1e-9,
        uncertaintyNs * 1e-9,
      )
      const hold = holdSlackSeconds(
        fastCornerClkToQSeconds(clkToQNs),
        requiredHoldNs * 1e-9,
        clockSkewNs * 1e-9,
      )

      return [
        {
          id: 'setup-slack',
          label: { tr: 'Kurulum payı', en: 'Setup slack' },
          value: setup * 1e12,
          unit: 'ps',
          basis: 'modelled',
          warning:
            setup < 0
              ? {
                  tr: 'Kurulum payı negatif: tasarım bu köşede zamanlamayı karşılamıyor. Sıfıra kırpılmaz, çünkü kırpılmış bir sıfır “hemen geçti” gibi okunur ve bir başarısızlığı en tehlikeli biçimde bildirir.',
                  en: 'Setup slack is negative: this design does not meet timing at this corner. It is not clamped to zero, because a clamped zero reads as “just passed”, which is the most dangerous way to report a failure.',
                }
              : setup < period * 0.05
                ? {
                    tr: 'Kurulum payı sıfıra yakın. Bu köşe geçer, ama marj üzerinde yapılan hiçbir değişiklikle kaybolur.',
                    en: 'Setup slack is near zero. This corner passes, but any change made on the margin will lose it.',
                  }
                : undefined,
        },
        {
          id: 'hold-slack',
          label: { tr: 'Tutma payı', en: 'Hold slack' },
          value: hold * 1e12,
          unit: 'ps',
          basis: 'modelled',
          warning:
            hold < 0
              ? {
                  tr: 'Tutma payı negatif. Kurulum gecikmesi eklemek bu ihlali düzeltmez; yalnızca bir tampon ekler.',
                  en: 'Hold slack is negative. Adding setup delay does not fix this; only inserting a delay buffer does.',
                }
              : undefined,
        },
        {
          id: 'fmax-with-margin',
          label: { tr: 'Paylı maksimum frekans', en: 'Maximum frequency with margin' },
          value: setup > 0 ? 1 / (period - setup) / 1e6 : 0,
          unit: 'MHz',
          basis: 'modelled',
          interpretation: {
            tr: 'Kurulum payı gerçek frekansı düşürür; bu, payın çıkarılmış hâlidir.',
            en: 'Setup margin reduces the real frequency; this is it with the margin removed.',
          },
        },
      ]
    }

    case 'licence-economics': {
      const licenceFee = n('licenceFee', 85_000)
      const royalty = n('royaltyPerUnit', 2.5)
      const units = n('productionUnits', 50_000)
      const evalFee = n('evaluationFee', 5_000)

      const breakeven = royaltyBreakevenUnits(licenceFee, royalty)
      const totalAtVolume = licenceTotalCostUsd(licenceFee, royalty, units)

      return [
        {
          id: 'breakeven-units',
          label: { tr: 'Kırılma noktası', en: 'Breakeven volume' },
          value: Number.isFinite(breakeven) ? breakeven : 0,
          unit: 'count',
          basis: 'modelled',
          interpretation: Number.isFinite(breakeven)
            ? {
                tr: `${breakeven.toFixed(0)} adette peşin lisans ücreti ile birim başına royalti eşitlenir.`,
                en: `The up-front fee equals the per-unit royalty at ${breakeven.toFixed(0)} units.`,
              }
            : {
                tr: 'Royalti yok — kırılma noktası yoktur.',
                en: 'No royalty — no breakeven point.',
              },
          warning: {
            tr: 'Kırılma noktası bir fiyat karşılaştırmasıdır; üretim hacmi tahmininin belirsizliği bu hesabı tek başına belirsiz kılar.',
            en: 'The breakeven point is a price comparison; the uncertainty in the production forecast dominates it.',
          },
        },
        {
          id: 'total-cost',
          label: { tr: 'Toplam sahip olma maliyeti', en: 'Total cost of ownership' },
          value: totalAtVolume,
          unit: 'USD',
          basis: 'modelled',
          interpretation: {
            tr: `${units.toLocaleString('en-GB')} adet × ${royalty} $ + ${licenceFee.toLocaleString('en-GB')} $ peşin.`,
            en: `${units.toLocaleString('en-GB')} units × $${royalty} + $${licenceFee.toLocaleString('en-GB')} up front.`,
          },
        },
        {
          id: 'licence-plus-nre',
          label: { tr: 'Lisans + NRE karşılaştırması', en: 'Licence versus build-in-house' },
          value: evalFee + licenceFee,
          unit: 'USD',
          basis: 'modelled',
          interpretation: {
            tr: `Sıfırdan tasarım maliyeti ${evalFee.toLocaleString('en-GB')} $ kabul edilirse, bu noktada lisans kendini amorti etmiş olur.`,
            en: `If building from scratch is costed at $${evalFee.toLocaleString('en-GB')}, that is where the licence has paid for itself.`,
          },
        },
      ]
    }

    default: {
      const exhaustive: never = id
      return [
        {
          id: 'unknown',
          label: { tr: 'Bilinmeyen model', en: 'Unknown model' },
          value: 0,
          unit: 'count',
          basis: 'uncharacterised',
          interpretation: { tr: String(exhaustive), en: String(exhaustive) },
        },
      ]
    }
  }
}

function fastCornerClkToQSeconds(clkToQNs: number): number {
  // The minimum clk→Q corner is the fast corner, which is where hold is checked.
  // Derived as a fixed fraction of nominal rather than taken as a separate input,
  // because a tool that asks for both invites a caller to supply a *slower* corner for
  // a hold check — which would report hold violations that do not exist.
  return clkToQNs * 0.8e-9
}

/**
 * Exported so `content/tools.ts` can check its declared results against what the
 * dispatcher actually emits. A tool that declares a result the model does not produce
 * renders an empty row, and one that produces a result it did not declare renders a
 * row with no label.
 */
export function resultIdsFor(id: ToolId): readonly string[] {
  return runEngineering(id, {}).map((r) => r.id)
}
