import storage from "../../../utils/storage.ts";
import { BACKEND_URL } from "../../../config/config.ts";
import { ProjectUser } from "../../projects/types/types.ts";
export const getAllGroupProjects = async (groupId: number) :Promise<ProjectUser[]> => {
  const token = storage.getToken();
  console.log(groupId)
  try {
    const response = await fetch(`${BACKEND_URL}/group-project/${groupId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    const toReturn = await response.json();
    console.log("toReturn",toReturn)
    return await toReturn;
  } catch (error) {
    throw error;
  }
};
