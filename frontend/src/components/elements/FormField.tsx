import { FieldError, FieldErrors, FieldValues, UseFormRegister, UseFormReturn } from "react-hook-form";
import { Button, Grid, IconButton, InputAdornment, SvgIcon, SvgIconTypeMap, TextField, Tooltip, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { CloseRounded, DoneRounded, LockOutlined, Visibility, VisibilityOff } from "@mui/icons-material";
import { useState } from "react";
import { PASSWORD_MINIMUM_LENGTH } from "utils/utils";
import { t } from "i18next";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { MMUModal } from "./modal";
import ForgotPasswordForm from "features/auth/components/forgotPasswordForm";

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

const PasswordValidation = ({ isValid, hint, hasValue = true }: PropsPasswordValidation) => {
  return (
    <Grid container item alignItems={"center"} wrap="nowrap" marginBlockStart="5px">
      {isValid ? <ValidIcon isDisabled={!hasValue} aria-label={t(!hasValue ? "invalid" : "valid")} /> : <InvalidIcon isDisabled={!hasValue} aria-label={t("invalid")} />}
      <Typography aria-label={t(isValid && hasValue ? "valid" : "invalid")} variant="caption" className=".MuiFormHelperText-root" color={isValid ? "text.secondary" : "error"} paddingLeft="8px">{hint}</Typography>
    </Grid>
  )
}

interface PasswordCriteria {
  name: string;
  regexValidation: RegExp
}

const PasswordCriterias = {
  length: 'characterLimitForPassword',
  number: 'passwordRequiresNumber',
  case: 'passwordRequiresLowerCaseAndUppercase',
  specialChar: 'passwordRequiresSpecialChar'
}

export const PasswordCheck: PasswordCriteria[] = [
  { name: PasswordCriterias.length, regexValidation: new RegExp(".{" + PASSWORD_MINIMUM_LENGTH + "}") },
  { name: PasswordCriterias.case, regexValidation: /(?=.*[A-Z])(?=.*[a-z])/ },
  { name: PasswordCriterias.number, regexValidation: /[0-9]/ },
  { name: PasswordCriterias.specialChar, regexValidation: /[^A-Za-z0-9]/ }
]

interface PropsPasswordValidations<TFormValues extends FieldValues> {
  form: UseFormReturn<any, undefined>,
  name: string,
  errors: FieldErrors<TFormValues>
}

export const PasswordValidations = <TFormValues extends FieldValues, _>({ form, name, errors }: PropsPasswordValidations<TFormValues>) => {
  const passwordLenght: number = form.watch(name) ? form.watch(name).length : 0;
  return (
    Object.values(PasswordCriterias).map((criteria) => (
      <PasswordValidation
        key={criteria}
        isValid={errors.newPassword != undefined && errors.newPassword.message && errors.newPassword.message.toString().split(";").includes(criteria) ? false : true}
        hint={criteria == PasswordCriterias.length ?
          t(criteria, {
            PASSWORD_MINIMUM_LENGTH: PASSWORD_MINIMUM_LENGTH,
            PASSWORD_LENGTH: passwordLenght.toString().padStart(2, '0'),
          }) :
          t(criteria)}
        hasValue={passwordLenght > 0}
      />
    ))
  )
}

interface PropsIconedPlaceholder {
  placeholder: string
  icon: OverridableComponent<SvgIconTypeMap<{}, "svg">> & { muiName: string; }
  gap?: string
}

const IconedPlaceholder = ({ placeholder, icon, gap = "3px" }: PropsIconedPlaceholder) => {
  return (
    <Grid container alignItems={'center'} gap={gap} >
      <SvgIcon color="disabled" fontSize='medium' component={icon} />
      {placeholder}
    </Grid>
  )
}

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

// Define the interface for the FormField props
interface FormFieldProps extends IFormFieldSpecifications {
  error: FieldError | undefined;
  form: UseFormReturn<any, undefined>;
  label: string;
  register: UseFormRegister<any>;
  type: string;
  endAdornment?: JSX.Element;
  handleKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  startAdornment?: JSX.Element;
  valueAsNumber?: boolean;
}

const FormTextField: React.FC<FormFieldProps> = ({
  form,
  type,
  label,
  placeholder,
  placeholderIcon,
  name,
  value: initialValue,
  isDisabled: disabled = false,
  isLocked = false,
  register,
  isRequired: isRequired,
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

  return (
    <Tooltip title={(label ? label : "") + (isLocked ? " - " + t("passwordNeeded") : "")}>
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
        label={placeholderIcon ? <IconedPlaceholder icon={placeholderIcon} placeholder={placeholder} /> : placeholder}
        variant="outlined"
        {...register(name, { valueAsNumber })}
        error={!!error}
        helperText={
          error?.message && !error.message.includes(";") &&
          (helperText ? helperText + ' - ' : '') + t(error.message)
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



export const enum CommunFieldsName {
  newMail = "newMail",
  mail = "mail",
  confirmMail = "confirmMail",
  preferredLanguage = "preferredLanguage",
  name = "name",
  password = "password",
  newPassword = "newPassword",
  confirmPassword = "confirmPassword",
}

interface IDefaultFormFields {
  [index: string]: IFormFieldSpecifications
}

/**
 * default values (@see IFormFieldSpecifications ) for commun formFields (@see FieldName )
 * @remarks isRequired: true
 */
export const defaultFormFields: IDefaultFormFields = {
  "newMail":
    { name: CommunFieldsName.mail, placeholder: CommunFieldsName.mail, isRequired: true, helperText: t('emailSpelling'), autocomplete: "email", onChangeValidation: true },
  "mail":
    { name: CommunFieldsName.mail, placeholder: CommunFieldsName.mail, isRequired: true, autocomplete: "email" },
  "confirmMail":
    { name: CommunFieldsName.confirmMail, placeholder: CommunFieldsName.confirmMail, isRequired: true, onChangeValidation: true },
  "password":
    { name: CommunFieldsName.password, placeholder: CommunFieldsName.password, isRequired: true, autocomplete: "password" },
  "newPassword":
    { name: CommunFieldsName.newPassword, placeholder: CommunFieldsName.newPassword, isRequired: true, autocomplete: "new-password", onChangeValidation: true },
  "confirmPassword":
    { name: CommunFieldsName.confirmPassword, placeholder: CommunFieldsName.confirmPassword, isRequired: true, autocomplete: "new-password", onChangeValidation: true },
  "name":
    { name: CommunFieldsName.name, placeholder: CommunFieldsName.name, isRequired: true, autocomplete: "username" }
}

/**
 * Specifications for the display an automated FormTextField (@see FormTextField )
 */
export interface IFormFieldSpecifications {
  name: string;
  autocomplete?: string,
  handleOnChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void,
  helperText?: string,
  isDisabled?: boolean,
  isLocked?: boolean,
  isRequired?: boolean,
  isVisible?: boolean,
  onChangeValidation?: boolean,
  placeholder: string,
  placeholderIcon?: OverridableComponent<SvgIconTypeMap<{}, "svg">> & { muiName: string; },
  value?: string | number,
}

/**
 * If inputInfo is not specified, 
 * - if inputName is a CommunFieldsNamedefault : inputInfo = default values for the commun field
 * - otherwise, inputInfo = {name: inputName, placeholder: inputName, required: false}
 */
export type AutomatedFormTextFieldInfo = {
  inputName: CommunFieldsName | string;
  inputInfo?: IFormFieldSpecifications;
}

/**
 * Automate the creation of a FormTextField (@see FormTextField ) with its environnement 
 * 
 * @remarks If inputInfo is not specified, 
 * - if inputName is a CommunFieldsName:
 * inputInfo = default values for the commun field
 * - otherwise:
 * inputInfo = {name: inputName, placeholder: inputName, required: false}
 * 
 * @remarks Conditions of visibility, requirement and disablement will apply
 * @remarks A "password" field will be followed by a "Forget password" button
 * @remarks A "newPassword" field will be followed by a list of password validations
 */
export class AutomatedFormTextField {
  readonly info: AutomatedFormTextFieldInfo;

  constructor(name: CommunFieldsName, inputInfo?: IFormFieldSpecifications);
  constructor(info: AutomatedFormTextFieldInfo);
  constructor(param1: AutomatedFormTextFieldInfo | CommunFieldsName, param2?: IFormFieldSpecifications) {
    if (typeof param1 === "object")
      this.info = param1 as AutomatedFormTextFieldInfo;
    else
      this.info = { inputName: param1, inputInfo: param2 };
  };

  getName() {
    return this.info.inputName;
  }

  /**
 * @param form
 * @returns A form item, composed of the FormTextField (@see FormTextField )and its environment.
 * 
 * @remarks A custum field is by default non-required and have the same placeholder than its name
 * @remarks Conditions of visibility, requirement and disablement will apply
 * @remarks A "password" field will be followed by a "Forget password" button
 * @remarks A "newPassword" field will be followed by a list of password validations
 */
  getFormField(form: UseFormReturn<FieldValues>): JSX.Element | undefined {
    let input = this.info.inputInfo;
    if (!input)
      input = defaultFormFields[this.info.inputName];
    if (!input)
      input = { name: this.info.inputName, placeholder: this.info.inputName };

    const [resetPasswordModal, setResetPasswordModal] = useState(false);

    type Mail = FieldValues & {
      mail?: string;
    }

    return (
      <Grid item>
        {input && (input.isVisible !== false) &&
          <FormTextField
            form={form}
            label={t(input.name)}
            key={input.name}
            type={(input.name !== CommunFieldsName.password && input.name !== CommunFieldsName.newPassword && input.name !== CommunFieldsName.confirmPassword) ? "text" : "password"}
            placeholder={t(input.placeholder ? input.placeholder.toString() : "")}
            placeholderIcon={input.placeholderIcon ? input.placeholderIcon : input.isLocked ? LockOutlined : undefined}
            name={input.name}
            value={this.info.inputInfo?.value}
            isRequired={input.isRequired ? input.isRequired : false}
            isLocked={input.isLocked ? input.isLocked : false}
            isDisabled={input.isDisabled ? input.isDisabled : false}
            register={form.register}
            autocomplete={input.autocomplete}
            helperText={input.helperText}
            error={form.formState.errors[input.name as keyof typeof form.formState.errors] as FieldError}
            onChangeValidation={input.onChangeValidation}
            handleOnChange={input.handleOnChange ? input.handleOnChange : undefined}
          />
        }
        {input.name === CommunFieldsName.newPassword && <PasswordValidations form={form} name={CommunFieldsName.newPassword} errors={form.formState.errors} />}
        {
          input.name === CommunFieldsName.password &&
          <>
            <Grid item alignSelf={"end"}>
              <Button
                aria-label={t("forgotPassword")}
                variant={"text"}
                color="primary"
                onClick={() => { setResetPasswordModal(true) }}
              >
                {t('forgotPassword')}
              </Button>
            </Grid>
            {resetPasswordModal && <MMUModal
              openModal={resetPasswordModal}
              setOpenModal={setResetPasswordModal}
              width={"fit-content"}
              children={
                <ForgotPasswordForm mail={(form as unknown as UseFormReturn<Mail>).watch(CommunFieldsName.mail)} />
              }
            />}
          </>
        }
      </Grid>
    )
  }
}