import i18n from "features/translation/i18n";
import { RegisterFormData, UserResponse } from "../export";


export const register = async (
  data: RegisterFormData,
): Promise<UserResponse> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/link-user-group/user`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          password: data.newPassword,
          preferredLanguage: i18n.language,
        }),
      },
    );
    if (!response.ok) {
      if (response.status === 409) {
        throw new Error("a user with this email or username already exists");
      }
      throw new Error("Failed to create user");
    }
    const user = await response.json();
    return user;
  } catch (error) {
    throw error;
  }
};
