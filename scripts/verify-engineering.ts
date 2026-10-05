/**
 * Engineering model verification — known-limit cases, not smoke tests.
 *
 * Run with `npm run verify:engineering`. Every assertion here is a *limit* of a model:
 * an asymptote it must reach, a monotonicity it must preserve, or a place where it is
 * known to stop being true. That is the same discipline as `verify-generator.ts` in the
 * reference project — assert the boundary behaviour, because a model that is wrong at
 * its limit is wrong everywhere and does not announce it.
 *
 * Two properties are checked for every tool with no exception:
 *
 * 1. **Every result is basis-bearing.** Nothing may emit an unqualified number.
 * 2. **The dispatcher is deterministic.** Same inputs, same outputs, twice — run twice
 *    per tool rather than once, because a tool that reads a clock or a random source
 *    would produce two different answers and only a second run catches it.
 */

import {
  elmoreDelaySeconds,
  logicalEffort,
  stageDelaySeconds,
  cascadeDelaySeconds,
  wireDelaySeconds,
  dynamicPowerWatts,
  shortCircuitPowerWatts,
  leakageCurrentAmps,
  leakagePowerWatts,
  cellAreaUm2,
  dieAreaUm2,
  sramAreaUm2,
  murphyYield,
  diesPerWafer,
  costPerGoodDieUsd,
  setupSlackSeconds,
  holdSlackSeconds,
  royaltyBreakevenUnits,
  licenceTotalCostUsd,
  runEngineering,
} from '../shared/engineering.ts'
import { TOOL_IDS } from '../shared/types.ts'

let failures = 0
let checks = 0

function check(label: string, condition: boolean, detail = ''): void {
  checks++
  if (condition) {
    console.log(`  ok    ${label}`)
  } else {
    failures++
    console.log(`  FAIL  ${label}${detail ? `\n        ${detail}` : ''}`)
  }
}

/** Asserts two numbers agree to within a relative tolerance. */
function near(actual: number, expected: number, tolerance = 1e-6): boolean {
  if (!Number.isFinite(actual) || !Number.isFinite(expected)) return actual === expected
  return Math.abs(actual - expected) / Math.max(1e-12, Math.abs(expected)) <= tolerance
}

function section(title: string): void {
  console.log(`\n${title}`)
  console.log('-'.repeat(title.length))
}

/* -------------------------------------------------------------------------- */
/* 1. Yield — Murphy's asymptotes                                              */
/* -------------------------------------------------------------------------- */

section('Murphy yield — the asymptotes')

/*
 * The model is Y = ((1−D)²/(1−D/2)²)^N. Two limits must hold, and the second is the
 * one a buggy implementation misses:
 *
 *   D → 0  ⇒  Y → 1     (a defect-free fab yields everything)
 *   D → 1  ⇒  Y → 0     (at D = 1 the numerator vanishes)
 *
 * A version without the `if (d >= 1) return 0` guard divides by a denominator that
 * approaches 1/4, not 0, so it returns a small positive number instead of 0 — which
 * would report a fab at 100% defect density as a low-but-nonzero yield rather than as
 * a total loss.
 */
check('yield → 1 as D → 0', near(murphyYield(0, 1e6), 1, 1e-9))
check('yield is exactly 1 at D = 0', murphyYield(0, 100) === 1)
check('yield → 0 as D → 1', murphyYield(0.999999, 1e6) < 1e-5)
check('yield is exactly 0 at D = 1', murphyYield(1, 1e6) === 0)
check('yield is 0 for D > 1 rather than NaN', murphyYield(1.5, 1e6) === 0)

/*
 * Monotonicity in both directions. A yield model that rises with defect density is
 * not a yield model, and it would be very hard to spot in the UI.
 */
let monoDown = true
let previousLow = 2
for (let d = 0.001; d < 0.5; d += 0.001) {
  const y = murphyYield(d, 25)
  if (y > previousLow + 1e-12) monoDown = false
  previousLow = y
}
// Iterating area *upward*, yield must fall. The first version of this asserted the
// opposite direction and failed on a correct model.
let monoDownInArea = true
let previousByArea = 2
for (let n = 1; n < 5000; n += 10) {
  const y = murphyYield(0.1, n)
  if (y > previousByArea + 1e-12) monoDownInArea = false
  previousByArea = y
}
check('yield decreases monotonically as D rises', monoDown)
check('yield decreases monotonically as area rises', monoDownInArea)

