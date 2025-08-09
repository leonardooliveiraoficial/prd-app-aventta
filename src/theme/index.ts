import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const colors = {
  brand: {
    bg: '#0B0F1A',
    surface: '#121826',
    surfaceHover: '#192132',
    border: '#2A3345',
    text: '#E5E7EB',
    muted: '#9CA3AF',
    accent: {
      from: '#22D3EE',
      to: '#A78BFA',
    },
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#F43F5E',
  },
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
};

const fonts = {
  heading: '"Poppins", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  mono: '"JetBrains Mono", "Fira Code", "Consolas", "Monaco", monospace',
};

const fontSizes = {
  xs: '0.75rem',     // 12px
  sm: '0.875rem',    // 14px
  md: '1rem',        // 16px
  lg: '1.125rem',    // 18px
  xl: '1.25rem',     // 20px
  '2xl': '1.5rem',   // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem',  // 36px
  '5xl': '3rem',     // 48px
  '6xl': '3.75rem',  // 60px
  '7xl': '4.5rem',   // 72px
  '8xl': '6rem',     // 96px
  '9xl': '8rem',     // 128px
};

const fontWeights = {
  hairline: 100,
  thin: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
};

const lineHeights = {
  normal: 'normal',
  none: 1,
  shorter: 1.25,
  short: 1.375,
  base: 1.5,
  tall: 1.625,
  taller: '2',
  '3': '.75rem',
  '4': '1rem',
  '5': '1.25rem',
  '6': '1.5rem',
  '7': '1.75rem',
  '8': '2rem',
  '9': '2.25rem',
  '10': '2.5rem',
};

const letterSpacings = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
};

const styles = {
  global: {
    html: {
      fontSize: '16px',
      scrollBehavior: 'smooth',
    },
    body: {
      bg: 'brand.bg',
      color: 'brand.text',
      fontFamily: 'body',
      fontSize: 'md',
      lineHeight: 'base',
      fontWeight: 'normal',
      letterSpacing: 'normal',
      // Suavização de fontes para melhor renderização
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      textRendering: 'optimizeLegibility',
    },
    '*::placeholder': {
      color: 'brand.muted',
      fontWeight: 'normal',
    },
    '*, *::before, &::after': {
      borderColor: 'brand.border',
    },
    // Melhorar tipografia para headings
    'h1, h2, h3, h4, h5, h6': {
      fontFamily: 'heading',
      fontWeight: 'semibold',
      lineHeight: 'shorter',
      letterSpacing: 'tight',
    },
    h1: {
      fontSize: '4xl',
      fontWeight: 'bold',
    },
    h2: {
      fontSize: '3xl',
      fontWeight: 'semibold',
    },
    h3: {
      fontSize: '2xl',
      fontWeight: 'semibold',
    },
    h4: {
      fontSize: 'xl',
      fontWeight: 'medium',
    },
    h5: {
      fontSize: 'lg',
      fontWeight: 'medium',
    },
    h6: {
      fontSize: 'md',
      fontWeight: 'medium',
    },
    // Melhorar legibilidade de parágrafos
    p: {
      lineHeight: 'tall',
      marginBottom: '1rem',
    },
    // Melhorar aparência de links
    a: {
      color: 'brand.accent.from',
      textDecoration: 'none',
      transition: 'color 0.2s ease',
      _hover: {
        color: 'brand.accent.to',
        textDecoration: 'underline',
      },
    },
  },
};

