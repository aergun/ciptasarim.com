/*
 * Shared UI primitives, ported from the reference project and re-coloured to
 * this site's palette.
 *
 * One file, because these are small and always used together, and splitting
 * twenty two-line components across twenty files would be worse. The
 * discipline they hold to: nothing here knows what a core is, and nothing
 * here fetches. A page composes them; the components stay dumb.
 *
 * ## The recolour is a map, not a reskin
 *
 *  - `ink-mute` (the reference's body copy) is `mist` here.
 *  - Form fields sat on `bg-white`; this palette has no white — fields sit on
 *    `paper`, the page's own field colour, and the page itself sits on `stage`.
 *  - Every literal `white` in the reference became `text-paper`: the palette
 *    deliberately has no white, so inverted copy is off-white like everywhere
 *    else on the site.
 *  - `EngineeringNotice` is **rewritten, not translated** — see below.
 */

import { forwardRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { pick } from '../../shared/i18n.ts'
import type { T } from '../../shared/types.ts'
import { useSite } from '../lib/site.tsx'

/* -------------------------------------------------------------------------
 * Typography
 * ---------------------------------------------------------------------- */

/** The small tracked label above a heading. */
export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`eyebrow ${className}`}>{children}</p>
}

/** A display heading. `level` picks the tag without changing the type. */
export function Heading({
  children,
  level = 2,
  className = '',
  as: Tag = 'h2',
}: {
  children: ReactNode
  level?: 1 | 2 | 3 | 4
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4'
}) {
  void level
  const sizes: Record<string, string> = {
    h1: 'text-display-lg',
    h2: 'text-display',
    h3: 'text-display-sm',
    h4: 'text-xl',
  }
  return <Tag className={`${sizes[Tag]} text-ink ${className}`}>{children}</Tag>
}

/** Body copy. `prose` applies the measure constraint that long text needs. */
export function Prose({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`max-w-[62ch] text-[15px] leading-[1.75] text-mist ${className}`}>{children}</div>
  )
}

export function Rule({ className = '' }: { className?: string }) {
  return <hr className={`rule ${className}`} />
}

/* -------------------------------------------------------------------------
 * Layout
 * ---------------------------------------------------------------------- */

export function Container({
  children,
  className = '',
  width = 'default',
}: {
  children: ReactNode
  className?: string
  width?: 'default' | 'wide' | 'narrow'
}) {
  const widths = {
    default: 'max-w-shell',
    wide: 'max-w-[92rem]',
    narrow: 'max-w-[48rem]',
  }
  return <div className={`mx-auto w-full ${widths[width]} px-6 md:px-10 ${className}`}>{children}</div>
}

/** A page's opening block: eyebrow, heading, and an optional lede. */
export function PageHeader({
  eyebrow,
  title,
  lede,
  className = '',
}: {
  eyebrow?: string
  title: string
  lede?: ReactNode
  className?: string
}) {
  return (
    <header className={`animate-rise border-b border-line pb-10 ${className}`}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <Heading as="h1" className="mt-4 max-w-[18ch]">
        {title}
      </Heading>
      {lede ? <Prose className="mt-6 text-[17px] leading-[1.65] text-mist">{lede}</Prose> : null}
    </header>
  )
}

export function Section({
  children,
  className = '',
  id,
}: {
  children: ReactNode
  className?: string
  id?: string
}) {
  return (
    <section id={id} className={`py-20 md:py-28 ${className}`}>
      {children}
    </section>
  )
}

/** A section on the deep navy, for breaking up a long light page. */
export function InvertedSection({
  children,
  className = '',
  id,
}: {
  children: ReactNode
  className?: string
  id?: string
}) {
  return (
    <section id={id} className={`bg-ink py-20 text-paper md:py-28 ${className}`}>
      {children}
    </section>
  )
}

/* -------------------------------------------------------------------------
 * Controls
 * ---------------------------------------------------------------------- */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

const BUTTON_STYLES: Record<ButtonVariant, string> = {
  primary: 'bg-ink text-paper hover:bg-ink-soft',
  secondary: 'border border-ink text-ink hover:bg-ink hover:text-paper',
  ghost: 'text-mist hover:text-ink',
  danger: 'border border-line text-mist hover:border-flare hover:text-flare',
}

/**
 * The same four variants on the deep navy, for use inside `InvertedSection`.
 *
 * This exists because the light palette is unreadable on `bg-ink`: a primary
 * button is `bg-ink text-paper`, which on a navy section is a navy button with
 * no edge. Rather than make every page remember a second set of class names,
 * `inverted` is a prop. The hover targets are chosen so the accent still reads
 * as an accent rather than washing out.
 */
