import { UpdateFormData } from '../types/types.ts';
import storage from '../../../utils/storage.ts';
import { t } from 'i18next';

export const updateUser = async (updateUserDto: UpdateFormData) => {
  const token = storage.getToken();
  try {
    await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/users/update`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateUserDto),
      },

    ).then(response => {
      if (!response.ok) {
        return response.json().then(errorJson => {
          if (errorJson.statusCode === 401) {
            throw new Error(t("unauthorizedModification"));
          }
          else
            throw new Error(errorJson.message);
        });
      } else {
        return response.json();
      }
    }
    );
  } catch (error) {
    console.error(error);
    throw error;
  }
};
