import { Grid } from "@mui/material";
import { TermsFooter } from "./TermsFooter";

export const LandingFooter = () => {
  return (
    // <div>
    //   {/*Your content here*/}
    //   {/*<a href="/terms" target="_blank">Terms</a>*/}
    // </div>
    <Grid item container sx={{ width: "100%" }}>
      <TermsFooter />
    </Grid>
  );
};
