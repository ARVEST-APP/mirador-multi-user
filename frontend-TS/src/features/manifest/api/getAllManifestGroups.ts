import { ProjectGroup } from "../../projects/types/types.ts";
import storage from "../../../utils/storage.ts";

export const getAllManifestGroups = async (manifestId: number): Promise<ProjectGroup[]> => {
  const token = storage.getToken();
  console.log('CONSOLE LOG GET GROUP ACCESS TO Manifest')
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/group-manifest/manifest/${manifestId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error(`Error fetching groups: ${response.statusText}`);
    }

    const toreTurn = await response.json();
    console.log(toreTurn)
    return toreTurn;
  } catch (error) {
    console.error("Error in getGroupsAccessToManifest:", error);
    return [];
  }
}