/* A worked figure, to catch an algebra slip that preserves monotonicity. */
check('a documented value reproduces', near(murphyYield(0.1, 1), (0.81 / 0.9025), 1e-12))

/* -------------------------------------------------------------------------- */
/* 2. Dies per wafer — the degenerate cases                                    */
/* -------------------------------------------------------------------------- */

section('Dies per wafer')

check('a die larger than the wafer yields 0, not NaN', diesPerWafer(300, 1e12, 60, 3) === 0)
check('a zero-area die yields 0, not NaN', diesPerWafer(300, 0, 60, 3) === 0)
check('edge exclusion consuming the wafer yields 0', diesPerWafer(300, 1e6, 60, 200) === 0)
check('a negative edge exclusion does not throw', Number.isFinite(diesPerWafer(300, 1e6, 60, -10)))
check('a bigger wafer holds more dies', diesPerWafer(300, 1e6, 60, 3) > diesPerWafer(200, 1e6, 60, 3))
check('a bigger die means fewer dies', diesPerWafer(300, 1e6, 60, 3) > diesPerWafer(300, 4e6, 60, 3))
check('a realistic small die gives a plausible count', (() => {
  const n = diesPerWafer(300, 1e6, 60, 3)
  return n > 10000 && n < 80000 // 300 mm, 1 mm² die
})())
/*
 * The scribe lane is part of the pitch, not added on top of it. The first version
 * summed the die area and the pitch area, which under-counted by the die area at every
 * step — small enough to look plausible, which is exactly why it needed an assertion.
 */
check('a wider scribe lane means fewer dies', diesPerWafer(300, 1e6, 200, 3) < diesPerWafer(300, 1e6, 60, 3))
check('the scribe lane is counted once, not twice', (() => {
  const zeroScribe = diesPerWafer(300, 1e6, 0, 3)
  const tight = diesPerWafer(300, 1e6, 1, 3)
  // A 1 µm lane on a 1000 µm die must be nearly indistinguishable from no lane. A
  // double-count would put it near half.
  return tight === zeroScribe || tight > zeroScribe * 0.95
})())

/* Cost per good die: the infinity guard. */
check('zero yield gives Infinity, not NaN', costPerGoodDieUsd(4500, 20000, 0) === Number.POSITIVE_INFINITY)
check('negative yield gives Infinity, not a negative price', costPerGoodDieUsd(4500, 20000, -0.5) === Number.POSITIVE_INFINITY)
check('cost scales inversely with yield', near(costPerGoodDieUsd(4500, 20000, 0.5), costPerGoodDieUsd(4500, 20000, 1) * 2))
check('cost is finite and positive on a normal input', (() => {
  const c = costPerGoodDieUsd(4500, 45000, 0.85)
  return Number.isFinite(c) && c > 0 && c < 1000
})())

/* -------------------------------------------------------------------------- */
/* 3. Delay                                                                     */
/* -------------------------------------------------------------------------- */

section('Delay')

check('Elmore delay is 0.69·R·C', near(elmoreDelaySeconds(1000, 1e-12), 0.69 * 1000 * 1e-12))
check('zero resistance gives zero delay', elmoreDelaySeconds(0, 1e-12) === 0)
check('zero capacitance gives zero delay', elmoreDelaySeconds(1000, 0) === 0)
check('unit effort at zero parasitic leaves only intrinsic', near(stageDelaySeconds(1, 0, 6e-12), 6e-12))
check('stage delay scales linearly with effort', near(stageDelaySeconds(2, 10e-12, 0), stageDelaySeconds(1, 10e-12, 0) * 2))
check('cascading N identical stages gives N times one', near(cascadeDelaySeconds([1e-9, 1e-9, 1e-9]), 3e-9))
check('an empty cascade is zero, not NaN', cascadeDelaySeconds([]) === 0)

