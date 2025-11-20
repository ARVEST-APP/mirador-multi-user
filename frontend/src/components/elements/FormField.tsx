import { FieldError, UseFormRegister, UseFormReturn } from "react-hook-form";
import { Grid, IconButton, InputAdornment, TextField, Tooltip, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { CloseRounded, DoneRounded, LockOpenOutlined, LockOutlined, Visibility, VisibilityOff } from "@mui/icons-material";
import { useState } from "react";
import { PASSWORD_MINIMUM_LENGTH } from "utils/utils";
import { t } from "i18next";

// Define the interface for the FormField props
interface FormFieldProps {
  form?: UseFormReturn<any, undefined>;
  type: string;
  label?: string;
  placeholder: string;
  name: string;
  value?: string | number;
  disabled?: boolean;
  isLocked?: boolean;
  register: UseFormRegister<any>;
  required: boolean;
  error?: FieldError | undefined;
  helperText?: string;
  valueAsNumber?: boolean;
  endAdornment?: JSX.Element;
  startAdornment?: JSX.Element;
  autocomplete?: string;
  onChangeValidation?: boolean;
  handleKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  handleOnChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export interface PropsToogleVisibility {
  isShowing: boolean;
  hoverTextHiding?: string,
  hoverTextShowing?: string;
  handleClickShow: () => void;
}

const handleMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
  event.preventDefault();
};

const handleMouseUp = (event: React.MouseEvent<HTMLButtonElement>) => {
  event.preventDefault();
};

export const ToggleVisibility = ({ isShowing, handleClickShow, hoverTextHiding = 'hide the field', hoverTextShowing = 'display the field' }: PropsToogleVisibility) => {

  return (
    <InputAdornment position="end">
      <IconButton
        aria-label={
          isShowing ? hoverTextHiding : hoverTextShowing
        }
        onClick={handleClickShow}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        edge="end"
      >
        {isShowing ? <VisibilityOff /> : <Visibility />}
      </IconButton>
    </InputAdornment>
  )
}

interface PropsValidationIcons {
  isDisabled?: boolean,
  errorMessage?: string,
}

const ValidIcon = ({ isDisabled = true }: PropsValidationIcons) => {
  return <DoneRounded color={isDisabled ? "disabled" : "success"} />
}

const InvalidIcon = ({ isDisabled = true }: PropsValidationIcons) => {
  return <CloseRounded color={isDisabled ? "disabled" : "error"} />
}

interface PropsPasswordValidation {
  isValid: boolean,
  hint: string,
  hasValue?: boolean
}

export const PasswordValidation = ({ isValid, hint, hasValue = true }: PropsPasswordValidation) => {
  return (
    <Grid container item alignItems={"center"}>
      {isValid ? <ValidIcon isDisabled={!hasValue} aria-label={t(!hasValue ? "invalid" : "valid")} /> : <InvalidIcon isDisabled={!hasValue} aria-label={t("invalid")} />}
      <Typography aria-label={t(isValid && hasValue ? "valid" : "invalid")} variant="caption" className=".MuiFormHelperText-root" color={isValid ? "text.secondary" : "error"}>{hint}</Typography>
    </Grid>
  )
}

interface PasswordCriteria {
  name: string;
  regexValidation: RegExp
}

export const PasswordCriterias = {
  length: 'characterLimitForPassword',
  number: 'passwordRequiresNumber',
  specialChar: 'passwordRequiresSpecialChar'
}

export const PasswordCheck: PasswordCriteria[] = [
  { name: PasswordCriterias.length, regexValidation: new RegExp(".{" + PASSWORD_MINIMUM_LENGTH + "}") },
  { name: PasswordCriterias.number, regexValidation: /[0-9]/ },
  { name: PasswordCriterias.specialChar, regexValidation: /[^A-Za-z0-9]/ }
]

// Focus next input field
// const defaultHandleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
//   if (event.key === "Enter") {
//     event.preventDefault();
//     var inputs = document.getElementsByTagName("input");
//     for (var i = 0; i < inputs.length; i++) {
//       if (inputs[i] == document.activeElement) {
//         i + 1 < inputs.length && inputs[i + 1].focus();
//         break;
//       }
//     }
//   }
// }

// Go to the next focusable form element
const defaultHandleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, submitFunc?: () => void) => {
  if (event.key === "Enter") {
    event.preventDefault();

    let formElements = document.forms[0].elements;

    for (var i = 0; i < formElements.length; i++) {
      if (formElements[i] == document.activeElement) {
        // Get the next focusable element of the form
        let j = 0;
        do {
          j++;
          if (formElements[i + j] instanceof HTMLElement) {
            switch (formElements[i + j].tagName.toUpperCase()) {
              // Submit if the actual element is the last one of the list
              case "BUTTON":
                if (formElements[i + j] instanceof HTMLButtonElement && (formElements[i + j] as HTMLButtonElement).type == "submit") {
                  (formElements[i + j] as HTMLElement).focus();
                  if (submitFunc) submitFunc();
                }
                break;
              case "INPUT":
              case "SELECT":
              case "TEXTAREA":
                (formElements[i + j] as HTMLElement).focus();
                break;
              default:
                break;
            }
          }
        }
        while (i + j < formElements.length && formElements[i + j] != document.activeElement)
        break;
      }
    }
  }
}

