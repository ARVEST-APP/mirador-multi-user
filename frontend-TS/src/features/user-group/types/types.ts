import { User } from "../../auth/types/types.ts";

export type UserGroup = {

}

export type CreateGroupDto ={
  name: string;
  ownerId: number;
  users: User[];
}