check('unit effort is 1.0', near(logicalEffort(1e-15, 1e-15), 1))
check('zero input capacitance gives Infinity, not NaN', logicalEffort(0, 1e-15) === Number.POSITIVE_INFINITY)

check('wire delay is positive for a real line', wireDelaySeconds(2, 40, 140, 0.08) > 0)
check('a wider wire is faster (fewer squares)', wireDelaySeconds(2, 80, 140, 0.08) < wireDelaySeconds(2, 40, 140, 0.08))
check('a longer wire is slower', wireDelaySeconds(4, 40, 140, 0.08) > wireDelaySeconds(2, 40, 140, 0.08))
check('a zero-length wire has no delay', wireDelaySeconds(0, 40, 140, 0.08) === 0)

/* -------------------------------------------------------------------------- */
/* 4. Power — the square on V is the whole point                               */
/* -------------------------------------------------------------------------- */

section('Power')

check('P = α·C·V²·f reproduces exactly', near(dynamicPowerWatts(2.5e-12, 0.8, 500e6, 0.15), 0.15 * 2.5e-12 * 0.64 * 500e6))
check('halving V quarters the power', near(dynamicPowerWatts(2.5e-12, 0.4, 500e6, 0.15), dynamicPowerWatts(2.5e-12, 0.8, 500e6, 0.15) / 4))
check('doubling V quadruples the power', near(dynamicPowerWatts(2.5e-12, 1.6, 500e6, 0.15), dynamicPowerWatts(2.5e-12, 0.8, 500e6, 0.15) * 4))
check('zero activity gives zero power', dynamicPowerWatts(2.5e-12, 0.8, 500e6, 0) === 0)
check('power is linear in frequency', near(dynamicPowerWatts(1e-12, 1, 100e6, 1) * 2, dynamicPowerWatts(1e-12, 1, 200e6, 1)))
check('short-circuit adds a stated fraction', near(shortCircuitPowerWatts(100, 0.15), 115))
check('zero short-circuit fraction returns the input', shortCircuitPowerWatts(100, 0) === 100)

/* -------------------------------------------------------------------------- */
/* 5. Leakage — the temperature exponential                                    */
/* -------------------------------------------------------------------------- */

section('Leakage')

check('leakage at the reference condition equals the reference', near(leakageCurrentAmps(40e-9, 0.1, 0.1, 25), 40e-9))
check('double the width doubles the leakage', near(leakageCurrentAmps(40e-9, 0.2, 0.1, 25), 80e-9))
check('leakage rises with temperature', leakageCurrentAmps(40e-9, 0.1, 0.1, 85) > leakageCurrentAmps(40e-9, 0.1, 0.1, 25))
check('leakage falls below the reference when cold', leakageCurrentAmps(40e-9, 0.1, 0.1, 0) < 40e-9)

/*
 * The familiar "doubles every 10 °C" is a rule of thumb, not a law, and the exact form
 * is sensitive to dV_th/dT and the body factor. At the defaults (2 mV/°C, n = 1.2) it
 * gives about 1.8× per 10 °C and roughly 25× over 60 °C from 25 °C to 85 °C.
 *
 * ⚠️ The first implementation of this model had no V_th in it at all — just a constant
 * divided by temperature — so the exponent evaluated to about −0.001 over 60 °C and
 * leakage came out exactly 1.0× independent of temperature. The assertion below is
 * what caught it, and it is a *range* rather than the folk figure precisely because
 * quoting 60× would have been a second, subtler falsehood.
 */
const leakageRatio = leakageCurrentAmps(40e-9, 0.1, 0.1, 85) / leakageCurrentAmps(40e-9, 0.1, 0.1, 25)
check(`60 °C rise multiplies leakage by ~25× (got ${leakageRatio.toFixed(1)}×)`, leakageRatio > 15 && leakageRatio < 40)
check('10 °C rise is close to a doubling', (() => {
  const r = leakageCurrentAmps(40e-9, 0.1, 0.1, 35) / leakageCurrentAmps(40e-9, 0.1, 0.1, 25)
  return r > 1.5 && r < 2.5
})())
check('leakage rise is monotonic across the temperature range', (() => {
  let last = 0
  for (let t = -40; t <= 125; t += 5) {
    const v = leakageCurrentAmps(40e-9, 0.1, 0.1, t)
    if (v <= last) return false
    last = v
  }
  return true
})())
check('a steeper dV_th/dT gives more leakage', leakageCurrentAmps(40e-9, 0.1, 0.1, 85, 0.004) > leakageCurrentAmps(40e-9, 0.1, 0.1, 85, 0.001))
check('leakage power is I·V', near(leakagePowerWatts(1e-6, 0.8), 0.8e-6))
check('leakage power is 0 at 0 V', leakagePowerWatts(1e-6, 0) === 0)

