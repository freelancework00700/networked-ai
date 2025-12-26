import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';

const CustomPreset = definePreset(Aura, {
  primitive: {
    blue: {
      50: '#f4f7fd',
      100: '#ccd8f7',
      200: '#a4b8f1',
      300: '#7c99eb',
      400: '#537ae4',
      500: '#2b5bde',
      600: '#254dbd',
      700: '#1e409b',
      800: '#18327a',
      900: '#112459',
      950: '#0b1738'
    },
    red: {
      50: '#fcf5f5',
      100: '#f2cfcf',
      200: '#e7a9a9',
      300: '#dc8484',
      400: '#d25e5e',
      500: '#c73838',
      600: '#a93030',
      700: '#8b2727',
      800: '#6d1f1f',
      900: '#501616',
      950: '#320e0e'
    }
  },
  semantic: {
    primary: {
      0: '#fffcf7',
      50: '#fdefd9',
      100: '#fbe2bb',
      200: '#f9d59d',
      300: '#f7c97f',
      400: '#f7c97f',
      500: '#f5bc61',
      600: '#d0a052',
      700: '#ac8444',
      800: '#876735',
      900: '#624b27',
      950: '#3d2f18'
    },
    formField: {
      paddingX: '0.9rem',
      paddingY: '0.9rem',
      borderRadius: '8px'
    },
    colorScheme: {
      light: {
        surface: {
          0: '{neutral.0}',
          50: '{neutral.50}',
          100: '{neutral.100}',
          200: '{neutral.200}',
          300: '{neutral.300}',
          400: '{neutral.400}',
          500: '{neutral.500}',
          600: '{neutral.600}',
          700: '{neutral.700}',
          800: '{neutral.800}',
          900: '{neutral.900}',
          950: '{neutral.950}'
        },
        primary: {
          contrastColor: '{surface.950}'
        },
        formField: {
          shadow: 'none',
          background: '{surface.0}',
          invalidBorderColor: '{red.700}',
          hoverBorderColor: '{surface.950}',
          focusBorderColor: '{surface.950}',
          invalidPlaceholderColor: '{surface.500}'
        }
      },
      dark: {
        surface: {
          0: '{neutral.50}',
          50: '{neutral.50}',
          100: '{neutral.100}',
          200: '{neutral.200}',
          300: '{neutral.300}',
          400: '{neutral.400}',
          500: '{neutral.500}',
          600: '{neutral.600}',
          700: '{neutral.700}',
          800: '{neutral.800}',
          900: '{neutral.900}',
          950: '{neutral.950}'
        },
        formField: {
          shadow: 'none',
          invalidBorderColor: '{red.700}',
          hoverBorderColor: '{primary.color}',
          focusBorderColor: '{primary.color}',
          invalidPlaceholderColor: '{surface.500}'
        }
      }
    }
  },
  components: {
    button: {
      colorScheme: {
        light: {
          root: {
            info: {
              background: '{blue.500}',
              hoverBackground: '{blue.600}',
              activeBackground: '{blue.700}',
              borderColor: '{blue.500}',
              hoverBorderColor: '{blue.600}',
              activeBorderColor: '{blue.700}',
              color: '#ffffff',
              hoverColor: '#ffffff',
              activeColor: '#ffffff',
              focusRing: {
                color: 'transparent',
                shadow: '0 0 0 0.2rem {blue.200}'
              }
            },
            danger: {
              background: '{red.500}',
              hoverBackground: '{red.600}',
              activeBackground: '{red.700}',
              borderColor: '{red.500}',
              hoverBorderColor: '{red.600}',
              activeBorderColor: '{red.700}',
              color: '#ffffff',
              hoverColor: '#ffffff',
              activeColor: '#ffffff',
              focusRing: {
                color: 'transparent',
                shadow: '0 0 0 0.2rem {red.200}'
              }
            }
          }
        },
        dark: {
          root: {
            info: {
              background: '{blue.400}',
              hoverBackground: '{blue.300}',
              activeBackground: '{blue.200}',
              borderColor: '{blue.400}',
              hoverBorderColor: '{blue.300}',
              activeBorderColor: '{blue.200}',
              color: '{blue.950}',
              hoverColor: '{blue.950}',
              activeColor: '{blue.950}',
              focusRing: {
                color: 'transparent',
                shadow: '0 0 0 0.2rem color-mix(in srgb, {blue.400}, transparent 80%)'
              }
            },
            danger: {
              background: '{red.400}',
              hoverBackground: '{red.300}',
              activeBackground: '{red.200}',
              borderColor: '{red.400}',
              hoverBorderColor: '{red.300}',
              activeBorderColor: '{red.200}',
              color: '{red.950}',
              hoverColor: '{red.950}',
              activeColor: '{red.950}',
              focusRing: {
                color: 'transparent',
                shadow: '0 0 0 0.2rem color-mix(in srgb, {red.400}, transparent 80%)'
              }
            }
          }
        }
      }
    }
  }
});

export default CustomPreset;
