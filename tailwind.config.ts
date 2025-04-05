const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
  	container: {
  		center: 'true',
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		boxShadow: {
  			shadow: 'var(--shadow)',
  			'border-primary': '0 1px var(--surface-a2), 0 -1px var(--surface-a3), 0 0 0 1px var(--surface-a4), var(--shadow)',
  			'border-secondary': '0 1px var(--surface-a7), 0 -1px var(--surface-a8), 0 0 0 1px var(--surface-a9), var(--shadow)',
  			'border-accent': '0 1px var(--accent-a5), 0 -1px var(--accent-a4), 0 0 0 1px var(--accent-a3)',
  			'border-destructive': ' 0 1px var(--danger-a5), 0 -1px var(--danger-a4), 0 0 0 1px var(--danger-a3)',
  			active: '0 0 0 1px var(--accent-9), 0 0 0 3px var(--accent-a4)'
  		},
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))',
  				hover: 'hsl(var(--primary-hover))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))',
  				hover: 'hsl(var(--secondary-hover))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))',
  				hover: 'hsl(var(--accent-hover))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))',
  				'foreground-active': 'hsl(var(--popover-foreground-active))',
  				hover: 'hsl(var(--popover-hover))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			surface: {
  				'0': 'oklch(from var(--surface-0) l c h / <alpha-value>)',
  				'1': 'oklch(from var(--surface-1) l c h / <alpha-value>)',
  				'2': 'oklch(from var(--surface-2) l c h / <alpha-value>)',
  				'3': 'oklch(from var(--surface-3) l c h / <alpha-value>)',
  				'4': 'oklch(from var(--surface-4) l c h / <alpha-value>)',
  				'5': 'oklch(from var(--surface-5) l c h / <alpha-value>)',
  				'6': 'oklch(from var(--surface-6) l c h / <alpha-value>)',
  				'7': 'oklch(from var(--surface-7) l c h / <alpha-value>)',
  				'8': 'oklch(from var(--surface-8) l c h / <alpha-value>)',
  				'9': 'oklch(from var(--surface-9) l c h / <alpha-value>)',
  				'10': 'oklch(from var(--surface-10) l c h / <alpha-value>)',
  				'11': 'oklch(from var(--surface-11) l c h / <alpha-value>)',
  				'12': 'oklch(from var(--surface-12) l c h / <alpha-value>)',
  				a0: 'var(--surface-a0)',
  				a1: 'var(--surface-a1)',
  				a2: 'var(--surface-a2)',
  				a3: 'var(--surface-a3)',
  				a4: 'var(--surface-a4)',
  				a5: 'var(--surface-a5)',
  				a6: 'var(--surface-a6)',
  				a7: 'var(--surface-a7)',
  				a8: 'var(--surface-a8)',
  				a9: 'var(--surface-a9)',
  				a10: 'var(--surface-a10)',
  				a11: 'var(--surface-a11)',
  				a12: 'var(--surface-a12)'
  			},
  			accentt: {
  				'1': 'oklch(from var(--accent-1) l c h / <alpha-value>)',
  				'2': 'oklch(from var(--accent-2) l c h / <alpha-value>)',
  				'3': 'oklch(from var(--accent-3) l c h / <alpha-value>)',
  				'4': 'oklch(from var(--accent-4) l c h / <alpha-value>)',
  				'5': 'oklch(from var(--accent-5) l c h / <alpha-value>)',
  				'6': 'oklch(from var(--accent-6) l c h / <alpha-value>)',
  				'7': 'oklch(from var(--accent-7) l c h / <alpha-value>)',
  				'8': 'oklch(from var(--accent-8) l c h / <alpha-value>)',
  				'9': 'oklch(from var(--accent-9) l c h / <alpha-value>)',
  				'10': 'oklch(from var(--accent-10) l c h / <alpha-value>)',
  				'11': 'oklch(from var(--accent-11) l c h / <alpha-value>)',
  				'12': 'oklch(from var(--accent-12) l c h / <alpha-value>)',
  				contrast: 'oklch(from var(--accent-contrast) l c h / <alpha-value>)',
  				a1: 'var(--accent-a1)',
  				a2: 'var(--accent-a2)',
  				a3: 'var(--accent-a3)',
  				a4: 'var(--accent-a4)',
  				a5: 'var(--accent-a5)',
  				a6: 'var(--accent-a6)',
  				a7: 'var(--accent-a7)',
  				a8: 'var(--accent-a8)',
  				a9: 'var(--accent-a9)',
  				a10: 'var(--accent-a10)',
  				a11: 'var(--accent-a11)',
  				a12: 'var(--accent-a12)'
  			},
  			danger: {
  				'1': 'oklch(from var(--danger-1) l c h / <alpha-value>)',
  				'2': 'oklch(from var(--danger-2) l c h / <alpha-value>)',
  				'3': 'oklch(from var(--danger-3) l c h / <alpha-value>)',
  				'4': 'oklch(from var(--danger-4) l c h / <alpha-value>)',
  				'5': 'oklch(from var(--danger-5) l c h / <alpha-value>)',
  				'6': 'oklch(from var(--danger-6) l c h / <alpha-value>)',
  				'7': 'oklch(from var(--danger-7) l c h / <alpha-value>)',
  				'8': 'oklch(from var(--danger-8) l c h / <alpha-value>)',
  				'9': 'oklch(from var(--danger-9) l c h / <alpha-value>)',
  				'10': 'oklch(from var(--danger-10) l c h / <alpha-value>)',
  				'11': 'oklch(from var(--danger-11) l c h / <alpha-value>)',
  				'12': 'oklch(from var(--danger-12) l c h / <alpha-value>)',
  				a1: 'var(--danger-a1)',
  				a2: 'var(--danger-a2)',
  				a3: 'var(--danger-a3)',
  				a4: 'var(--danger-a4)',
  				a5: 'var(--danger-a5)',
  				a6: 'var(--danger-a6)',
  				a7: 'var(--danger-a7)',
  				a8: 'var(--danger-a8)',
  				a9: 'var(--danger-a9)',
  				a10: 'var(--danger-a10)',
  				a11: 'var(--danger-a11)',
  				a12: 'var(--danger-a12)'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		fontFamily: {
  			sans: ["var(--font-geist-sans)", ...fontFamily.sans],
  			mono: ["var(--font-geist-mono)", ...fontFamily.mono]
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
  		background: 'hsl(var(--background))',
  		foreground: 'hsl(var(--foreground))',
  		card: {
  			DEFAULT: 'hsl(var(--card))',
  			foreground: 'hsl(var(--card-foreground))'
  		},
  		popover: {
  			DEFAULT: 'hsl(var(--popover))',
  			foreground: 'hsl(var(--popover-foreground))'
  		},
  		primary: {
  			DEFAULT: 'hsl(var(--primary))',
  			foreground: 'hsl(var(--primary-foreground))'
  		},
  		secondary: {
  			DEFAULT: 'hsl(var(--secondary))',
  			foreground: 'hsl(var(--secondary-foreground))'
  		},
  		muted: {
  			DEFAULT: 'hsl(var(--muted))',
  			foreground: 'hsl(var(--muted-foreground))'
  		},
  		accent: {
  			DEFAULT: 'hsl(var(--accent))',
  			foreground: 'hsl(var(--accent-foreground))'
  		},
  		destructive: {
  			DEFAULT: 'hsl(var(--destructive))',
  			foreground: 'hsl(var(--destructive-foreground))'
  		},
  		border: 'hsl(var(--border))',
  		input: 'hsl(var(--input))',
  		ring: 'hsl(var(--ring))',
  		chart: {
  			'1': 'hsl(var(--chart-1))',
  			'2': 'hsl(var(--chart-2))',
  			'3': 'hsl(var(--chart-3))',
  			'4': 'hsl(var(--chart-4))',
  			'5': 'hsl(var(--chart-5))'
  		},
  		sidebar: {
  			DEFAULT: 'hsl(var(--sidebar-background))',
  			foreground: 'hsl(var(--sidebar-foreground))',
  			primary: 'hsl(var(--sidebar-primary))',
  			'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  			accent: 'hsl(var(--sidebar-accent))',
  			'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  			border: 'hsl(var(--sidebar-border))',
  			ring: 'hsl(var(--sidebar-ring))'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
