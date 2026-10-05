/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        /*
         * Near-black with a blue cast. The dominant field colour — a spec
         * table reads as instrumentation, so the page sits dark-on-light
         * rather than the reverse.
         */
        ink: {
          DEFAULT: '#0B1620',
          soft: '#152634',
          mute: '#2E4256',
        },
        paper: '#F5F6F8',
        stage: '#EDEFF2',
        // Body copy, and any secondary numeric readout.
        mist: '#5A6B78',
        /*
         * WARNING accent. Used for figures whose basis is `modelled`, and for
         * the engineering caveat. Deliberately the same role as the reference
         * site's warning colour: it means "look before you use this number".
         */
        flare: '#D9541E',
        /*
         * PROVENANCE green. Reserved for `measured` figures and nothing else.
         * A colour that means only one thing is worth more here than a wider
         * palette, because the whole point of Figure.basis is that a reader
         * can tell a measured number from a modelled one at a glance.
         */
        proven: '#0E7A5F',
        /*
         * Technical blue. Carries the engineering register: dimension lines,
         * port groups on a block diagram, calculated values.
         */
        signal: '#1F6FB2',
        // "No data" — a figure we have not characterised, deliberately not red.
        // Absence is not an error, so it must not be coloured like one.
        void: '#7A8794',
        line: {
          DEFAULT: '#DDE2E7',
          soft: '#E9EDF1',
        },
      },
      fontFamily: {
        // Inter covers Turkish (including dotless ı and dotted İ) with no
        // fallback substitution, so it needs no separate Turkish face.
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        /*
         * Part numbers, spec values, anything monospaced. JetBrains Mono
         * includes Latin Extended-A, so the Turkish glyphs render without a
         * fallback jump in a monospaced context.
         */
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
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
      },
      animation: {
        rise: 'rise 1.1s cubic-bezier(0.16, 1, 0.3, 1) both',
        dropIn: 'dropIn 0.9s cubic-bezier(0.16, 1, 0.3, 1) both',
        fadeIn: 'fadeIn 0.5s ease-out both',
      },
    },
  },
  plugins: [],
}