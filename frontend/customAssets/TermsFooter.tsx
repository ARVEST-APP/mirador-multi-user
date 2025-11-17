// import { CustomTerms } from "./CustomTerms";
import { useTranslation } from "react-i18next";

let projetTermsLang = "EN";
export const updateProjetTermsLang = (selectedLanguage: string) => projetTermsLang = selectedLanguage.toUpperCase();

export const TermsFooter = () => {

  const projetTermsUrl = "/2025-08-29_AVST_DOC_CGU-" + projetTermsLang + ".pdf";

  const { t } = useTranslation();
  //You can define terms into src/features/miscellaneous/Terms.tsx
  return (
    <div>
      <a href={projetTermsUrl} target="_blank">{t("termsAndConditions")}</a>
      {/* <CustomTerms /> */}
    </div>
  )
};
