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
import Form, { FormInputs, FormTypes, getFormElements, IConditions, IFormInputsValues } from 'components/elements/Form.tsx';

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

  let values: IFormInputsValues = {};

  Object.entries(formValues).forEach(([key, value]) => {
    values[key] = value;
  });

  const conditions: IConditions = {
    [FormInputs.confirmPassword]:
    {
      visible: formValues?.newPassword ? formValues.newPassword.length > 0 : false
    },
    [FormInputs.password]:
    {
      required: (formValues && formValues.newPassword && formValues.newPassword.length > 0) || (formValues && user.data && formValues.mail !== user.data!.mail) || false,
      disabled: !((formValues && formValues.newPassword && formValues.newPassword.length > 0) || (formValues && user.data && formValues.mail !== user.data!.mail) || false),
    }
  }

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

      <Form
        name={FormTypes.updateProfile}
        form={updateProfileform}
        elements={getFormElements({ name: FormTypes.updateProfile, form: updateProfileform,/*  formValues, */ handleOnChange: handleChange })}
        values={values}
        onSubmit={onSubmit}
        conditions={conditions} submitButton="saveChanges" forgotPasswordButton={true} />
    </Box>
  );
};
