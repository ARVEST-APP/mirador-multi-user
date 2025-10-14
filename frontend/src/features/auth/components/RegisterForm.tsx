import { useForm } from "react-hook-form";
import { Button, Grid, Snackbar } from "@mui/material";
import FormTextField, { ToggleVisibility } from "components/elements/FormField.tsx";
import { RegisterFormData, UserSchema } from "../types/types.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegister } from "../../../utils/auth.tsx";
import { RegisterCredentialsDTO } from "../api/register.ts";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { PASSWORD_MINIMUM_LENGTH } from "utils/utils.ts";

export const RegisterForm = () => {
  const navigate = useNavigate(); // Use hooks at the top level
  const { t } = useTranslation();

  //this is a hook from React-Query that allow us to use createUser(data) bellow
  const { mutateAsync: createUser } = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(UserSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    shouldFocusError: true,
    // delayError: 700
  });

  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState("");

  const onSubmit = async (data: RegisterCredentialsDTO) => {
    await createUser(data, {
      onSuccess: () => {
        toast.success(t("accountCreated"), { duration: 10000 });
        navigate("/");
      },
      onError: (error: any) => {
        if (error.status === 409) {
          return setMessage(t("user_already_exists"));
        }
        setOpen(true);
        setMessage(error.toString());

        console.error("error creation", error);
      }
    });
  };

  const handleKeyDownEnterButton = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    console.log({ event });
    event.key === 'Enter' && handleSubmit(onSubmit)
  }

  const handleEnter = (/* event: React.KeyboardEvent<HTMLDivElement> */) => {
    // console.log({ event });
    // event.key === 'Enter' && event.preventDefault();
  }

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmationPassword, setShowConfirmationPassword] = React.useState(false);

  const handleClickShowPassword = () => {
    console.log("in handleClickShowPassword");
    console.log(showPassword);
    setShowPassword((show) => !show)
  };
  const handleClickShowConfirmationPassword = () => setShowConfirmationPassword((show) => !show);

  const [passwordLenght, setPasswordLenght] = useState(0);

  const updatePasswordLenght = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPasswordLenght(event.target.value.length);
  }

  return (
    <form aria-label={t('formLabel')}>
      <Snackbar open={open} message={message} autoHideDuration={10} />
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
            label={t("mail")}
            type="mail"
            placeholder={t("mail")}
            name="mail"
            required={true}
            register={register}
            error={errors.mail}
            autocomplete="email"
            helperText={t('emailSpelling')}
          />
        </Grid>
        <Grid item>
          <FormTextField
            label={t("confirmMail")}
            type="confirmMail"
            placeholder={t("confirm-mail")}
            name="confirmMail"
            register={register}
            required={true}
            error={errors.confirmMail}
          />
        </Grid>
        <Grid item>
          <FormTextField
            label={t("name")}
            type="text"
            placeholder={t("name")}
            name="name"
            autocomplete="username"
            required={true}
            register={register}
            error={errors.name}
          />
        </Grid>
        <Grid item>
          <FormTextField
            label={t("password")}
            type={showPassword ? 'text' : 'password'}
            placeholder={t("password")}
            name="password"
            autocomplete="new-password"
            register={register}
            required={true}
            error={errors.password} helperText={/* passwordLenght < PASSWORD_MINIMUM_LENGTH ? */ t('characterLimitForPassword', {
              PASSWORD_MINIMUM_LENGTH: PASSWORD_MINIMUM_LENGTH,
              PASSWORD_LENGTH: passwordLenght.toString().padStart(2, '0'),
            }) /* : "" */}
            endAdornment={
              <ToggleVisibility
                isShowing={showPassword}
                handleClickShow={handleClickShowPassword}
                hoverTextHiding={t('textHidding')}
                hoverTextShowing={t('textDisplay')}
              />
            }
            handleOnChange={updatePasswordLenght}

          />
        </Grid>
        <Grid item>
          <FormTextField
            label={t("confirmPassword")}
            type={showConfirmationPassword ? 'text' : 'password'}
            placeholder={t("confirmPassword")}
            name="confirmPassword"
            register={register}
            required={true}
            error={errors.confirmPassword}
            endAdornment={
              <ToggleVisibility
                isShowing={showConfirmationPassword}
                handleClickShow={handleClickShowConfirmationPassword}
                hoverTextHiding={t('textHidding')}
                hoverTextShowing={t('textDisplay')}
              />
            }
            handleKeyDown={handleEnter}
          />
        </Grid>
        <Grid item container>
          <Button
            type="submit"
            aria-label={t("submitForm")}
            variant="contained"
            color="primary"
            onClick={handleSubmit(onSubmit)}
            onKeyDown={handleKeyDownEnterButton}
          >
            {t("submit")}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};
