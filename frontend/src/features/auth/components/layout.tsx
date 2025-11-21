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
      justifyContent="space-between"
      alignItems="center"
      height="100vh"
      flexDirection={"column"}
      flexWrap={"nowrap"}
      gap="20px"
    >
      <Grid
        item
        container
        flexWrap={{ sx: 'wrap', sm: 'nowrap' }}
        direction="row"
        justifyContent={"center"}
        alignItems="center"
        gap="20px"
        margin={{ xs: 3 }}
        marginBlockStart="0px"
      >
        <Grid item padding={{ xs: 1, sm: 2, md: 3 }}>
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
        <Grid item order={{ xs: -1, sm: 0, md: 0 }} textAlign={"center"} padding={{ xs: 1, sm: 2, md: 3 }}>
          <Typography variant="h2" component="h1">
            {title}
          </Typography>
        </Grid>
        <Grid item padding={{ xs: 1, sm: 2, md: 3 }}>
          {rightButton ? rightButton : <Grid></Grid>}
        </Grid>
      </Grid>
      <Grid
        item
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
        padding={{ xs: 3, sm: 6 }}
      >
        {children}
      </Grid>
      <Grid item container paddingLeft={{ xs: 3, sm: 6 }} paddingBottom={{ xs: 2 }}>
        <TermsFooter />
      </Grid>
    </Grid>
  );
};
