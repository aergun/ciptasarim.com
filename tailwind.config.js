/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        /*
         * The dark theme, ported from the reference site's palette and re-roled
         * for this one. The token *names* kept their light-theme meanings —
         * `paper` is still "the page field" and `ink` still "the foreground" —
         * but the values inverted in place when the site went dark, so a spec
         * table reads as instrumentation on a dark ground rather than a light
         * sheet.
         *
         * The two colours that did NOT move are the provenance semaphores:
         * `proven` still belongs to measured figures alone and `flare` to
         * modelled ones. They were re-tuned for contrast on the dark field,
         * never re-assigned.
         */
        // The page field. Near-black with a warm cast — the reference body
        // colour (#08040A) rather than a blue-black, so the green/orange
        // provenance semaphores sit against warmth, not cold navy.
        paper: '#08040A',
        // The raised field: panels and section bands a shade above `paper`.
        stage: '#100A11',
        /*
         * The foreground: warm bone, on the page and inside raised panels that
         * invert to it (bg-ink sections render as light bands on the dark
         * ground — the one deliberate contrast move the dark theme kept).
         */
        ink: {
          DEFAULT: '#F1E7E2',
          soft: '#E2D6CF',
          mute: '#C4B6AF',
        },
        // Secondary copy: the reference's ~60%-alpha bone.
        mist: '#9C8F92',
        /*
         * WARNING accent. Modelled figures and the engineering caveat. Same
         * role as the light theme, lightened for the dark field.
         */
        flare: '#E07840',
        /*
         * PROVENANCE green. Measured figures and nothing else. Re-tuned to the
         * reference's server-dot green; the role is untouched.
         */
        proven: '#5BC89B',
        /*
         * Technical blue. Dimension lines, port groups, calculated values.
         * Lightened like the other semaphores.
         */
        signal: '#7FB0DC',
        // "No data" — deliberately still not red. Absence is not an error.
        void: '#8A7C85',
        /*
         * The ornamental gold, carried over from the reference site. It marks
         * structure, not data: eyebrows, kick lines, hairline connectors, the
         * active nav item. It deliberately does NOT touch figures — a number
         * coloured gold would read as certain the way `proven` does, and only
         * a measurement earns that.
         *
         * `deep` is the same role on the light band: the reference gold is
         * 2.2:1 on bone, under the 4.5:1 floor, and structure inside the band
         * must still read. Only the band should use it.
         */
        gold: {
          DEFAULT: '#C09657',
          deep: '#7A5F26',
        },
        line: {
          DEFAULT: '#2C1B25',
          soft: '#221820',
        },
      },
      fontFamily: {
        /*
         * IBM Plex Sans, from the reference site. Covers Latin Extended-A, so
         * Turkish glyphs — dotless ı, dotted İ, ş, ğ, ç — render without a
         * fallback face swapping in mid-line, which in a spec table is
         * visually obvious.
         */
        sans: ['"IBM Plex Sans"', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        /*
         * Part numbers, spec values, anything monospaced. IBM Plex Mono pairs
         * with the sans and carries the same Turkish coverage.
         */
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        'display-sm': ['clamp(2.1rem, 5vw, 3.1rem)', { lineHeight: '1.03' }],
        display: ['clamp(2.6rem, 6.2vw, 4.6rem)', { lineHeight: '1.01' }],
        'display-lg': ['clamp(3rem, 8vw, 6.4rem)', { lineHeight: '0.97' }],
      },
      letterSpacing: {
        widest: '0.32em',
        wider: '0.18em',
      },
      maxWidth: {
        prose: '38rem',
        shell: '82rem',
      },
      boxShadow: {
        // The reference's card shadow: a deep drop plus a hairline inner top.
        panel: 'inset 0 1px 0 rgba(255,240,230,0.06), 0 24px 60px -36px rgba(0,0,0,0.9)',
        hot: 'inset 0 1px 0 rgba(255,235,210,0.14), 0 50px 110px -50px rgba(99,17,25,0.95), 0 0 0 1px rgba(192,150,95,0.08)',
      },
      transitionTimingFunction: {
        expo: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        rise: {
          from: { opacity: '0', transform: 'translateY(22px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        dropIn: {
          from: { opacity: '0', transform: 'translateY(-12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        // The swap when an <img> falls through to its generated SVG.
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        // The reference's pulse dot: a node that is alive (a live run, a
        // reachable service) breathes a small halo.
        pulseDot: {
          '50%': { boxShadow: '0 0 0 5px rgba(192,150,95,0.12), 0 0 16px rgba(192,150,95,0.9)' },
        },
        // The terminal caret.
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
      },
      animation: {
        rise: 'rise 1.1s cubic-bezier(0.16, 1, 0.3, 1) both',
        dropIn: 'dropIn 0.9s cubic-bezier(0.16, 1, 0.3, 1) both',
        fadeIn: 'fadeIn 0.5s ease-out both',
        pulseDot: 'pulseDot 2.4s ease-in-out infinite',
        blink: 'blink 1.1s step-end infinite',
      },
    },
  },
  plugins: [],
}