// export const handleEnterLastFormField = (event: React.KeyboardEvent<HTMLDivElement>, func: () => void) => {
//   if (event.key === 'Enter') {
//     const buttons: HTMLCollectionOf<HTMLButtonElement> = document.getElementsByTagName("button");
//     for (let i = 0; i < buttons.length; i++) {
//       if (buttons[i].type == "submit") {
//         buttons[i].focus();
//         func();
//         break;
//       }
//     }
//   }
// };

const FormTextField: React.FC<FormFieldProps> = ({
  form,
  type,
  label,
  placeholder,
  name,
  value: initialValue,
  disabled = false,
  isLocked = false,
  register,
  required: isRequired,
  error,
  helperText,
  valueAsNumber,
  endAdornment: JSXendAdornment,
  startAdornment: JSXstartAdornment,
  autocomplete,
  onChangeValidation,
  handleKeyDown = defaultHandleKeyDown,
  handleOnChange,
}: FormFieldProps) => {

  const { t } = useTranslation();

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword((show) => !show)
  };

  const passwordEnAdornment: JSX.Element =
    <ToggleVisibility
      isShowing={showPassword}
      handleClickShow={handleClickShowPassword}
      hoverTextHiding={t('textHidding')}
      hoverTextShowing={t('textDisplay')}
    />

  JSXendAdornment = JSXendAdornment == undefined && type == "password" ? passwordEnAdornment : JSXendAdornment;


  interface PropsPlaceholder {
    placeholder: string,
    isLocked?: boolean,
    disabled?: boolean
  }
  const Placeholder = ({ placeholder, isLocked, disabled }: PropsPlaceholder) => {
    if (isLocked && disabled)
      return (<Grid container alignContent={'center'}><LockOutlined color='disabled' fontSize='medium' /> {placeholder} </Grid>)
    else if (isLocked)
      return (<Grid container alignContent={'center'}><LockOpenOutlined color='disabled' fontSize='medium' /> {placeholder} </Grid>)
    else
      return placeholder;
  }

  return (
    <Tooltip title={(label ? label : "") + (isLocked ? " - le mot de passe est nécessaire" : "")}>
      <TextField
        disabled={disabled}
        style={{ width: "100%" }}
        required={isRequired}
        type={type === "password" ? (showPassword ? 'text' : 'password') : type}
        value={initialValue}
        aria-label={label}
        inputProps={{
          maxLength: 255,
        }}
        label={<Placeholder placeholder={placeholder} isLocked={isLocked} disabled={disabled} />}
        variant="outlined"
        {...register(name, { valueAsNumber })}
        error={!!error}
        helperText={/* helperText || */
          error?.message && !error.message.includes(";") &&
          // (error.message === 'characterLimitForPassword' ?
          //   t('characterLimitForPassword', { PASSWORD_MINIMUM_LENGTH: PASSWORD_MINIMUM_LENGTH, PASSWORD_LENGTH: value?.toString() }) :
          (helperText ? helperText + ' - ' : '') + t(error.message)
          // )
          || helperText
        }
        InputProps={{
          endAdornment: JSXendAdornment,
          autoComplete: autocomplete,
          startAdornment: JSXstartAdornment
        }}
        onKeyDown={handleKeyDown}
        onChange={(e) => {
          handleOnChange && handleOnChange(e);
          if (onChangeValidation == true && form) {
            form?.setValue(name, e.target.value);
            form?.trigger(name);
          }
        }}
      />
    </Tooltip>
  );
};
export default FormTextField;
