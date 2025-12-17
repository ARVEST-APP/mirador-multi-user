import { useTranslation } from 'react-i18next';
import Form, { FormTypes } from 'components/elements/Form.tsx';
import { useForm } from 'react-hook-form';
import { ForgotPasswordFormData, ForgotPasswordSchema } from '../types/types.ts';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { forgotPassword } from '../api/forgotPassword.ts';
import { ChangeEvent, useEffect, useState } from 'react';
import { AutomatedFormTextField, CommunFieldsName, defaultFormFields } from 'components/elements/FormField.tsx';

interface PropsForgotPasswordForm {
    mail?: string,
}

const ForgotPasswordForm = ({ mail }: PropsForgotPasswordForm) => {
    const { t } = useTranslation();

    const [email, setEmail] = useState(mail);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { value } = e.target;
        setEmail(value);
    };

    const onSubmit = async (data: ForgotPasswordFormData) => {
        try {
            await forgotPassword(data.mail);
            toast.success(t("successResetPassword"));
        } catch (error) {
            toast.error(t('passwordResetError'));
            if (error instanceof Error) {
                toast.error(error.message);
            }
        }
    };

    const forgotPasswordForm = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(ForgotPasswordSchema),
        mode: "onSubmit",
        reValidateMode: "onChange",
        shouldFocusError: true,
    });

    const { reset } = forgotPasswordForm;

    useEffect(() => {
        setEmail(mail);
    }, [mail, reset]);

    return (
        <Form
            name={FormTypes.forgotPassword}
            form={forgotPasswordForm}
            instructions={"explanationPasswordReset"}
            onSubmit={onSubmit}
            formElements={[new AutomatedFormTextField(CommunFieldsName.mail, { ...defaultFormFields.mail, value: email, handleOnChange: handleChange })]}
        />
    );
};

export default ForgotPasswordForm;
