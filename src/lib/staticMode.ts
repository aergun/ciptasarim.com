/**
 * The module-scoped static-render flag for the /mcp page.
 *
 * `scripts/prerender-mcp.ts` flips it `true` before `renderToStaticMarkup`, so
 * the one page that must survive without JavaScript renders its client-only
 * affordances off: the code blocks' copy buttons, the demo video's lazy-src
 * (the poster and controls still render, and the file loads on a real browser)
 * and the replay terminal's pacing (the static branch renders the full log and
 * the gate, which reduced-motion users get too).
 *
 * A module flag over a context because the flag is read before any provider
 * could influence it — it describes *the renderer*, not the reader.
 */

let staticMode = false

export function setStaticMode(value: boolean): void {
  staticMode = value
}

export function mcpStaticMode(): boolean {
  return staticMode
}