const components = {
  Button: {
    baseStyle: {
      fontFamily: 'body',
      fontWeight: 'semibold',
      borderRadius: '12px',
      transition: 'all 0.2s ease-out',
      letterSpacing: 'tight',
      lineHeight: 'none',
    },
    sizes: {
      xs: {
        fontSize: 'xs',
        px: 3,
        py: 2,
      },
      sm: {
        fontSize: 'sm',
        px: 4,
        py: 2.5,
      },
      md: {
        fontSize: 'md',
        px: 6,
        py: 3,
      },
      lg: {
        fontSize: 'lg',
        px: 8,
        py: 4,
      },
    },
    variants: {
      gradient: {
        background: 'linear-gradient(90deg, #22D3EE 0%, #A78BFA 100%)',
        color: 'white',
        _hover: {
          transform: 'translateY(-1px)',
          boxShadow: '0 8px 25px rgba(34, 211, 238, 0.3)',
        },
        _active: {
          transform: 'translateY(0)',
        },
      },
      ghost: {
        bg: 'transparent',
        color: 'brand.text',
        _hover: {
          bg: 'brand.surfaceHover',
        },
      },
    },
  },
  Drawer: {
    baseStyle: {
      dialog: {
        bg: 'brand.surface',
        borderRight: '1px solid',
        borderColor: 'brand.border',
      },
      header: {
        bg: 'brand.surface',
        borderBottom: '1px solid',
        borderColor: 'brand.border',
      },
      body: {
        bg: 'brand.surface',
        p: 0,
      },
    },
  },
  Modal: {
    baseStyle: {
      dialog: {
        bg: 'brand.surface',
        borderRadius: '20px',
        border: '1px solid',
        borderColor: 'brand.border',
      },
      header: {
        borderBottom: '1px solid',
        borderColor: 'brand.border',
      },
    },
  },
  Input: {
    variants: {
      filled: {
        field: {
          bg: 'brand.surfaceHover',
          border: '1px solid',
          borderColor: 'brand.border',
          _hover: {
            bg: 'brand.surfaceHover',
            borderColor: 'brand.accent.from',
          },
          _focus: {
            bg: 'brand.surfaceHover',
            borderColor: 'brand.accent.from',
            boxShadow: '0 0 0 1px #22D3EE',
          },
        },
      },
    },
    defaultProps: {
      variant: 'filled',
    },
  },
  Select: {
    variants: {
      filled: {
        field: {
          bg: 'brand.surfaceHover',
          border: '1px solid',
          borderColor: 'brand.border',
          _hover: {
            bg: 'brand.surfaceHover',
            borderColor: 'brand.accent.from',
          },
          _focus: {
            bg: 'brand.surfaceHover',
            borderColor: 'brand.accent.from',
            boxShadow: '0 0 0 1px #22D3EE',
          },
        },
      },
    },
    defaultProps: {
      variant: 'filled',
    },
  },
  Card: {
    baseStyle: {
      container: {
        bg: 'brand.surface',
        border: '1px solid',
        borderColor: 'brand.border',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  Text: {
    baseStyle: {
      fontFamily: 'body',
      lineHeight: 'base',
      letterSpacing: 'normal',
    },
    variants: {
      caption: {
        fontSize: 'xs',
        color: 'brand.muted',
        fontWeight: 'normal',
        lineHeight: 'short',
      },
      body: {
        fontSize: 'md',
        color: 'brand.text',
        fontWeight: 'normal',
        lineHeight: 'tall',
      },
      subtitle: {
        fontSize: 'lg',
        color: 'brand.text',
        fontWeight: 'medium',
        lineHeight: 'short',
      },
      label: {
        fontSize: 'sm',
        color: 'brand.text',
        fontWeight: 'medium',
        letterSpacing: 'wide',
        textTransform: 'uppercase',
      },
    },
  },
  Heading: {
    baseStyle: {
      fontFamily: 'heading',
      fontWeight: 'semibold',
      lineHeight: 'shorter',
      letterSpacing: 'tight',
      color: 'brand.text',
    },
    sizes: {
      xs: {
        fontSize: 'md',
        fontWeight: 'medium',
      },
      sm: {
        fontSize: 'lg',
        fontWeight: 'medium',
      },
      md: {
        fontSize: 'xl',
        fontWeight: 'semibold',
      },
      lg: {
        fontSize: '2xl',
        fontWeight: 'semibold',
      },
      xl: {
        fontSize: '3xl',
        fontWeight: 'bold',
      },
      '2xl': {
        fontSize: '4xl',
        fontWeight: 'bold',
      },
    },
  },
  FormLabel: {
    baseStyle: {
      fontFamily: 'body',
      fontSize: 'sm',
      fontWeight: 'medium',
      color: 'brand.text',
      letterSpacing: 'normal',
      lineHeight: 'short',
      mb: 2,
    },
  },
};

const theme = extendTheme({
  config,
  colors,
  fonts,
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacings,
  styles,
  components,
  space: {
    px: '1px',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
    36: '9rem',
    40: '10rem',
    44: '11rem',
    48: '12rem',
    52: '13rem',
    56: '14rem',
    60: '15rem',
    64: '16rem',
    72: '18rem',
    80: '20rem',
    96: '24rem',
  },
});

export default theme;