import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { RegisterCredentialsDTO } from "../auth/api/register.ts";
import toast from 'react-hot-toast';
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useUser, useRegister } from '../../utils/auth.tsx';
import { useUpdateUser } from '../../utils/customHooks/useUpdateProfile.ts';
import { PASSWORD_MINIMUM_LENGTH } from '../../utils/utils.ts';

export const ProfileUpdateForm = () => {
  const user = useUser();
  const { t } = useTranslation();

  const isUserExisting = user.data != null;
  const navigate = useNavigate(); // Use hooks at the top level
    //this is a hook from React-Query that allow us to use createUser(data) bellow
  const { mutateAsync: createUser } = useRegister();
  const [formValues, setFormValues] = useState({
    name: '',
    mail: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [errors, setErrors] = useState({
    name: '',
    mail: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const updateUserMutation = useUpdateUser();
  if(user != null && user.data != null) useEffect(() => {
    setFormValues((prev) => ({
      ...prev,
      name: user.data!.name,
      mail: user.data!.mail,
    }));
  }, [user.data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      name: '',
      mail: '',
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    };

    if (
      formValues.mail.trim() &&
      !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formValues.mail)
    ) {
      newErrors.mail = t('mailIsNotValid');
      valid = false;
    }

    if (isUserExisting && formValues.oldPassword.length < 1) {
      newErrors.oldPassword = t('passwordIsEmpty')
      valid = false;
    }

    if (formValues.newPassword && formValues.newPassword.length < PASSWORD_MINIMUM_LENGTH) {
      newErrors.newPassword = t('characterLimitForPassword', {
        PASSWORD_MINIMUM_LENGTH: PASSWORD_MINIMUM_LENGTH,
      });
      valid = false;
    }

    if (formValues.newPassword !== formValues.confirmPassword) {
      newErrors.confirmPassword = t('passwordMismatch');
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      if(isUserExisting){
        updateUserMutation.mutate(formValues, {
          onSuccess: () => {
            toast.success(t('userSuccessfullyUpdated'));
          },
          onError: () => {
            toast.error(t('toastErrorUpdateUser'));
          },
        });
      }
      else {
        async (data: RegisterCredentialsDTO) => {
          await createUser(data, {
            onSuccess: () => {
              toast.success(t("accountCreated"),{duration:10000});
              navigate("/");
            },
            onError: (error:any) =>
            {
              if(error.status === 409){
                toast.error("user_already_exists");
              } else
              toast.error("error creation: " + error.toString());
            }
          });
        }
      }     
    }
    else { 
      toast.error("There are some errors");
    }
  };
  const togglePasswordVisibility = (field: string) => {
    // @ts-ignore
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '40%',
        maxWidth: '400px',
      }}
    >
      <Typography variant="h5" sx={{ mb: 3 }}>
        {isUserExisting ? t('UpdateProfile') : t('CreateProfile')}
      </Typography>

      <TextField
        inputProps={{
          maxLength: 255,
        }}
        label={t('name')}
        name="name"
        value={formValues.name}
        onChange={handleChange}
        error={!!errors.name}
        helperText={errors.name}
        fullWidth
        sx={{ mb: 2 }}
      />

      <TextField
        inputProps={{
          maxLength: 255,
        }}
        label={t('mail')}
        name="mail"
        type="mail"
        value={formValues.mail}
        onChange={handleChange}
        error={!!errors.mail}
        helperText={errors.mail}
        fullWidth
        sx={{ mb: 2 }}
      />

      {
        isUserExisting ?
          <TextField
          label={t('oldPassword')}
          name="oldPassword"
          type={showPassword.oldPassword ? 'text' : 'password'}
          value={formValues.oldPassword}
          onChange={handleChange}
          error={!!errors.oldPassword}
          helperText={errors.oldPassword}
          fullWidth
          sx={{ mb: 2 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => togglePasswordVisibility('oldPassword')}
                  edge="end"
                >
                  {showPassword.oldPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }
          }
          inputProps={{ maxLength: 255 }}
          />
        :
        ''
      }
      

      <TextField
        label={t('newPassword')}
        name="newPassword"
        type={showPassword.newPassword ? 'text' : 'password'}
        value={formValues.newPassword}
        onChange={handleChange}
        error={!!errors.newPassword}
        helperText={errors.newPassword}
        fullWidth
        sx={{ mb: 2 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => togglePasswordVisibility('newPassword')}
                edge="end"
              >
                {showPassword.newPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        inputProps={{ maxLength: 255 }}
      />

      <TextField
        label={t('confirmPassword')}
        name="confirmPassword"
        type={showPassword.confirmPassword ? 'text' : 'password'}
        value={formValues.confirmPassword}
        onChange={handleChange}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword}
        fullWidth
        sx={{ mb: 2 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => togglePasswordVisibility('confirmPassword')}
                edge="end"
              >
                {showPassword.confirmPassword ? (
                  <VisibilityOff />
                ) : (
                  <Visibility />
                )}
              </IconButton>
            </InputAdornment>
          ),
        }}
        inputProps={{ maxLength: 255 }}
      />

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
      >
        {
          isUserExisting ?
          t('saveChanges') : t('sumbit') 
        }
      </Button>
    </Box>
  );
};
