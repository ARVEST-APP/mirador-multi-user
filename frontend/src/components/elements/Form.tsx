import { FieldError, UseFormReturn } from "react-hook-form";
import { Button, Grid, SvgIconTypeMap, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { t } from "i18next";
import { LoginFormData, RegisterFormData, UpdateFormData, ResetPasswordFormData, ForgotPasswordFormData, Language } from "features/auth/types/types";
import LanguageSelector from "features/translation/LanguageSelector";
import FormTextField, { PasswordValidations } from "./FormField";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { KeyRounded, LockOutlined } from "@mui/icons-material";
import { MMUModal } from "./modal";
import { useState } from "react";
import ForgotPasswordForm from "features/auth/components/forgotPasswordForm";


export const enum FormInputs {
    newMail = "newMail",
    mail = "mail",
    confirmMail = "confirmMail",
    preferredLanguage = "preferredLanguage",
    name = "name",
    password = "password",
    newPassword = "newPassword",
    confirmPassword = "confirmPassword",
}

export interface IFormInputsValues {
    [input: string]: string | Language | undefined
}

export interface IFormInput {
    name: string;
    placeholder?: string | number,
    placeholderIcon?: OverridableComponent<SvgIconTypeMap<{}, "svg">> & { muiName: string; },
    value?: string | number,
    required?: boolean,
    helperText?: string,
    error?: FieldError,
    autocomplete?: string,
    onChangeValidation?: boolean,
    disabled?: boolean,
    isLocked?: boolean,
    conditional?: boolean,
    handleOnChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void,
}

// interface IAllFormInput {
//     newMail: IFormInput,
//     mail: IFormInput,
//     confirmMail: IFormInput,
//     preferredLanguage: IFormInput,
//     name: IFormInput,
//     password: IFormInput,
//     newPassword: IFormInput,
//     confirmPassword: IFormInput,
// }


interface IAllFormInput {
    [index: string]: IFormInput
}

export const allFormInputs: IAllFormInput = {
    "newMail":
        { name: FormInputs.mail, placeholder: FormInputs.mail, required: true, helperText: t('emailSpelling'), autocomplete: "email", onChangeValidation: true },
    "mail":
        { name: FormInputs.mail, placeholder: FormInputs.mail, required: true, autocomplete: "email" },
    "confirmMail":
        { name: FormInputs.confirmMail, placeholder: FormInputs.confirmMail, required: true, onChangeValidation: true },
    "password":
        { name: FormInputs.password, placeholder: FormInputs.password, required: true, autocomplete: "password" },
    "newPassword":
        { name: FormInputs.newPassword, placeholder: FormInputs.password, required: true, autocomplete: "new-password", onChangeValidation: true },
    "confirmPassword":
        { name: FormInputs.confirmPassword, placeholder: FormInputs.confirmPassword, required: true, autocomplete: "new-password", onChangeValidation: true },
    "name":
        { name: FormInputs.name, placeholder: FormInputs.name, required: true, autocomplete: "username" },
    "preferredLanguage":
        { name: FormInputs.preferredLanguage }
}

interface PropsFormElements {
    name: FormTypes, form: UseFormReturn<any>, handleOnChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}

export function getFormElements({ name, form, handleOnChange }: PropsFormElements): IFormInput[] {
    let formElements: IFormInput[] = [];

    switch (name) {
        case FormTypes.register:
            const registerForm = form as UseFormReturn<RegisterFormData, any, undefined>;
            formElements.push({ ...allFormInputs.preferredLanguage });

            const registerElementName = [
                FormInputs.newMail,
                FormInputs.confirmMail,
                FormInputs.name,
                FormInputs.newPassword,
                FormInputs.confirmPassword,
            ]

            registerElementName.forEach((input) => {
                formElements.push({ ...allFormInputs[input], error: registerForm.formState.errors[input === FormInputs.newMail ? FormInputs.mail : input as keyof typeof registerForm.formState.errors] as FieldError })
            })
            // formElements = [
            //     { ...allFormInputs.preferredLanguage },
            //     { ...allFormInputs.newMail, error: registerForm.formState.errors.mail },
            //     { ...allFormInputs.confirmMail, error: registerForm.formState.errors.confirmMail },
            //     { ...allFormInputs.name, error: registerForm.formState.errors.name },
            //     { ...allFormInputs.newPassword, error: registerForm.formState.errors.newPassword },
            //     { ...allFormInputs.confirmPassword, error: registerForm.formState.errors.confirmPassword }
            // ]
            break;
        case FormTypes.login:
            const loginForm = form as UseFormReturn<LoginFormData, any, undefined>;
            formElements = [
                { ...allFormInputs.mail, error: loginForm.formState.errors.mail },
                { ...allFormInputs.password, error: loginForm.formState.errors.password }
            ]
            break;
        case FormTypes.updateProfile:
            const updateProfileForm = form as UseFormReturn<UpdateFormData, any, undefined>;
            formElements = [
                { ...allFormInputs.mail, isLocked: true, error: updateProfileForm.formState.errors.mail, handleOnChange: handleOnChange, onChangeValidation: true },
                { ...allFormInputs.name, error: updateProfileForm.formState.errors.name, handleOnChange: handleOnChange },
                { ...allFormInputs.newPassword, required: false, placeholder: FormInputs.newPassword, isLocked: true, error: updateProfileForm.formState.errors.newPassword, handleOnChange: handleOnChange, onChangeValidation: true },
                { ...allFormInputs.confirmPassword, required: false, conditional: true, error: updateProfileForm.formState.errors.confirmPassword, onChangeValidation: true },
                { ...allFormInputs.password, required: undefined, conditional: true, placeholderIcon: KeyRounded, error: updateProfileForm.formState.errors.password, onChangeValidation: true }
            ]
            break;
        case FormTypes.forgotPassword:
            const forgotPasswordForm = form as UseFormReturn<ForgotPasswordFormData, any, undefined>;
            formElements = [
                { ...allFormInputs.mail, error: forgotPasswordForm.formState.errors.mail, handleOnChange: handleOnChange }
            ]
            break;
        case FormTypes.resetPassword:
            const resetPasswordForm = form as UseFormReturn<ResetPasswordFormData, any, undefined>;
            formElements = [
                { ...allFormInputs.newPassword, error: resetPasswordForm.formState.errors.newPassword },
                { ...allFormInputs.confirmPassword, error: resetPasswordForm.formState.errors.confirmPassword }
            ]
            break;
        default: formElements = [];
    }
    return formElements;
}

export enum FormTypes {
    register = "register",
    login = "login",
    updateProfile = "updateProfile",
    forgotPassword = "forgotPassword",
    resetPassword = "resetPassword"
}


export interface IElementConditions {
    disabled?: boolean,
    required?: boolean,
    visible?: boolean,
}

export interface IConditions {
    [input: string]: IElementConditions
}

export interface IFormsVariables {
    elements: IFormInput[],
    form: UseFormReturn<RegisterFormData> | UseFormReturn<LoginFormData> | UseFormReturn<UpdateFormData> | UseFormReturn<ForgotPasswordFormData> | UseFormReturn<ResetPasswordFormData>
}

export interface FormProps {
    name: FormTypes,
    form: UseFormReturn<RegisterFormData> | UseFormReturn<LoginFormData> | UseFormReturn<UpdateFormData> | UseFormReturn<ForgotPasswordFormData> | UseFormReturn<ResetPasswordFormData>,
    elements: IFormInput[],
    values?: IFormInputsValues,
    instructions?: string,
    conditions?: IConditions,
    onSubmit: (data: any) => Promise<void>,
    submitButton?: string,
    forgotPasswordButton?: boolean
}

const Form: React.FC<FormProps> = ({
    name,
    form,
    elements,
    values,
    conditions,
    instructions,
    onSubmit,
    submitButton = "submit",
    forgotPasswordButton
}: FormProps) => {

    const { t } = useTranslation();

    const {
        register,
        handleSubmit
    } = form;

    const [resetPasswordModal, setResetPasswordModal] = useState(false);

    return (
        <form name={name} aria-label={t('formLabel') + ' - ' + t(name)}>
            <Grid
                container
                display={"flex"}
                flexDirection="column"
                flexWrap={"wrap"}
                justifyContent="center"
                rowSpacing={2}
                width={{ sm: "400px", md: "500px" }}
                maxWidth={"500px"}
            >
                {instructions && <Typography variant="body2" align="center" sx={{ mb: 2 }}>
                    {t(instructions)}
                </Typography>}

                {elements.map((e) => (
                    <Grid item display={"flex"} flexDirection={"column"}>
                        {
                            e.name === FormInputs.preferredLanguage ?

                                <LanguageSelector name="preferredLanguage" /> :

                                ((e.conditional != true || e.conditional && conditions && conditions[e.name] && (conditions[e.name].visible === undefined || conditions[e.name].visible)) &&
                                    <FormTextField
                                        form={form}
                                        label={t(e.name)}
                                        type={(e.name !== FormInputs.password && e.name !== FormInputs.newPassword && e.name !== FormInputs.confirmPassword) ? "text" : "password"}
                                        placeholder={t(e.placeholder ? e.placeholder.toString() : "")}
                                        placeholderIcon={e.placeholderIcon ? e.placeholderIcon : e.isLocked ? LockOutlined : undefined}
                                        name={e.name}
                                        value={values && values[e.name]}
                                        required={
                                            e.required ?
                                                e.required
                                                : e.conditional && conditions && conditions[e.name]?.required ?
                                                    conditions[e.name].required as boolean
                                                    : false}
                                        isLocked={e.isLocked ? e.isLocked : false}
                                        disabled={e.disabled ? e.disabled : e.conditional && conditions && conditions[e.name] ? conditions[e.name].disabled : false}
                                        register={register}
                                        autocomplete={e.autocomplete}
                                        helperText={e.helperText}
                                        error={e.error}
                                        onChangeValidation={e.onChangeValidation}
                                        handleOnChange={e.handleOnChange ? e.handleOnChange : undefined}
                                    />
                                )
                        }
                        {e.name === FormInputs.newPassword && <PasswordValidations form={form} name={FormInputs.newPassword} errors={form.formState.errors} />}
                        {e.name === FormInputs.password && forgotPasswordButton &&
                            <> <Grid item alignSelf={"end"}>
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
                                        <ForgotPasswordForm mail={(name === FormTypes.login || name === FormTypes.updateProfile) ? (form as UseFormReturn<LoginFormData | UpdateFormData>).watch(FormInputs.mail) : ""} />
                                    }
                                />}
                            </>

                        }
                    </Grid>
                ))}
                <Grid item container>
                    <Button
                        type="submit"
                        aria-label={t("submitForm")}
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit(onSubmit)}
                    >
                        {t(submitButton)}
                    </Button>
                </Grid>
            </Grid>
        </form>
    );
};
export default Form;