/* -------------------------------------------------------------------------- */
/* 6. Area                                                                      */
/* -------------------------------------------------------------------------- */

section('Area')

check('cell area is gates × cell area', near(cellAreaUm2(25000, 0.8), 20000))
check('zero gates is zero area', cellAreaUm2(0, 0.8) === 0)
check('overhead increases area', dieAreaUm2(25000, 0.8, 0.4) > dieAreaUm2(25000, 0.8, 0))
check('zero overhead leaves cell area unchanged', near(dieAreaUm2(25000, 0.8, 0), 20000))
check('macros are added after the overhead', (() => {
  const withMacro = dieAreaUm2(25000, 0.8, 0.5, 1000)
  const withoutMacro = dieAreaUm2(25000, 0.8, 0.5, 0)
  return near(withMacro - withoutMacro, 1000)
})())
check('SRAM periphery is a multiplier', near(sramAreaUm2(1e6, 0.06, 1.3), 78000))
check('SRAM with periphery 1.0 is the bitcell area alone', near(sramAreaUm2(1e6, 0.06, 1), 60000))

/* -------------------------------------------------------------------------- */
/* 7. Timing closure — slack must stay signed                                  */
/* -------------------------------------------------------------------------- */

section('Timing closure')

/*
 * The one that matters: **negative slack must survive as negative.** A result clamped
 * at zero reads as "just barely passing", which is the most dangerous way to report a
 * timing failure — a design that does not close would appear to close, marginally.
 */
const failingSetup = setupSlackSeconds(1e-9, 0.12e-9, 1.2e-9, 0.05e-9, 0.02e-9, 0.05e-9)
check('a failing path reports negative setup slack', failingSetup < 0, `got ${(failingSetup * 1e12).toFixed(1)} ps`)
check('the magnitude is preserved, not truncated', failingSetup < -0.4e-9)

const passingSetup = setupSlackSeconds(2e-9, 0.12e-9, 0.9e-9, 0.05e-9, 0.02e-9, 0.05e-9)
check('a closing path reports positive setup slack', passingSetup > 0, `got ${(passingSetup * 1e12).toFixed(1)} ps`)
check('slack + arrival = required (the subtraction is exact)', (() => {
  const period = 2e-9, skew = 0.05e-9, jitter = 0.02e-9, unc = 0.05e-9
  const slack = setupSlackSeconds(period, 0.12e-9, 0.9e-9, skew, jitter, unc)
  const required = period - skew - jitter - unc
  return near(slack + (0.12e-9 + 0.9e-9), required)
})())

/*
 * Skew, jitter and uncertainty are penalties that *narrow* the window, so each must
 * reduce slack. The first implementation of setupSlackSeconds put the two sides on the
 * other way round, which made every one of these three run backwards — and made a
 * slower path look faster. These four assertions are the ones that caught it.
 */
check('more skew reduces setup slack', setupSlackSeconds(2e-9, 0.12e-9, 0.9e-9, 0.3e-9, 0.02e-9, 0.05e-9) < passingSetup)
check('more jitter reduces setup slack', setupSlackSeconds(2e-9, 0.12e-9, 0.9e-9, 0.05e-9, 0.4e-9, 0.05e-9) < passingSetup)
check('more uncertainty reduces setup slack', setupSlackSeconds(2e-9, 0.12e-9, 0.9e-9, 0.05e-9, 0.02e-9, 0.4e-9) < passingSetup)
check('a shorter clock reduces setup slack', setupSlackSeconds(1.5e-9, 0.12e-9, 0.9e-9, 0.05e-9, 0.02e-9, 0.05e-9) < passingSetup)
check('a slower path reduces setup slack', setupSlackSeconds(2e-9, 0.12e-9, 1.4e-9, 0.05e-9, 0.02e-9, 0.05e-9) < passingSetup)

