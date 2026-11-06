/***********************************************************
 * Utils constants of MMU Backend
 **********************************************************/

// Upload folder to store file.
// This folder is mounted by volume on the host and exposed the caddy container
// See docker-compose.yml file for more details
export const UPLOAD_FOLDER = './upload';

// multer limits shared by the upload forms. Their field names are flat
// (`file`, `idCreator`, `user_group`), so a name with brackets is refused
// before multer builds nested objects or arrays from it.
export const UPLOAD_FORM_LIMITS = {
  fieldNestingDepth: 0,
  fields: 10,
};

export const LOGS_FOLDER = './logs';

// Default snapshot file name
export const DEFAULT_PROJECT_SNAPSHOT_FILE_NAME = 'workspace.json';

export const THUMBNAIL_FILE_SUFFIX = '_thumbnail.webp';
