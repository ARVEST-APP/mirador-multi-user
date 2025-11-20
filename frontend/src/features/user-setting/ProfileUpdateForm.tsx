import React, { ChangeEvent, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Grid,
  Typography,
} from '@mui/material';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../utils/auth.tsx';
import { useUpdateUser } from '../../utils/customHooks/useUpdateProfile.ts';
import { PASSWORD_MINIMUM_LENGTH } from '../../utils/utils.ts';
import { UpdateFormData, UpdateUserSchema } from 'features/auth/export.ts';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormTextField from 'components/elements/FormField.tsx';

export const ProfileUpdateForm = () => {
  const user = useUser();
  const { t } = useTranslation();

  const [formValues, setFormValues] = useState({
    name: '',
    mail: '',
    password: '',
    newPassword: '',
    confirmPassword: '',
  });

  const { mutateAsync: updateUserMutation } = useUpdateUser();
  const form = useForm<UpdateFormData>({
    resolver: zodResolver(UpdateUserSchema),
    mode: "onTouched",
    // reValidateMode: "onBlur",
    shouldFocusError: true,
    // delayError: 700
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  if (user != null && user.data != null) useEffect(() => {
    setFormValues((prev) => ({
      ...prev,
      name: user.data!.name,
      mail: user.data!.mail,
    }));
  }, [user.data]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const [passwordLenght, setPasswordLenght] = useState(0);

  const updatePasswordLenght = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPasswordLenght(event.target.value.length);
  }

  const onSubmit = async (data: UpdateFormData) => {
    await updateUserMutation(data, {
      onSuccess: () => {
        toast.success(t('userSuccessfullyUpdated'));
      },
      onError: (error) => {
        toast.error(t('toastErrorUpdateUser') + ' ' + error.message);
      },
    });
  };

  const handleKeyDownEnterButton = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    event.key === 'Enter' && handleSubmit(onSubmit)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '40%',
        maxWidth: '400px',
      }}
    >
      <Typography variant="h5" sx={{ mb: 3 }}>
        {t('UpdateProfile')}
      </Typography>

      <form aria-label={t('formLabel')}>
        <Grid
          container
          display={"flex"}
          flexDirection="column"
          flexWrap={"wrap"}
          justifyContent="center"
          spacing={2}
          width={"fit-content"}
          maxWidth={"1000px"}
        >
          <Grid item>
            <FormTextField
              label={t("password")}
              type="password"
              placeholder={t("password")}
              name="password"
              // disabled={formValues.newPassword.length === 0 && formValues.mail === user.data!.mail}
              register={register}
              required={false}
              error={errors.password}
              // handleOnChange={updatePasswordLenght}
              handleOnChange={handleChange}
            />
          </Grid>
          <Grid item>
            <FormTextField
              label={t("mail")}
              type="mail"
              placeholder={t("mail")}
              name="mail"
              value={formValues.mail}
              isLocked={true}
              disabled={formValues.password.length === 0}
              handleOnChange={handleChange}
              required={false}
              register={register}
              error={errors.mail}
              autocomplete="email"
            // startAdornment={<LockOutlined color='disabled' fontSize='medium' />}
            />
          </Grid>
          <Grid item>
            <FormTextField
              label={t("name")}
              type="text"
              placeholder={t("name")}
              name="name"
              value={formValues.name}
              handleOnChange={handleChange}
              autocomplete="username"
              required={false}
              register={register}
              error={errors.name}
            />
          </Grid>

          <Grid item>
            <FormTextField
              form={form}
              label={t("newPassword")}
              type="password"
              placeholder={t("newPassword")}
              name="newPassword"
              autocomplete="new-password"
              register={register}
              required={false}
              isLocked={true}
              disabled={formValues.password.length === 0}
              error={errors.newPassword}
              onChangeValidation={true}
              helperText={
                t('characterLimitForPassword', {
                  PASSWORD_MINIMUM_LENGTH: PASSWORD_MINIMUM_LENGTH,
                  PASSWORD_LENGTH: passwordLenght.toString().padStart(2, '0'),
                })}
              handleOnChange={(e) => { updatePasswordLenght(e); handleChange(e) }}
            // startAdornment={<LockOutlined color='disabled' fontSize='medium' />}
            />
          </Grid>
          {formValues.newPassword.length > 0 &&
            <Grid item>
              <FormTextField
                form={form}
                label={t("confirmPassword")}
                type="password"
                placeholder={t("confirmPassword")}
                name="confirmPassword"
                autocomplete="new-password"
                register={register}
                required={false}
                error={errors.confirmPassword}
                onChangeValidation={true}
              // handleKeyDown={(event) => event.key === 'Enter' && handleSubmit(onSubmit)}
              />
            </Grid>
          }

          <Grid item container>
            <Button
              type="submit"
              aria-label={t("submitForm")}
              variant="contained"
              color="primary"
              onClick={handleSubmit(onSubmit)}
              onKeyDown={handleKeyDownEnterButton}
            >
              {t("saveChanges")}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};
