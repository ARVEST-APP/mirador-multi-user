import storage from "./storage.ts";
import { getUser } from "../features/auth/api/getUser.ts";
import {
  login,
  LoginFormData,
  register,
  RegisterFormData,
  User,
  UserResponse,
} from "../features/auth/export.ts";
import { configureAuth } from "react-query-auth";
import { CircularProgress, Grid } from "@mui/material";

export async function handleTokenResponse(data: UserResponse) {
  const { access_token, user } = data;
  storage.setToken(access_token);
  return user;
}

async function loadUser(): Promise<User | null> {
  if (storage.getToken()) {
    const data = await getUser();
    return data;
  }
  return null;
}

async function loginFn(data: LoginFormData) {
  const response = await login(data);
  return await handleTokenResponse(response);
}

async function registerFn(data: RegisterFormData) {
  const response = await register(data);
  const user = await handleTokenResponse(response);
  return user;
}

async function logoutFn() {
  storage.clearToken();
}

const authConfig = {
  userFn: loadUser,
  loginFn,
  registerFn,
  logoutFn,
  LoaderComponent() {
    return (
      <Grid>
        <CircularProgress />
      </Grid>
    );
  },
};

export const { useUser, useLogin, useRegister, useLogout } = configureAuth<
  User | null,
  unknown,
  LoginFormData,
  RegisterFormData
>(authConfig);
