export enum MediaGroupRights {
  ADMIN = 'admin',
  READER = 'reader',
  EDITOR = 'editor',
}

export enum GroupProjectRights {
  ADMIN = 'admin',
  READER = 'reader',
  EDITOR = 'editor',
}

export enum User_UserGroupRights {
  ADMIN = 'admin',
  READER = 'reader',
  EDITOR = 'editor',
}

export enum ManifestGroupRights {
  ADMIN = 'admin',
  READER = 'reader',
  EDITOR = 'editor',
}

export const ITEM_RIGHTS_PRIORITY = { admin: 3, editor: 2, reader: 1 };

export type ItemRights =
  | MediaGroupRights
  | GroupProjectRights
  | ManifestGroupRights;

export function canGrantItemRights(
  ownRights: ItemRights | undefined,
  rightsToGrant: ItemRights,
): boolean {
  const ownPriority = ITEM_RIGHTS_PRIORITY[ownRights] ?? 0;
  return (
    ownPriority >= ITEM_RIGHTS_PRIORITY.editor &&
    ITEM_RIGHTS_PRIORITY[rightsToGrant] <= ownPriority
  );
}
