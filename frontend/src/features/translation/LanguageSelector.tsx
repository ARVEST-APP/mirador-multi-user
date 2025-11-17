import { useTranslation } from "react-i18next";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { useEffect, useState } from "react";
import { loadLanguage } from "./loadLanguage.ts";
import { SelectChangeEvent } from "@mui/material";
import { availableLanguages } from "./i18n.ts";
import { updatePreferredLanguage } from "./api/updatePreferredLanguage.ts";
import { FieldError } from "react-hook-form";

interface LanguageSelectorProps {
  userId?: number;
  name?: string;
  error?: FieldError | undefined;
}

const LanguageSelector = ({ userId, name, error }: LanguageSelectorProps) => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);
  const availableLanguagesKeys: string[] = Object.keys(availableLanguages);

  useEffect(() => {
    setLanguage(i18n.language);
  }, [i18n.language]);

  const handleChange = async (event: SelectChangeEvent<string>) => {
    const selectedLanguage = event.target.value;
    setLanguage(selectedLanguage);
    await loadLanguage(selectedLanguage);
    userId && await updatePreferredLanguage(userId, selectedLanguage);
  };

  return (
    <Select
      name={name}
      value={language}
      onChange={handleChange}
      displayEmpty
      inputProps={{ "aria-label": "Select language" }}
      error={!!error}
    >
      {availableLanguagesKeys.map(lang => (
        <MenuItem key={lang} value={lang}>
          {availableLanguages[lang as keyof typeof availableLanguages]}
        </MenuItem>
      ))}
    </Select>
  );
};

export default LanguageSelector;
