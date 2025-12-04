import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';

const CustomPreset = definePreset(Aura, {
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
  }
});

export default CustomPreset;