/*
 * Setup and hold run in opposite directions. This is why fixing a setup violation by
 * adding delay routinely breaks hold, and it is the reason the two are separate
 * functions rather than one parameterised one.
 */
check('setup and slack move in opposite directions with delay', (() => {
  const fast = setupSlackSeconds(2e-9, 0.12e-9, 0.4e-9, 0.02e-9, 0.01e-9, 0.02e-9)
  const slow = setupSlackSeconds(2e-9, 0.12e-9, 0.8e-9, 0.02e-9, 0.01e-9, 0.02e-9)
  return fast > slow
})())

check('a failing hold reports negative slack', holdSlackSeconds(0.08e-9, 0.05e-9, 0.05e-9) < 0)
check('a passing hold reports positive slack', holdSlackSeconds(0.2e-9, 0.05e-9, 0.02e-9) > 0)
check('more skew reduces hold slack', holdSlackSeconds(0.2e-9, 0.05e-9, 0.3e-9) < holdSlackSeconds(0.2e-9, 0.05e-9, 0.02e-9))
check('a longer required hold reduces hold slack', holdSlackSeconds(0.2e-9, 0.15e-9, 0.02e-9) < holdSlackSeconds(0.2e-9, 0.05e-9, 0.02e-9))
check('hold slack is the exact subtraction', near(holdSlackSeconds(0.2e-9, 0.05e-9, 0.02e-9), 0.2e-9 - 0.02e-9 - 0.05e-9))

/* -------------------------------------------------------------------------- */
/* 8. Licence economics                                                         */
/* -------------------------------------------------------------------------- */

section('Licence economics')

check('breakeven is fee ÷ royalty', near(royaltyBreakevenUnits(85_000, 2.5), 34_000))
check('a royalty-free licence has no breakeven point', royaltyBreakevenUnits(85_000, 0) === Number.POSITIVE_INFINITY)
check('a negative royalty gives Infinity, not a negative breakeven', royaltyBreakevenUnits(85_000, -1) === Number.POSITIVE_INFINITY)
check('a zero fee breaks even immediately', royaltyBreakevenUnits(0, 2.5) === 0)
check('total cost is affine in volume', near(licenceTotalCostUsd(85_000, 2.5, 50_000), 85_000 + 125_000))
check('total cost at zero volume is just the fee', licenceTotalCostUsd(85_000, 2.5, 0) === 85_000)
check('doubling volume adds double the royalty, not double the total', (() => {
  const a = licenceTotalCostUsd(85_000, 2.5, 10_000)
  const b = licenceTotalCostUsd(85_000, 2.5, 20_000)
  return near(b - a, 25_000)
})())

/* -------------------------------------------------------------------------- */
/* 9. Dispatcher invariants — every tool, no exception                         */
/* -------------------------------------------------------------------------- */

section('Dispatcher invariants')

/** A realistic input set per tool, so each is exercised with more than zeros. */
const SAMPLE_INPUTS: Record<string, Record<string, number>> = {
  'critical-path': { stages: 12, effort: 1.8, parasiticDelayPs: 14, intrinsicDelayPs: 5, wireLengthMm: 3, wireWidthNm: 40, wireCapFfPerMm: 150, sheetResistanceOhm: 0.07 },
  'dynamic-power': { capacitanceFf: 3000, voltageV: 0.72, frequencyMHz: 800, activityFactor: 0.2, shortCircuitFraction: 0.12 },
  leakage: { cellCount: 80_000, referenceLeakageNa: 50, widthUm: 0.1, referenceWidthUm: 0.1, voltageV: 0.72, temperatureC: 105 },
  area: { gateEquivalents: 40_000, cellAreaPerGate: 0.062, routingOverhead: 0.45, macroArea: 250_000 },
  yield: { defectDensity: 0.05, dieArea: 4e7 },
  'cost-per-die': { waferCost: 6000, waferDiameter: 300, dieArea: 4e7, scribeWidth: 60, edgeExclusion: 3, defectDensity: 0.05 },
  slack: { clockPeriod: 1.5, clkToQ: 0.1, logicDelay: 0.8, clockSkew: 0.06, jitter: 0.03, uncertainty: 0.04, requiredHold: 0.05 },
  'licence-economics': { licenceFee: 120_000, royaltyPerUnit: 1.8, productionUnits: 200_000, evaluationFee: 900_000 },
}

