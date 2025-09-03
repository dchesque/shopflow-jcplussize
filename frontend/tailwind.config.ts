import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Tema Nexus Dark
        background: {
          DEFAULT: "hsl(222, 84%, 4%)", // #0A0D26
          secondary: "hsl(221, 47%, 11%)", // #161B33
          tertiary: "hsl(220, 26%, 18%)", // #262B40
        },
        foreground: {
          DEFAULT: "hsl(210, 40%, 98%)", // #F8FAFC
          secondary: "hsl(215, 20%, 65%)", // #8B96A5
          muted: "hsl(217, 10%, 40%)", // #5B6478
        },
        primary: {
          DEFAULT: "hsl(217, 91%, 60%)", // #3B82F6
          light: "hsl(217, 91%, 70%)", // #60A5FA
          dark: "hsl(217, 91%, 50%)", // #2563EB
        },
        accent: {
          cyan: "hsl(189, 94%, 43%)", // #06B6D4
          purple: "hsl(271, 91%, 65%)", // #A855F7
          green: "hsl(142, 76%, 36%)", // #059669
          orange: "hsl(20, 95%, 55%)", // #EA580C
        },
        glass: {
          light: "rgba(255, 255, 255, 0.05)",
          medium: "rgba(255, 255, 255, 0.1)",
          heavy: "rgba(255, 255, 255, 0.15)",
        },
        border: {
          DEFAULT: "hsl(217, 32%, 17%)", // #202940
          light: "hsl(217, 32%, 25%)", // #323B54
        },
        danger: {
          DEFAULT: "hsl(0, 84%, 60%)", // #EF4444
          light: "hsl(0, 84%, 70%)", // #F87171
          dark: "hsl(0, 84%, 50%)", // #DC2626
        },
        warning: {
          DEFAULT: "hsl(38, 92%, 50%)", // #F59E0B
          light: "hsl(38, 92%, 60%)", // #FBBF24
        },
        success: {
          DEFAULT: "hsl(142, 76%, 36%)", // #059669
          light: "hsl(142, 76%, 46%)", // #10B981
        },
      },
      backgroundImage: {
        'gradient-nexus': 'linear-gradient(135deg, hsl(222, 84%, 4%) 0%, hsl(221, 47%, 11%) 50%, hsl(220, 26%, 18%) 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        'gradient-primary': 'linear-gradient(135deg, hsl(217, 91%, 60%) 0%, hsl(217, 91%, 50%) 100%)',
        'gradient-accent': 'linear-gradient(135deg, hsl(189, 94%, 43%) 0%, hsl(271, 91%, 65%) 100%)',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '32px',
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "fade-up": "fadeUp 0.5s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "glow": "glow 2s ease-in-out infinite alternate",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-subtle": "bounceSubtle 2s infinite",
        "shimmer": "shimmer 2.5s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px hsl(217, 91%, 60%)" },
          "100%": { boxShadow: "0 0 20px hsl(217, 91%, 60%), 0 0 30px hsl(217, 91%, 60%)" },
        },
        bounceSubtle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        '2xs': '0.625rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
        '7xl': '4.5rem',
        '8xl': '6rem',
        '9xl': '8rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        DEFAULT: '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full': '9999px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08)',
        'glass-lg': '0 20px 64px rgba(0, 0, 0, 0.16), 0 8px 24px rgba(0, 0, 0, 0.12)',
        'neon': '0 0 20px hsl(217, 91%, 60%)',
        'neon-cyan': '0 0 20px hsl(189, 94%, 43%)',
        'neon-purple': '0 0 20px hsl(271, 91%, 65%)',
        'inner-glass': 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      },
      screens: {
        'xs': '475px',
        '3xl': '1920px',
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
};

export default config;