const BUTTON_STYLES_INVERTED: Record<ButtonVariant, string> = {
  primary: 'bg-paper text-ink hover:bg-flare hover:text-paper',
  secondary: 'border border-paper/40 text-paper hover:border-paper hover:bg-paper hover:text-ink',
  ghost: 'text-paper/70 hover:text-paper',
  danger: 'border border-flare/60 text-flare hover:bg-flare hover:text-paper',
}

function buttonClass(variant: ButtonVariant, inverted: boolean, className: string, disabled = false): string {
  const palette = inverted ? BUTTON_STYLES_INVERTED : BUTTON_STYLES
  return `inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-[11px] font-semibold uppercase tracking-wider transition-colors duration-200 ${palette[variant]} ${disabled ? 'cursor-not-allowed opacity-40' : ''} ${className}`
}

export function Button({
  children,
  variant = 'primary',
  inverted = false,
  className = '',
  disabled,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  inverted?: boolean
}) {
  return (
    <button
      className={buttonClass(variant, inverted, className, disabled)}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  )
}

/** A button that navigates. Same visual language, real anchor semantics. */
export function ButtonLink({
  children,
  to,
  variant = 'primary',
  inverted = false,
  className = '',
}: {
  children: ReactNode
  to: string
  variant?: ButtonVariant
  inverted?: boolean
  className?: string
}) {
  return (
    <Link to={to} className={buttonClass(variant, inverted, className)}>
      {children}
    </Link>
  )
}

export function Field({
  label,
  hint,
  error,
  children,
  className = '',
}: {
  label: string
  hint?: string
  error?: string
  children: ReactNode
  className?: string
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.24em] text-mist">
        {label}
      </span>
      {children}
      {error ? (
        <span className="mt-2 block text-[12px] text-flare">{error}</span>
      ) : hint ? (
        <span className="mt-2 block text-[12px] leading-relaxed text-mist">{hint}</span>
      ) : null}
    </label>
  )
}

const INPUT_STYLES =
  'w-full rounded-lg border border-line bg-paper px-4 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-mist/60 focus:border-ink'

/*
 * The form controls forward their refs.
 *
 * Without this, a page that needs the DOM node — to focus the first invalid
 * field on a failed submit, or to hand the element to a rich editor — has no way
 * in and ends up in `document.querySelector`, which silently breaks the moment
 * two of these are on the page. Forwarding is free, and it is the difference
 * between "ref" and "a string selector that happens to work today".
 */
export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = '', ...rest }, ref) {
    return <input ref={ref} className={`${INPUT_STYLES} ${className}`} {...rest} />
  },
)

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className = '', ...rest }, ref) {
    return <textarea ref={ref} className={`${INPUT_STYLES} min-h-[7rem] resize-y ${className}`} {...rest} />
  },
)

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className = '', ...rest }, ref) {
    return <select ref={ref} className={`${INPUT_STYLES} ${className}`} {...rest} />
  },
)

/* -------------------------------------------------------------------------
 * Data display
 * ---------------------------------------------------------------------- */