for (const id of TOOL_IDS) {
  const input = SAMPLE_INPUTS[id] ?? {}
  const first = runEngineering(id, input)
  const second = runEngineering(id, input)

  check(`${id}: produces results`, first.length > 0)
  check(`${id}: is deterministic across two runs`, JSON.stringify(first) === JSON.stringify(second))

  const allBearing = first.every((r) => r.basis === 'measured' || r.basis === 'modelled' || r.basis === 'uncharacterised')
  check(`${id}: every result carries a basis`, allBearing)

  const allFinite = first.every((r) => r.basis === 'uncharacterised' || Number.isFinite(r.value))
  check(`${id}: every value is finite (or explicitly uncharacterised)`, allFinite, first.filter((r) => !Number.isFinite(r.value)).map((r) => `${r.id}=${r.value}`).join(', '))

  const allBilingual = first.every(
    (r) => typeof r.label.tr === 'string' && typeof r.label.en === 'string' && r.label.tr.trim() !== '' && r.label.en.trim() !== '',
  )
  check(`${id}: every label is bilingual`, allBilingual, first.filter((r) => !r.label.tr || !r.label.en).map((r) => r.id).join(', '))

  const allHaveUnit = first.every((r) => typeof r.unit === 'string' && r.unit.length > 0)
  check(`${id}: every result names a unit (never a baked-in string)`, allHaveUnit)

  const ids = first.map((r) => r.id)
  check(`${id}: result ids are unique`, new Set(ids).size === ids.length)
}

/* -------------------------------------------------------------------------- */
/* 10. The invariants that hold across the whole set                           */
/* -------------------------------------------------------------------------- */

section('Cross-tool invariants')

/**
 * **No result may carry a pre-formatted value.**
 *
 * The reference project's calculator returned `{ value: \`${fmt(x,2)} kn\` }`. This is
 * the assertion that the port actually fixed it: `value` must always be a `number`, and
 * the unit must always be a separate `FigureUnit`. If someone re-bakes the formatting,
 * this fails — and it is the failure that would render `12.34` on a Turkish page.
 */
const anyStringValue = TOOL_IDS.flatMap((id) => runEngineering(id, SAMPLE_INPUTS[id] ?? {}))
  .filter((r) => typeof (r as { value: unknown }).value !== 'number')
check('no result bakes a formatted string into `value`', anyStringValue.length === 0)

/**
 * **Every tool warns.**
 *
 * Not decoration. These are models with no characterised silicon behind them, and the
 * `EngineeringNotice` above the results cannot be weakened per-page. A tool with no
 * warning at all is a page where the caveat is the only thing standing between a
 * modelled number and a tapeout decision.
 */
const toolsWithoutWarnings = TOOL_IDS.filter(
  (id) => !runEngineering(id, SAMPLE_INPUTS[id] ?? {}).some((r) => r.warning),
)
check('every tool emits at least one warning', toolsWithoutWarnings.length === 0, toolsWithoutWarnings.join(', '))

/** A result must never be an unqualified assertion. `measured` requires real silicon. */
const anyMeasured = TOOL_IDS.flatMap((id) => runEngineering(id, SAMPLE_INPUTS[id] ?? {})).filter((r) => r.basis === 'measured')
check('no tool claims a measured basis (there is no characterised silicon)', anyMeasured.length === 0)

/* -------------------------------------------------------------------------- */

console.log(`\n${'='.repeat(60)}`)
if (failures === 0) {
  console.log(`verify:engineering passed — ${checks} checks`)
} else {
  console.log(`verify:engineering FAILED — ${failures} of ${checks} checks failed`)
  process.exit(1)
}
