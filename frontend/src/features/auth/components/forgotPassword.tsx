import {
  Grid,
  Typography,
} from '@mui/material';
import { Layout } from './layout.tsx';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import ForgotPasswordForm from './forgotPasswordForm.tsx';

const ForgotPassword = () => {
  const { t } = useTranslation();

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
      <ForgotPasswordForm />
    </Layout>
  );
};

export default ForgotPassword;
