import { useForm } from "react-hook-form";
import { Button, Grid, Snackbar } from "@mui/material";
import FormTextField, { PasswordValidation } from "components/elements/FormField.tsx";
import { RegisterFormData, RegisterSchema } from "../types/types.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegister } from "../../../utils/auth.tsx";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { PASSWORD_MINIMUM_LENGTH } from "utils/utils.ts";
import LanguageSelector from "features/translation/LanguageSelector.tsx";

export const RegisterForm = () => {
  const navigate = useNavigate(); // Use hooks at the top level
  const { t } = useTranslation();

  //this is a hook from React-Query that allow us to use createUser(data) bellow
  const { mutateAsync: createUser } = useRegister();
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    shouldFocusError: true,
    // delayError: 700
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState("");

  const onSubmit = async (data: RegisterFormData) => {
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
    event.key === 'Enter' && handleSubmit(onSubmit)
  }

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
          <LanguageSelector name="preferredLanguage" />
        </Grid>
        <Grid item>
          <FormTextField
            form={form}
            label={t("mail")}
            type="mail"
            placeholder={t("mail")}
            name="mail"
            required={true}
            register={register}
            autocomplete="email"
            helperText={t('emailSpelling')}
            error={errors.mail}
            onChangeValidation={true}
          />
        </Grid>
        <Grid item>
          <FormTextField
            form={form}
            label={t("confirmMail")}
            type="confirmMail"
            placeholder={t("confirm-mail")}
            name="confirmMail"
            register={register}
            required={true}
            error={errors.confirmMail}
            onChangeValidation={true}
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
            form={form}
            label={t("password")}
            type="password"
            placeholder={t("password")}
            name="newPassword"
            autocomplete="new-password"
            register={register}
            required={true}
            error={errors.newPassword}
            onChangeValidation={true}
            // helperText={
            //   t('characterLimitForPassword', {
            //     PASSWORD_MINIMUM_LENGTH: PASSWORD_MINIMUM_LENGTH,
            //     PASSWORD_LENGTH: passwordLenght.toString().padStart(2, '0'),
            //   })
            // }
            handleOnChange={(e) => { updatePasswordLenght(e); }}
          />
        </Grid>
        <PasswordValidation
          isValid={errors.newPassword != undefined && (errors.newPassword.message === "characterLimitForPassword" || errors.newPassword.message === "requiredField") /* passwordLenght < PASSWORD_MINIMUM_LENGTH */ ? false : true}
          hint={t('characterLimitForPassword', {
            PASSWORD_MINIMUM_LENGTH: PASSWORD_MINIMUM_LENGTH,
            PASSWORD_LENGTH: passwordLenght.toString().padStart(2, '0'),
          })}
          hasValue={passwordLenght > 0 || errors.newPassword != undefined}
        />
        <PasswordValidation
          isValid={passwordLenght > 0 || errors.newPassword === undefined}
          hint={"Un joli mot de passe"}
          hasValue={passwordLenght > 0 || errors.newPassword != undefined}
        />
        <Grid item>
          <FormTextField
            form={form}
            label={t("confirmPassword")}
            type="password"
            placeholder={t("confirmPassword")}
            name="confirmPassword"
            register={register}
            required={true}
            error={errors.confirmPassword}
            onChangeValidation={true}
          // handleKeyDown={(event) => event.key === 'Enter' && handleSubmit(onSubmit)}
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
