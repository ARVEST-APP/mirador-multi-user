import { Grid, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { NavLink } from "react-router-dom";
import { ReactNode } from "react";
import storage from "../../../utils/storage.ts";
import { TermsFooter } from "../../../../customAssets/TermsFooter.tsx";
import { useTranslation } from "react-i18next";

type LayoutProps = {
  children: ReactNode;
  rightButton?: ReactNode;
  title: string;
};

export const Layout = ({ children, title, rightButton }: LayoutProps) => {
  const { t } = useTranslation();

  return (
    <Grid
      container
      direction="column"
      justifyContent="space-around"
      alignItems="center"
      min-height="100vh"
      sx={{
        height: "max-content",
      }}
      gap="20px"
    >
      <Grid
        item
        container
        flexWrap={{ sx: 'wrap', md: 'nowrap' }}
        direction="row"
        justifyContent={"center"}
        spacing={{ xs: 2, sm: 5, md: 15 }}
        alignItems="center"
        gap="20px"
        padding="40px"
      >
        <Grid item>
          <NavLink
            aria-label={t("backToHome")}
            to="/"
            onClick={() => {
              storage.clearToken();
            }}
          >
            <ArrowBackIcon />
          </NavLink>
        </Grid>
        <Grid item order={{ xs: 1, sm: 1, md: 0 }} textAlign={"center"} >
          <Typography variant="h2" component="h1">
            {title}
          </Typography>
        </Grid>
        <Grid item>
          {rightButton ? rightButton : <Grid></Grid>}
        </Grid>
      </Grid>
      <Grid
        item
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        {children}
      </Grid>
      <Grid item container sx={{ width: "100%" }}>
        <TermsFooter />
      </Grid>
    </Grid>
  );
};
