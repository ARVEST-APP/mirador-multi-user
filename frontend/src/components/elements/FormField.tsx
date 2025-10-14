import React from "react";
import { FieldError, /* SubmitErrorHandler, SubmitHandler, */ UseFormRegister } from "react-hook-form";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Visibility, VisibilityOff } from "@mui/icons-material";
// import { RegisterCredentialsDTO } from "features/auth/api/register";
// import { LoginFormData, RegisterFormData } from "features/auth/types/types";
// import { LoginCredentialsDTO } from "features/auth/export";

// Define the interface for the FormField props
interface FormFieldProps {
  type: string;
  label?: string;
  placeholder: string;
  name: string;
  value?: string | number;
  register: UseFormRegister<any>;
  required: boolean;
  error?: FieldError | undefined;
  helperText?: string;
  valueAsNumber?: boolean;
  endAdornment?: JSX.Element;
  autocomplete?: string;
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

const defaultHandleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
  if (event.key === "Enter") {
    event.preventDefault();
    var inputs = document.getElementsByTagName("input");
    for (var i = 0; i < inputs.length; i++) {
      if (inputs[i] == document.activeElement) {
        i + 1 < inputs.length && inputs[i + 1].focus();
        break;
      }
    }
  }
}

const FormTextField: React.FC<FormFieldProps> = ({
  type,
  label,
  placeholder,
  name,
  value,
  register,
  required: isRequired,
  error,
  helperText,
  valueAsNumber,
  endAdornment: JSXendAdornment,
  autocomplete,
  handleKeyDown = defaultHandleKeyDown,
  handleOnChange,
}: FormFieldProps) => {

  const { t } = useTranslation();

  return (
    <TextField
      style={{ width: "100%" }}
      required={isRequired}
      type={type}
      value={value}
      aria-label={label}
      inputProps={{
        maxLength: 255,
      }}
      label={placeholder}
      variant="outlined"
      {...register(name, { valueAsNumber })}
      error={!!error}
      helperText={helperText || error?.message && t(error.message)}
      InputProps={{
        endAdornment: JSXendAdornment,
        autoComplete: autocomplete
      }}
      onKeyDown={handleKeyDown}
      onChange={handleOnChange}
    />);
};
export default FormTextField;
