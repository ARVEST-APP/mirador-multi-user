import { useEffect, useState } from "react";
import {
  Grid,
  Typography,
} from "@mui/material";
import { Layout } from "./layout.tsx";
import { resetPassword } from "../api/resetPassword.ts";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { ResetPasswordFormData, ResetPasswordSchema } from "../export.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import Form, { FormTypes, getFormElements } from "components/elements/Form.tsx";
import toast from "react-hot-toast";

export const ResetPassword = () => {
  const [token, setToken] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const url = window.location.href;
    const match = url.match(/\/reset-password\/(.+)/);
    if (match) {
      setToken(match[1]);
    } else {
      toast.error(t('errorToken'));
    }
  }, []);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error(t('invalidToken'));
    }
    if (token) {
      try {
        await resetPassword(token, data.newPassword);
        toast.success(t("passwordResetSuccess"));
      } catch {
        toast.error(t('passwordResetError'));
      }
    }
  };

  const resetPasswordForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(ResetPasswordSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });

  return (
    <Layout
      title={t("resetPasswordTitle")}
      rightButton={
        <Grid>
          <NavLink to="/auth/login">
            <Typography variant="button">{t("login")}</Typography>
          </NavLink>
        </Grid>
      }
    >
      <Form
        name={FormTypes.resetPassword}
        form={resetPasswordForm}
        elements={getFormElements(FormTypes.resetPassword, resetPasswordForm)}
        instructions={"explanationPasswordReset"}
        onSubmit={onSubmit}
        submitButton="resetPassword" />
    </Layout>
  );
};
