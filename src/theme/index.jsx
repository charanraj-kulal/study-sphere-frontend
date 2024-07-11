import { useMemo } from "react";
import PropTypes from "prop-types";

import CssBaseline from "@mui/material/CssBaseline";
import {
  createTheme,
  ThemeProvider as MUIThemeProvider,
} from "@mui/material/styles";

import { palette } from "./palette";
import { shadows } from "./shadows";
import { overrides } from "./overrides";
import { typography, pxToRem, responsiveFontSizes } from "./typography";
import { customShadows } from "./custom-shadows";

// ----------------------------------------------------------------------

export default function ThemeProvider({ children }) {
  const memoizedValue = useMemo(
    () => ({
      palette: palette(),
      typography: {
        ...typography,
      },
      shadows: shadows(),
      commonpdfname: {
        fontFamily: '"LEMONMILK"',
        fontWeight: 700,
        lineHeight: 1.5,

        fontSize: pxToRem(32),
        ...responsiveFontSizes({ sm: 26, md: 30, lg: 32 }),
      },
      customShadows: customShadows(),
      shape: { borderRadius: 8 },
    }),
    []
  );

  const theme = createTheme(memoizedValue);

  theme.components = overrides(theme);

  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MUIThemeProvider>
  );
}

ThemeProvider.propTypes = {
  children: PropTypes.node,
};
