import { useState } from 'react'
import { useSite } from '../lib/site.tsx'
import { mcpStaticMode } from '../lib/staticMode.ts'

/**
 * CodeBlock — a copy-buttoned configuration snippet.
 *
 * The button is a client affordance, so the static prerender renders the block
 * without it: with JavaScript off a button that announces itself and does
 * nothing would be the exact "dead affordance" class the polish pass removed
 * elsewhere. Without JS the code is still fully selectable text; with JS the
 * same block carries the button.
 */
export function CodeBlock({
  code,
  name,
  lang,
  hint,
}: {
  code: string
  name?: string
  lang?: string
  /** Trailing advice shown under the snippet, e.g. where it goes. */
  hint?: string
}) {
  const { strings } = useSite()
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // A clipboard refusal (permissions, HTTP downgraded) is not an error to
      // report; the reader can still select the text.
    }
  }

  return (
    <figure className="overflow-hidden rounded-lg border border-line bg-paper/60">
      <figcaption className="flex items-center justify-between gap-4 border-b border-line px-4 py-2 font-mono text-[11px] tracking-wide">
        <span className="truncate text-gold">{name ?? lang}</span>
        {!mcpStaticMode() ? (
          <button
            type="button"
            onClick={copy}
            aria-label={strings.common.copy}
            className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-mist transition-colors hover:text-ink"
          >
            {copied ? `✓ ${strings.common.copied}` : strings.common.copy.toUpperCase()}
          </button>
        ) : null}
      </figcaption>
      {/* `whitespace-pre` keeps every snippet's exact spacing copyable; the
          tabIndex makes the horizontal scroll reachable from the keyboard
          (axe's scrollable-region-focusable rule). */}
      <pre tabIndex={0} className="overflow-x-auto px-4 py-3 font-mono text-[12px] leading-relaxed text-mist">
        <code>{code}</code>
      </pre>
      {hint ? <p className="border-t border-line px-4 py-2 text-[11px] text-mist/70">{hint}</p> : null}
    </figure>
  )
}
