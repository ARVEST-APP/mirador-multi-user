import { FieldValues, UseFormReturn } from "react-hook-form";
import { Button, Grid, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { AutomatedFormTextField } from "./FormField";


/**
 * All existing forms
 */
export enum FormTypes {
    register = "register",
    login = "login",
    updateProfile = "updateProfile",
    forgotPassword = "forgotPassword",
    resetPassword = "resetPassword"
}

export interface FormProps<TFormValues extends FieldValues> {
    name: FormTypes | string,
    form: UseFormReturn<TFormValues>,
    formElements: (JSX.Element | AutomatedFormTextField)[],
    instructions?: string,
    onSubmit: (data: any) => Promise<void>,
    submitButtonText?: string,
}

/**
 * Create a uniformized form composed of :
 * - The instruction if given
 * - The form fields in order
 * - A sumbit button
 * @param name form name
 * @param form UseFormReturn
 * @param formElements an array of all fields in the form, in order (can be custom fields, or the field informations used to automaticaly create a FormTextField)
 * @param instructions displayed at the top of the form
 * @param onSubmit submit action
 * @param submitButtonText submit button label (@default "submit")
 * @returns 
 */
const Form: React.FC<FormProps<any>> = ({
    name,
    form,
    formElements,
    instructions,
    onSubmit,
    submitButtonText: submitButton = "submit",
}: FormProps<any>) => {

    const { t } = useTranslation();

    const {
        handleSubmit
    } = form;

    function getComponents() {
        let components: JSX.Element[] = [];
        formElements.map((child) => {
            try {
                if (child instanceof AutomatedFormTextField) {
                    const formField = child.getFormField(form);
                    if (formField)
                        components.push(formField);
                    else
                        throw Error("No component have been created from the TextFormField " + child.getName());
                }
                else {
                    components.push(child as JSX.Element);
                }
            }
            catch (e) {
                console.error(e);
            }
        })

        return components;
    }

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

                {getComponents()}

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
