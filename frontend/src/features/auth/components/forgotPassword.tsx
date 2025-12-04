import {
  Grid,
  Typography,
} from '@mui/material';
import { Layout } from './layout.tsx';
import { forgotPassword } from '../api/forgotPassword.ts';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Form, { FormTypes, getFormElements } from 'components/elements/Form.tsx';
import { useForm } from 'react-hook-form';
import { ForgotPasswordFormData, ForgotPasswordSchema } from '../types/types.ts';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const { t } = useTranslation();

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

  return (
    <Layout
      title={t('titleForgotPassword')}
      rightButton={
        <Grid>
          <NavLink to="/auth/login">
            <Typography variant="button">{t('login')}</Typography>
          </NavLink>
        </Grid>
      }
    >
      <Form
        name={FormTypes.forgotPassword}
        form={forgotPasswordForm}
        elements={getFormElements(FormTypes.forgotPassword, forgotPasswordForm)}
        instructions={"explanationPasswordReset"}
        onSubmit={onSubmit} />
    </Layout>
  );
};

export default ForgotPassword;
