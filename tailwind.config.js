/** @type {import('tailwindcss').Config} */
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from './src/styles/designTokens';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors
        'brand-orange': COLORS.accent,
        'brand-orange-dark': COLORS.accent_dark,

        // Neutrals
        'neutral-bg-primary': COLORS.neutral.primary_bg,
        'neutral-bg-secondary': COLORS.neutral.secondary_bg,
        'neutral-bg-tertiary': COLORS.neutral.tertiary_bg,
        'neutral-border': COLORS.neutral.border,
        'neutral-hover': COLORS.neutral.surface_hover,
        'neutral-text-primary': COLORS.neutral.text_primary,
        'neutral-text-secondary': COLORS.neutral.text_secondary,
        'neutral-text-tertiary': COLORS.neutral.text_tertiary,
        'neutral-text-disabled': COLORS.neutral.text_disabled,

        // Semantic colors
        'success': COLORS.success,
        'warning': COLORS.warning,
        'error': COLORS.error,
        'error-dark': COLORS.error_dark,
        'info': COLORS.info,
        'breach': COLORS.breach,

        // Priority colors
        'priority-high': COLORS.priority.high,
        'priority-medium': COLORS.priority.medium,
        'priority-low': COLORS.priority.low,

        // Status colors
        'status-active': COLORS.status.active,
        'status-inactive': COLORS.status.inactive,
        'status-qualified': COLORS.status.qualified,
        'status-pending': COLORS.status.pending,
        'status-breached': COLORS.status.breached,
        'status-due': COLORS.status.due,
      },

      spacing: {
        '0': SPACING[0],
        '1': SPACING[1],
        '2': SPACING[2],
        '3': SPACING[3],
        '4': SPACING[4],
        '5': SPACING[5],
        '6': SPACING[6],
        '7': SPACING[7],
        '8': SPACING[8],
        '9': SPACING[9],
        '10': SPACING[10],
        '11': SPACING[11],
      },

      fontSize: {
        'display': ['32px', { lineHeight: '1.2' }],
        'h1': ['24px', { lineHeight: '1.3' }],
        'h2': ['20px', { lineHeight: '1.4' }],
        'h3': ['16px', { lineHeight: '1.5' }],
        'h4': ['16px', { lineHeight: '1.5' }],
        'body-lg': ['16px', { lineHeight: '1.5' }],
        'body': ['14px', { lineHeight: '1.5' }],
        'body-sm': ['13px', { lineHeight: '1.5' }],
        'label': ['12px', { lineHeight: '1.4' }],
        'caption': ['11px', { lineHeight: '1.4' }],
      },

      fontWeight: {
        'bold': 700,
        'semibold': 600,
        'medium': 500,
        'regular': 400,
      },

      borderRadius: {
        'none': BORDER_RADIUS.none,
        'small': BORDER_RADIUS.small,
        'default': BORDER_RADIUS.default,
        'medium': BORDER_RADIUS.medium,
        'large': BORDER_RADIUS.large,
        'full': BORDER_RADIUS.full,
      },

      boxShadow: {
        'subtle': SHADOWS.subtle,
        'light': SHADOWS.light,
        'medium': SHADOWS.medium,
        'strong': SHADOWS.strong,
        'heavy': SHADOWS.heavy,
      },

      screens: {
        'xs': '0px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },

      zIndex: {
        'hide': '-1',
        'auto': 'auto',
        'base': '0',
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
        'notification': '1080',
      },
    },
  },
  plugins: [],
};
