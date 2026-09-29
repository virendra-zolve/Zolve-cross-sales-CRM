/**
 * Design System Tokens
 * Centralized source of truth for all design system values
 * Used across components to ensure consistency
 */

// Color Tokens - Neutrals
export const COLORS = {
  // Neutrals
  neutral: {
    primary_bg: '#FFFFFF',
    secondary_bg: '#F9FAFB',
    tertiary_bg: '#F3F4F6',
    border: '#E5E7EB',
    surface_hover: '#F9FAFB',
    text_primary: '#1F2937',
    text_secondary: '#6B7280',
    text_tertiary: '#9CA3AF',
    text_disabled: '#D1D5DB',
  },

  // Semantic Colors
  accent: '#FF6B35',
  accent_dark: '#E85A24',
  accent_hover: '#E85A24',

  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  error_dark: '#DC2626',
  info: '#3B82F6',
  breach: '#DC2626',

  // Priority Colors
  priority: {
    high: '#DC2626', // Red - urgent
    medium: '#F59E0B', // Amber - standard
    low: '#9CA3AF', // Gray - secondary
  },

  // Status Badge Colors
  status: {
    active: '#FF6B35',
    inactive: '#9CA3AF',
    qualified: '#10B981',
    pending: '#F59E0B',
    breached: '#EF4444',
    due: '#FF6B35',
  },
};

// Typography Tokens
export const TYPOGRAPHY = {
  fonts: {
    family: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Inter',
      'sans-serif',
    ].join(', '),
  },

  sizes: {
    display: '32px',
    h1: '24px',
    h2: '20px',
    h3: '16px',
    h4: '16px',
    body_lg: '16px',
    body: '14px',
    body_sm: '13px',
    label: '12px',
    caption: '11px',
  },

  weights: {
    bold: 700,
    semibold: 600,
    medium: 500,
    regular: 400,
  },

  lineHeights: {
    tight: '1.2',
    snug: '1.3',
    normal: '1.4',
    relaxed: '1.5',
    loose: '1.6',
  },
};

// Spacing Tokens
export const SPACING = {
  0: '0px',
  1: '2px',
  2: '4px',
  3: '6px',
  4: '8px',
  5: '12px',
  6: '16px',
  7: '20px',
  8: '24px',
  9: '32px',
  10: '40px',
  11: '48px',
};

// Shadow Tokens
export const SHADOWS = {
  subtle: '0 1px 2px rgba(0, 0, 0, 0.05)',
  light: '0 1px 3px rgba(0, 0, 0, 0.08)',
  medium: '0 4px 6px rgba(0, 0, 0, 0.1)',
  strong: '0 10px 15px rgba(0, 0, 0, 0.1)',
  heavy: '0 10px 40px rgba(0, 0, 0, 0.15)',
};

// Border Radius Tokens
export const BORDER_RADIUS = {
  none: '0px',
  small: '4px',
  default: '6px',
  medium: '8px',
  large: '12px',
  full: '9999px',
};

// Z-Index Tokens
export const Z_INDEX = {
  hide: '-1',
  auto: 'auto',
  base: '0',
  dropdown: '1000',
  sticky: '1020',
  fixed: '1030',
  modal_backdrop: '1040',
  modal: '1050',
  popover: '1060',
  tooltip: '1070',
  notification: '1080',
};

// Responsive Breakpoints
export const BREAKPOINTS = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Component-specific tokens
export const COMPONENTS = {
  button: {
    sizes: {
      sm: {
        padding: `${SPACING[2]} ${SPACING[3]}`,
        fontSize: TYPOGRAPHY.sizes.label,
        lineHeight: TYPOGRAPHY.lineHeights.normal,
      },
      md: {
        padding: `${SPACING[2]} ${SPACING[4]}`,
        fontSize: TYPOGRAPHY.sizes.body_sm,
        lineHeight: TYPOGRAPHY.lineHeights.normal,
      },
      lg: {
        padding: `${SPACING[3]} ${SPACING[5]}`,
        fontSize: TYPOGRAPHY.sizes.body,
        lineHeight: TYPOGRAPHY.lineHeights.normal,
      },
    },
  },

  card: {
    padding: SPACING[6],
    border_radius: BORDER_RADIUS.default,
    shadow: SHADOWS.light,
    border: `1px solid ${COLORS.neutral.border}`,
  },

  badge: {
    border_radius: BORDER_RADIUS.full,
    padding_sm: `${SPACING[1]} ${SPACING[2]}`,
    padding_md: `${SPACING[1]} ${SPACING[3]}`,
    font_size_sm: TYPOGRAPHY.sizes.label,
    font_size_md: TYPOGRAPHY.sizes.body_sm,
    font_weight: TYPOGRAPHY.weights.medium,
  },

  sidebar: {
    width: '80px',
    width_expanded: '100px',
    background: COLORS.neutral.primary_bg,
    border_right: `1px solid ${COLORS.neutral.border}`,
    logo_height: '70px',
  },

  input: {
    padding: `${SPACING[2]} ${SPACING[3]}`,
    border_radius: BORDER_RADIUS.default,
    border: `1px solid ${COLORS.neutral.border}`,
    font_size: TYPOGRAPHY.sizes.body,
  },

  table: {
    header_bg: COLORS.neutral.tertiary_bg,
    header_font_weight: TYPOGRAPHY.weights.semibold,
    padding: `${SPACING[3]} ${SPACING[4]}`,
    row_padding: `${SPACING[2]} ${SPACING[3]}`,
  },
};

export default COLORS;
