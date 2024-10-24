/* eslint-disable */
export default async () => {
    const t = {
        ["./BaseEntities/project/dto/create-project.dto"]: await import("./BaseEntities/project/dto/create-project.dto"),
        ["./enum/origins"]: await import("./enum/origins"),
        ["./LinkModules/link-media-group/entities/link-media-group.entity"]: await import("./LinkModules/link-media-group/entities/link-media-group.entity"),
        ["./enum/rights"]: await import("./enum/rights"),
        ["./BaseEntities/media/entities/media.entity"]: await import("./BaseEntities/media/entities/media.entity"),
        ["./BaseEntities/user-group/entities/user-group.entity"]: await import("./BaseEntities/user-group/entities/user-group.entity"),
        ["./BaseEntities/users/entities/user.entity"]: await import("./BaseEntities/users/entities/user.entity"),
        ["./LinkModules/link-manifest-group/entities/link-manifest-group.entity"]: await import("./LinkModules/link-manifest-group/entities/link-manifest-group.entity"),
        ["./BaseEntities/manifest/entities/manifest.entity"]: await import("./BaseEntities/manifest/entities/manifest.entity"),
        ["./enum/user-group-types"]: await import("./enum/user-group-types"),
        ["./LinkModules/link-group-project/entities/link-group-project.entity"]: await import("./LinkModules/link-group-project/entities/link-group-project.entity"),
        ["./LinkModules/link-user-group/entities/link-user-group.entity"]: await import("./LinkModules/link-user-group/entities/link-user-group.entity"),
        ["./BaseEntities/project/entities/project.entity"]: await import("./BaseEntities/project/entities/project.entity")
    };
    return { "@nestjs/swagger": { "models": [[import("./BaseEntities/project/dto/create-project.dto"), { "CreateProjectDto": { title: { required: true, type: () => String }, userWorkspace: { required: false, type: () => Object }, ownerId: { required: true, type: () => Number }, metadata: { required: true, type: () => Object } } }], [import("./BaseEntities/users/dto/create-user.dto"), { "CreateUserDto": { mail: { required: true, type: () => String }, name: { required: true, type: () => String }, password: { required: true, type: () => String }, Projects: { required: true, type: () => [t["./BaseEntities/project/dto/create-project.dto"].CreateProjectDto] } } }], [import("./BaseEntities/media/entities/media.entity"), { "Media": { id: { required: true, type: () => Number }, url: { required: true, type: () => String }, path: { required: true, type: () => String }, thumbnailUrl: { required: true, type: () => String }, hash: { required: true, type: () => String }, title: { required: true, type: () => String }, metadata: { required: true, type: () => Object }, origin: { required: true, enum: t["./enum/origins"].mediaOrigin }, description: { required: true, type: () => String }, idCreator: { required: true, type: () => Number }, created_at: { required: true, type: () => Date }, updated_at: { required: true, type: () => Date }, linkMediaGroup: { required: true, type: () => t["./LinkModules/link-media-group/entities/link-media-group.entity"].LinkMediaGroup } } }], [import("./LinkModules/link-media-group/entities/link-media-group.entity"), { "LinkMediaGroup": { id: { required: true, type: () => Number }, rights: { required: true, enum: t["./enum/rights"].MediaGroupRights }, media: { required: true, type: () => t["./BaseEntities/media/entities/media.entity"].Media }, user_group: { required: true, type: () => t["./BaseEntities/user-group/entities/user-group.entity"].UserGroup } } }], [import("./LinkModules/link-user-group/entities/link-user-group.entity"), { "LinkUserGroup": { id: { required: true, type: () => Number }, rights: { required: true, enum: t["./enum/rights"].User_UserGroupRights }, user: { required: true, type: () => t["./BaseEntities/users/entities/user.entity"].User }, user_group: { required: true, type: () => t["./BaseEntities/user-group/entities/user-group.entity"].UserGroup } } }], [import("./BaseEntities/manifest/entities/manifest.entity"), { "Manifest": { id: { required: true, type: () => Number }, thumbnailUrl: { required: true, type: () => String }, origin: { required: true, enum: t["./enum/origins"].manifestOrigin }, path: { required: true, type: () => String }, hash: { required: true, type: () => String }, title: { required: true, type: () => String }, description: { required: true, type: () => String }, metadata: { required: true, type: () => Object }, idCreator: { required: true, type: () => Number }, url: { required: true, type: () => String }, created_at: { required: true, type: () => Date }, updated_at: { required: true, type: () => Date }, linkManifestGroup: { required: true, type: () => t["./LinkModules/link-manifest-group/entities/link-manifest-group.entity"].LinkManifestGroup } } }], [import("./LinkModules/link-manifest-group/entities/link-manifest-group.entity"), { "LinkManifestGroup": { id: { required: true, type: () => Number }, rights: { required: true, enum: t["./enum/rights"].ManifestGroupRights }, manifest: { required: true, type: () => t["./BaseEntities/manifest/entities/manifest.entity"].Manifest }, user_group: { required: true, type: () => t["./BaseEntities/user-group/entities/user-group.entity"].UserGroup } } }], [import("./BaseEntities/user-group/entities/user-group.entity"), { "UserGroup": { id: { required: true, type: () => Number }, title: { required: true, type: () => String }, ownerId: { required: true, type: () => Number }, thumbnailUrl: { required: true, type: () => String }, description: { required: true, type: () => String }, type: { required: true, enum: t["./enum/user-group-types"].UserGroupTypes }, linkGroupProjects: { required: true, type: () => [t["./LinkModules/link-group-project/entities/link-group-project.entity"].LinkGroupProject] }, linkMediaGroup: { required: true, type: () => t["./LinkModules/link-media-group/entities/link-media-group.entity"].LinkMediaGroup }, linkUserGroups: { required: true, type: () => [t["./LinkModules/link-user-group/entities/link-user-group.entity"].LinkUserGroup] }, linkManifestGroup: { required: true, type: () => [t["./LinkModules/link-manifest-group/entities/link-manifest-group.entity"].LinkManifestGroup] } } }], [import("./LinkModules/link-group-project/entities/link-group-project.entity"), { "LinkGroupProject": { id: { required: true, type: () => Number }, rights: { required: true, enum: t["./enum/rights"].GroupProjectRights }, project: { required: true, type: () => t["./BaseEntities/project/entities/project.entity"].Project }, user_group: { required: true, type: () => t["./BaseEntities/user-group/entities/user-group.entity"].UserGroup } } }], [import("./BaseEntities/project/entities/project.entity"), { "Project": { id: { required: true, type: () => Number }, title: { required: true, type: () => String }, description: { required: true, type: () => String }, thumbnailUrl: { required: true, type: () => String }, ownerId: { required: true, type: () => Number }, userWorkspace: { required: false, type: () => Object }, metadata: { required: true, type: () => Object }, created_at: { required: true, type: () => Date }, linkGroupProjectsIds: { required: true, type: () => [t["./LinkModules/link-group-project/entities/link-group-project.entity"].LinkGroupProject] } } }], [import("./BaseEntities/users/entities/user.entity"), { "User": { id: { required: true, type: () => Number }, mail: { required: true, type: () => String }, name: { required: true, type: () => String }, password: { required: true, type: () => String }, createdAt: { required: true, type: () => Date }, linkUserGroups: { required: true, type: () => [t["./LinkModules/link-user-group/entities/link-user-group.entity"].LinkUserGroup] } } }], [import("./BaseEntities/user-group/dto/create-user-group.dto"), { "CreateUserGroupDto": { title: { required: true, type: () => String }, ownerId: { required: true, type: () => Number }, user: { required: true, type: () => t["./BaseEntities/users/entities/user.entity"].User }, type: { required: true, enum: t["./enum/user-group-types"].UserGroupTypes } } }], [import("./BaseEntities/user-group/dto/update-user-group.dto"), { "UpdateUserGroupDto": { ownerId: { required: true, type: () => Number }, id: { required: true, type: () => Number }, rights: { required: true, enum: t["./enum/rights"].User_UserGroupRights } } }], [import("./auth/dto/login.dto"), { "loginDto": { mail: { required: true, type: () => String }, password: { required: true, type: () => String } } }], [import("./BaseEntities/project/dto/update-project.dto"), { "UpdateProjectDto": { id: { required: true, type: () => Number } } }], [import("./BaseEntities/media/dto/create-media.dto"), { "CreateMediaDto": { path: { required: true, type: () => String }, idCreator: { required: true, type: () => Number }, title: { required: true, type: () => String }, description: { required: true, type: () => String }, user_group: { required: true, type: () => t["./BaseEntities/user-group/entities/user-group.entity"].UserGroup } } }], [import("./BaseEntities/media/dto/update-media.dto"), { "UpdateMediaDto": { id: { required: true, type: () => Number } } }], [import("./LinkModules/link-group-project/dto/create-link-group-project.dto"), { "CreateLinkGroupProjectDto": { rights: { required: true, enum: t["./enum/rights"].GroupProjectRights }, project: { required: true, type: () => t["./BaseEntities/project/entities/project.entity"].Project }, user_group: { required: true, type: () => t["./BaseEntities/user-group/entities/user-group.entity"].UserGroup } } }], [import("./LinkModules/link-group-project/dto/update-link-group-project.dto"), { "UpdateLinkGroupProjectDto": { rights: { required: true, enum: t["./enum/rights"].GroupProjectRights }, project: { required: true, type: () => t["./BaseEntities/project/entities/project.entity"].Project }, user_group: { required: true, type: () => t["./BaseEntities/user-group/entities/user-group.entity"].UserGroup } } }], [import("./LinkModules/link-user-group/dto/create-link-user-group.dto"), { "CreateLinkUserGroupDto": { rights: { required: false, enum: t["./enum/rights"].User_UserGroupRights }, userId: { required: true, type: () => Number }, user_groupId: { required: true, type: () => Number } } }], [import("./LinkModules/link-user-group/dto/update-link-user-group.dto"), { "UpdateLinkUserGroupDto": { groupId: { required: true, type: () => Number }, userId: { required: true, type: () => Number }, rights: { required: true, enum: t["./enum/rights"].User_UserGroupRights } } }], [import("./LinkModules/link-media-group/dto/create-link-media-group.dto"), { "CreateLinkMediaGroupDto": { rights: { required: true, enum: t["./enum/rights"].MediaGroupRights }, media: { required: true, type: () => t["./BaseEntities/media/entities/media.entity"].Media }, user_group: { required: true, type: () => t["./BaseEntities/user-group/entities/user-group.entity"].UserGroup } } }], [import("./BaseEntities/manifest/dto/create-manifest.dto"), { "CreateManifestDto": { path: { required: true, type: () => String }, idCreator: { required: true, type: () => Number }, title: { required: true, type: () => String }, url: { required: false, type: () => String }, hash: { required: false, type: () => String }, rights: { required: false, enum: t["./enum/rights"].ManifestGroupRights }, origin: { required: true, enum: t["./enum/origins"].manifestOrigin }, description: { required: true, type: () => String }, metadata: { required: true, type: () => Object } } }], [import("./BaseEntities/manifest/dto/update-manifest.dto"), { "UpdateManifestDto": { id: { required: true, type: () => Number } } }], [import("./LinkModules/link-manifest-group/dto/create-group-manifest.dto"), { "CreateGroupManifestDto": { path: { required: true, type: () => String }, idCreator: { required: true, type: () => Number }, title: { required: true, type: () => String }, thumbnailUrl: { required: true, type: () => String }, rights: { required: true, enum: t["./enum/rights"].ManifestGroupRights }, manifest: { required: false, type: () => t["./BaseEntities/manifest/entities/manifest.entity"].Manifest }, description: { required: true, type: () => String }, user_group: { required: true, type: () => t["./BaseEntities/user-group/entities/user-group.entity"].UserGroup } } }], [import("./LinkModules/link-manifest-group/dto/add-manifest-to-group.dto"), { "AddManifestToGroupDto": { userGroupId: { required: true, type: () => Number }, manifestId: { required: true, type: () => Number }, rights: { required: false, enum: t["./enum/rights"].ManifestGroupRights } } }], [import("./BaseEntities/users/dto/update-user.dto"), { "UpdateUserDto": {} }], [import("./LinkModules/link-manifest-group/dto/update-group-manifest.dto"), { "UpdateGroupManifestDto": {} }], [import("./LinkModules/link-media-group/dto/create-group-media.dto"), { "CreateGroupMediaDto": {} }], [import("./LinkModules/link-media-group/dto/update-group-media.dto"), { "UpdateGroupMediaDto": { id: { required: true, type: () => Number } } }], [import("./LinkModules/link-media-group/dto/update-link-media-group.dto"), { "UpdateLinkMediaGroupDto": { rights: { required: true, enum: t["./enum/rights"].MediaGroupRights }, media: { required: true, type: () => t["./BaseEntities/media/entities/media.entity"].Media }, user_group: { required: true, type: () => t["./BaseEntities/user-group/entities/user-group.entity"].UserGroup } } }]], "controllers": [[import("./app.controller"), { "AppController": { "getHello": { type: String } } }], [import("./BaseEntities/user-group/user-group.controller"), { "UserGroupController": { "updateGroup": { type: [t["./BaseEntities/user-group/entities/user-group.entity"].UserGroup] }, "remove": {} } }], [import("./auth/auth.controller"), { "AuthController": { "signIn": {}, "getprofile": {} } }], [import("./BaseEntities/media/media.controller"), { "MediaController": { "lookingForMedia": { type: [t["./BaseEntities/media/entities/media.entity"].Media] } } }], [import("./LinkModules/link-group-project/link-group-project.controller"), { "LinkGroupProjectController": { "getAllGroupProjects": { type: [t["./LinkModules/link-group-project/entities/link-group-project.entity"].LinkGroupProject] }, "getProjectRelation": { type: [t["./LinkModules/link-group-project/entities/link-group-project.entity"].LinkGroupProject] }, "update": { type: Object }, "addProjectToGroup": { type: Object }, "updateAccessToProject": { type: Object }, "deleteProject": { type: Object }, "deleteGroupProjectLink": { type: Object }, "lookingForProject": { type: [Object] }, "createProject": { type: t["./LinkModules/link-group-project/entities/link-group-project.entity"].LinkGroupProject }, "getAllUsersProjects": { type: Object } } }], [import("./LinkModules/link-user-group/link-user-group.controller"), { "LinkUserGroupController": { "getAllUsersForGroup": { type: Object }, "getAllGroupForUser": { type: [Object] }, "getAccessToGroup": { type: t["./LinkModules/link-user-group/entities/link-user-group.entity"].LinkUserGroup }, "createUser": { type: t["./BaseEntities/users/entities/user.entity"].User }, "createGroup": { type: t["./BaseEntities/user-group/entities/user-group.entity"].UserGroup }, "grantAccess": { type: Object }, "lookingForUser": { type: [t["./LinkModules/link-user-group/entities/link-user-group.entity"].LinkUserGroup] }, "lookingForUserGroups": { type: [t["./LinkModules/link-user-group/entities/link-user-group.entity"].LinkUserGroup] }, "changeAccess": { type: Object }, "removeAccess": { type: Object }, "remove": { type: Object } } }], [import("./utils/email/email.controller"), { "EmailServerController": { "testEMail": {} } }], [import("./LinkModules/link-media-group/link-media-group.controller"), { "LinkMediaGroupController": { "uploadSingleFile": { type: t["./LinkModules/link-media-group/entities/link-media-group.entity"].LinkMediaGroup }, "linkMedia": { type: t["./LinkModules/link-media-group/entities/link-media-group.entity"].LinkMediaGroup }, "getMediaByUserGroupId": {}, "getMediaById": { type: [t["./LinkModules/link-media-group/entities/link-media-group.entity"].LinkMediaGroup] }, "deleteMedia": { type: Object }, "updateMedia": { type: Object }, "updateMediaGroupRelation": { type: Object }, "addMediaToGroup": { type: [Object] }, "deleteMediaById": { type: Object } } }], [import("./BaseEntities/manifest/manifest.controller"), { "ManifestController": { "lookingForManifest": { type: [t["./BaseEntities/manifest/entities/manifest.entity"].Manifest] } } }], [import("./LinkModules/link-manifest-group/link-manifest-group.controller"), { "LinkManifestGroupController": { "getManifestByUserGroupId": {}, "uploadManifest": {}, "linkManifest": {}, "createManifest": {}, "getManifestById": { type: [t["./LinkModules/link-manifest-group/entities/link-manifest-group.entity"].LinkManifestGroup] }, "deleteManifest": { type: Object }, "updateManifest": { type: Object }, "updateManifestGroupRelation": { type: Object }, "addManifestToGroup": { type: [Object] }, "deleteManifestById": { type: Object } } }]] } };
};