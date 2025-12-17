import { ChangeEvent, useEffect, useState } from 'react';
import {
  Box,
  Typography,
} from '@mui/material';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../utils/auth.tsx';
import { useUpdateUser } from '../../utils/customHooks/useUpdateProfile.ts';
import { setInitialMail, UpdateFormData, UpdateUserSchema } from 'features/auth/export.ts';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Form, { FormTypes } from 'components/elements/Form.tsx';
import { defaultFormFields, CommunFieldsName, AutomatedFormTextField } from 'components/elements/FormField.tsx';
import { KeyRounded } from '@mui/icons-material';

export const ProfileUpdateForm = () => {
  const user = useUser();
  const { t } = useTranslation();

  const [formValues, setFormValues] = useState({
    name: '',
    mail: '',
    newPassword: ''
  });

  const { mutateAsync: updateUserMutation } = useUpdateUser();
  const updateProfileform = useForm<UpdateFormData>({
    resolver: zodResolver(UpdateUserSchema),
    mode: "onTouched",
    shouldFocusError: true,
  });

  const { reset } = updateProfileform;

  if (user != null && user.data != null) {
    useEffect(() => {
      setInitialMail(user.data!.mail);
      setFormValues((prev) => ({
        ...prev,
        name: user.data!.name,
        mail: user.data!.mail,
      }));
      reset((prev) => ({
        ...prev,
        name: user.data!.name,
        mail: user.data!.mail,
      }))
    }, [user.data, reset]);

  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    updateProfileform.trigger("password");
  }, [formValues.mail, formValues.newPassword])

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

  const formElements = [
    new AutomatedFormTextField(
      CommunFieldsName.mail,
      {
        ...defaultFormFields.mail,
        handleOnChange: handleChange,
        isLocked: true,
        onChangeValidation: true,
      }),

    new AutomatedFormTextField(
      CommunFieldsName.name
    ),

    new AutomatedFormTextField(
      CommunFieldsName.newPassword,
      {
        ...defaultFormFields.newPassword,
        handleOnChange: handleChange,
        isLocked: true,
        onChangeValidation: true,
        isRequired: false,
      }),

    new AutomatedFormTextField(
      CommunFieldsName.confirmPassword,
      {
        ...defaultFormFields.confirmPassword,
        isVisible: formValues?.newPassword ? formValues.newPassword.length > 0 : false,
        isRequired: false,
      }),

    new AutomatedFormTextField(
      CommunFieldsName.password,
      {
        ...defaultFormFields.password,
        isDisabled: !((formValues && formValues.newPassword && formValues.newPassword.length > 0) || (formValues && user.data && formValues.mail !== user.data!.mail) || false),
        onChangeValidation: true,
        placeholderIcon: KeyRounded,
        isRequired: (formValues && formValues.newPassword && formValues.newPassword.length > 0) || (formValues && user.data && formValues.mail !== user.data!.mail) || false,
      })
  ]

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: 'fit-content',
        maxWidth: '400px',
      }}
    >
      <Typography variant="h5" sx={{ mb: 3 }}>
        {t('updateProfile')}
      </Typography>

      <Form name={FormTypes.login} form={updateProfileform} onSubmit={onSubmit} submitButtonText="updateProfile" formElements={formElements} />

    </Box>
  );
};
