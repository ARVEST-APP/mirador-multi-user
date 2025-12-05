import { createTheme, responsiveFontSizes } from "@mui/material/styles";
import InputMonoNarrow from "../fonts/InputMonoNarrow-ExtraLight.ttf";
import backgroundImage from "../../../customAssets/landing-background.webp";
import { createBreakpoints } from "@mui/system";

declare module "@mui/material/styles" {
  interface Palette {
    backgroundImage?: string;
  }

  interface PaletteOptions {
    backgroundImage?: string;
  }
}

// 1. Breakpoints aren't available on theme when createTheme is called,
// so we need to generate first to use them in the new theme.
//https://stackoverflow.com/questions/75018915/how-to-use-responsive-font-size-with-material-ui
const breakpoints = createBreakpoints({});

export let theme = createTheme({
  //https://mui.com/material-ui/customization/typography/
  typography: {
    button: {
      [breakpoints.down("md")]: {
        fontSize: "0.8rem"
      },
      [breakpoints.up("md")]: {
        fontSize: "0.875rem"
      }
    },
  },
  palette: {
    background: {
      default: "#dcdcdc",
    },
    backgroundImage: `url(${backgroundImage})`,
    error: {
      main: "#881117"
    },
    primary: {
      main: "#0000E6"
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family:'InputMonoNarrow';
          font-style: normal;
          font-display: swap;
          font-weight: 400;
          src: local('InputMonoNarrow'), local('InputMonoNarrow-ExtraLight'), url(${InputMonoNarrow}) format('truetype');
          unicodeRange: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF;
        }
      `,
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          display: "flex"
        }
      }
    }
  },
});

theme = responsiveFontSizes(theme);