import storage from "../../../utils/storage.ts";
import { ObjectTypes } from "../../tag/type.ts";

export const createMetadataForItem = async (objectTypes:ObjectTypes,objectId:number,metadataFormatTitle:string) => {
  const token = storage.getToken();
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/metadata`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ objectTypes: objectTypes,objectId:objectId ,metadataFormatTitle:metadataFormatTitle }),
    });
    return await response.json();
  } catch (error) {
    throw error;
  }
};