/** A specification table. Rows come from the content modules, not from markup. */
export function SpecTable({
  rows,
  className = '',
}: {
  rows: { label: string; value: ReactNode }[]
  className?: string
}) {
  return (
    <dl className={`divide-y divide-line border-y border-line ${className}`}>
      {rows.map((row, index) => (
        <div key={index} className="flex items-baseline justify-between gap-6 py-3">
          <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-mist">{row.label}</dt>
          <dd className="text-right font-mono text-[13px] text-ink tabular">{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}

/** The single number most pages want to lead with. */
export function Stat({ value, label, className = '' }: { value: ReactNode; label: string; className?: string }) {
  return (
    <div className={className}>
      <p className="font-mono text-[clamp(1.6rem,3vw,2.4rem)] leading-none tracking-[-0.02em] text-ink tabular">{value}</p>
      <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-mist">{label}</p>
    </div>
  )
}

export function Badge({
  children,
  tone = 'neutral',
  className = '',
}: {
  children: ReactNode
  /** `danger` is the modelled-figure colour: look before you use this number. */
  tone?: 'neutral' | 'accent' | 'success' | 'muted' | 'danger'
  className?: string
}) {
  const tones = {
    neutral: 'border-line text-mist',
    // `accent`/`danger` both carry flare: a warning is a warning in every role.
    accent: 'border-flare/40 text-flare',
    // `success` is the provenance green — and on this site it is used for
    // measured figures and almost nothing else, so let that role own it.
    success: 'border-proven/40 text-proven',
    muted: 'border-transparent bg-stage text-mist',
    danger: 'border-flare/40 bg-flare/[0.04] text-flare',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

export function Tag({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-stage px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-mist ${className}`}
    >
      {children}
    </span>
  )
}

/* -------------------------------------------------------------------------
 * States
 * ---------------------------------------------------------------------- */

/**
 * The engineering disclaimer, in both languages, in one place.
 *
 * Every calculator, every drawing and every modelled figure carries it. It is
 * stated once, here, so it cannot be reworded differently on ten pages and
 * slowly drift into meaning something weaker — and on a two-locale site that
 * risk is doubled, because the weaker reading could take the English sentence
 * out of sync with the Turkish one silently. Prose lives with the component,
 * not in the locale bundle, because it is not a reused label: it is the single
 * load-bearing sentence of the site's honesty.
 */
export function EngineeringNotice({ className = '' }: { className?: string }) {
  const { locale } = useSite()
  const text: T = {
    tr: 'Ön mühendislik aracı. Buradaki değerler, girmiş olduğunuz sayılardan standart ampirik ilişkiler kullanılarak hesaplanır. Bu değerler gerçek bir silikon karakterizasyonuna dayanmaz; sağlanan modellerin geçerlilik aralığı dışına çıkıldığında yalnızca matematik doğruluktur. Bu sayfalar profesyonel tasarım analizinin yerine geçmez ve bir tape-out kararının temeli olarak kullanılamaz.',
    en: 'Preliminary engineering tool. Figures here are computed from the values you enter, using standard empirical relationships. They are not backed by characterised silicon; outside the stated validity ranges of the models only the arithmetic is correct. These pages are not a substitute for professional design analysis, and must not be used as the basis for a tape-out decision.',
  }
  return (
    <p className={`border-l-2 border-flare/50 pl-4 text-[12px] leading-relaxed text-mist ${className}`}>
      {pick(text, locale)}
    </p>
  )
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string
  body: string
  action?: ReactNode
}) {
  return (
    <div className="border border-dashed border-line px-8 py-20 text-center">
      <Heading as="h3" className="text-2xl">
        {title}
      </Heading>
      <Prose className="mx-auto mt-4 text-center">{body}</Prose>
      {action ? <div className="mt-8 flex justify-center">{action}</div> : null}
    </div>
  )
}

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <span
      role="status"
      aria-hidden="true"
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-line border-t-ink ${className}`}
    />
  )
}

/** Loading takes its label, because "Loading" is a string a bilingual site renders. */
export function Loading({ label }: { label: string }) {
  const { strings } = useSite()
  return (
    <div className="flex items-center justify-center gap-3 py-24 text-mist">
      <Spinner />
      <span className="text-[11px] uppercase tracking-[0.2em]">{label ?? strings.common.loading}</span>
    </div>
  )
}

/** The error state for a page whose data could not be loaded. */
export function ErrorState({
  message,
  retryLabel,
  onRetry,
}: {
  message: string
  retryLabel?: string
  onRetry?: () => void
}) {
  const { strings } = useSite()
  return (
    <div className="border border-flare/30 bg-flare/[0.03] px-8 py-16 text-center">
      <Heading as="h3" className="text-2xl">
        {strings.common.error}
      </Heading>
      <Prose className="mx-auto mt-4 text-center">{message}</Prose>
      {onRetry ? (
        <div className="mt-8 flex justify-center">
          <Button variant="secondary" onClick={onRetry}>
            {retryLabel ?? strings.common.retry}
          </Button>
        </div>
      ) : null}
    </div>
  )
}

/** A dismissible message, used for form-level success and failure. */
export function Notice({
  tone = 'info',
  children,
  className = '',
}: {
  tone?: 'info' | 'error' | 'success'
  children: ReactNode
  className?: string
}) {
  const tones = {
    info: 'border-line bg-stage/60 text-mist',
    error: 'border-flare/40 bg-flare/[0.04] text-flare',
    success: 'border-proven/40 bg-proven/[0.04] text-proven',
  }
  return (
    <div role="status" className={`border px-4 py-3 text-[13px] leading-relaxed ${tones[tone]} ${className}`}>
      {children}
    </div>
  )
}