import { Button, Grid } from '@mui/material';
import FormTextField from 'components/elements/FormField.tsx';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginFormData, LoginSchema } from '../types/types.ts';
import { useLogin } from '../../../utils/auth.tsx';
import { LoginCredentialsDTO } from '../api/login.ts';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const LoginForm = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { mutateAsync: loginUser } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginCredentialsDTO) => {
    try {
      await loginUser(data, {
        onSuccess: () => navigate('/app/my-projects'),
      });
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleKeyDownEnterButton = (event: React.KeyboardEvent<HTMLButtonElement>, func: () => void) => {
    console.log({ event });
    event.key === 'Enter' && func;
  }

  return (
    <form>
      <Grid container flexDirection="column" spacing={2} style={{ minHeight: "fit-content" }}>
        <Grid item>
          <FormTextField
            type="mail"
            placeholder={t('mail')}
            name="mail"
            autocomplete='email'
            required={true}
            register={register}
            error={errors.mail}
          />
        </Grid>
        <Grid item container alignItems="center" spacing={2}>
          <Grid item>
            <FormTextField
              type="password"
              placeholder={t('password')}
              name="password"
              autocomplete='password'
              register={register}
              required={true}
              error={errors.password}
            />
          </Grid>
          <Grid item>
            <Button
              aria-label={t('forgot-password')}
              variant="text"
              color="primary"
              onClick={() => (window.location.href = '/forgot-password')}
              onKeyDown={(event) => handleKeyDownEnterButton(event, () => { (window.location.href = '/forgot-password') })}
            >
              {t('forgot-password')}
            </Button>
          </Grid>
        </Grid>
        <Grid item container>
          <Button
            type="submit"
            aria-label={t("submitForm")}
            variant="contained"
            color="primary"
            onClick={handleSubmit(onSubmit)}
            onKeyDown={(event) => handleKeyDownEnterButton(event, handleSubmit(onSubmit))}
          >
            {t('submit')}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};
