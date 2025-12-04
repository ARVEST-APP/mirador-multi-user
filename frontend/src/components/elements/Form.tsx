import { FieldError, UseFormReturn } from "react-hook-form";
import { Button, Grid, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { t } from "i18next";
import { LoginFormData, RegisterFormData, UpdateFormData, ResetPasswordFormData, ForgotPasswordFormData } from "features/auth/types/types";
import LanguageSelector from "features/translation/LanguageSelector";
import FormTextField, { PasswordValidations } from "./FormField";
import { NavLink } from "react-router-dom";


const enum FormInputs {
    mail = "mail",
    confirmMail = "confirmMail",
    preferredLanguage = "preferredLanguage",
    name = "name",
    password = "password",
    newPassword = "newPassword",
    confirmPassword = "confirmPassword",
}

export interface IFormInput {
    name: string;
    placeholder?: string | number,
    value?: string | number,
    required?: boolean,
    helperText?: string,
    error?: FieldError,
    autocomplete?: string,
    onChangeValidation?: boolean,
    disabled?: boolean,
    isLocked?: boolean,
    conditional?: boolean,
}

interface IAllFormInput {
    newMail: IFormInput,
    mail: IFormInput,
    confirmMail: IFormInput,
    preferredLanguage: IFormInput,
    name: IFormInput,
    password: IFormInput,
    newPassword: IFormInput,
    confirmPassword: IFormInput,
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

export function getFormElements(name: FormTypes, form: UseFormReturn<any>): IFormInput[] {
    let formElements: IFormInput[];

    switch (name) {
        case FormTypes.register:
            const registerForm = form as UseFormReturn<RegisterFormData, any, undefined>;
            formElements = [
                { ...allFormInputs.preferredLanguage },
                { ...allFormInputs.newMail, error: registerForm.formState.errors.mail },
                { ...allFormInputs.confirmMail, error: registerForm.formState.errors.confirmMail },
                { ...allFormInputs.name, error: registerForm.formState.errors.name },
                { ...allFormInputs.newPassword, error: registerForm.formState.errors.newPassword },
                { ...allFormInputs.confirmPassword, error: registerForm.formState.errors.confirmPassword }
            ]
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
                { ...allFormInputs.mail, isLocked: true, error: updateProfileForm.formState.errors.mail },
                { ...allFormInputs.name, error: updateProfileForm.formState.errors.name },
                { ...allFormInputs.newPassword, isLocked: true, error: updateProfileForm.formState.errors.newPassword },
                { ...allFormInputs.confirmPassword, conditional: true, error: updateProfileForm.formState.errors.confirmPassword }
            ]

            break;
        case FormTypes.forgotPassword:
            const forgotPasswordForm = form as UseFormReturn<ForgotPasswordFormData, any, undefined>;
            formElements = [
                { ...allFormInputs.mail, error: forgotPasswordForm.formState.errors.mail }
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

// interface IFormTypes {
//     register: IFormsVariables,
//     login: IFormsVariables,
//     updateProfile: IFormsVariables,
//     forgotPassword: IFormsVariables,
//     resetPassword: IFormsVariables
// }

export interface IFormsVariables {
    elements: IFormInput[],
    form: UseFormReturn<RegisterFormData> | UseFormReturn<LoginFormData> | UseFormReturn<UpdateFormData> | UseFormReturn<ForgotPasswordFormData> | UseFormReturn<ResetPasswordFormData>
}

// const handleKeyDownEnterButton = (event: React.KeyboardEvent<HTMLButtonElement>, func: () => void) => {
//     event.key === 'Enter' && func;
// }

export interface FormProps {
    name: FormTypes,
    form: UseFormReturn<RegisterFormData> | UseFormReturn<LoginFormData> | UseFormReturn<UpdateFormData> | UseFormReturn<ForgotPasswordFormData> | UseFormReturn<ResetPasswordFormData>,
    elements: IFormInput[],
    instructions?: string,
    conditions?: { [input: string]: boolean; }
    onSubmit: (data: any) => Promise<void>,
    submitButton?: string,
    forgotPasswordButton?: boolean
}

const Form: React.FC<FormProps> = ({
    name,
    form,
    elements,
    conditions,
    instructions,
    onSubmit,
    submitButton = "submit",
    forgotPasswordButton
}: FormProps) => {

    // const loginVar: IFormsVariables = { elements: loginElements, form: loginForm };
    // const registerVar: IFormsVariables = { elements: registerElements, form: registerForm };
    // const updateProfileVar: IFormsVariables = { elements: updateProfileElements, form: updateProfileForm };
    // const forgotPasswordVar: IFormsVariables = { elements: forgotPasswordElements, form: forgotPasswordForm };
    // const resetPasswordVar: IFormsVariables = { elements: resetPasswordElements, form: resetPasswordForm };

    // const allForms: { [id: string]: IFormsVariables; } = {
    //     login: loginVar,
    //     register: registerVar,
    //     updateProfile: updateProfileVar,
    //     forgotPassword: forgotPasswordVar,
    //     resetPassword: resetPasswordVar,
    // };

    // const formToCreate = allForms[name];
    const { t } = useTranslation();

    // const form = formToCreate.form;
    const {
        register,
        handleSubmit
    } = form;

    return (
        <form name={name} aria-label={t('formLabel') + ' - ' + t(name)}>
            <Grid
                container
                display={"flex"}
                flexDirection="column"
                flexWrap={"wrap"}
                justifyContent="center"
                rowSpacing={2}
                // width={"fit-content"}
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

                                ((e.conditional != true || e.conditional && conditions && conditions[e.name]) &&
                                    <FormTextField
                                        form={form}
                                        label={t(e.name)}
                                        type={(e.name !== FormInputs.password && e.name !== FormInputs.newPassword && e.name !== FormInputs.confirmPassword) ? "text" : "password"}
                                        placeholder={t(e.placeholder ? e.placeholder.toString() : "")}
                                        name={e.name}
                                        required={e.required ? e.required : false}
                                        register={register}
                                        autocomplete={e.autocomplete}
                                        helperText={e.helperText}
                                        error={e.error}
                                        onChangeValidation={e.onChangeValidation}
                                    />
                                )
                        }
                        {e.name === FormInputs.newPassword && <PasswordValidations form={form} name={FormInputs.newPassword} errors={form.formState.errors} />}
                        {e.name === FormInputs.password && forgotPasswordButton &&
                            <Grid item alignSelf={"end"}>
                                <NavLink to='/forgot-password'>
                                    <Typography variant="button" color="primary">{t('forgotPassword')}</Typography>
                                </NavLink>
                            </Grid>
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
