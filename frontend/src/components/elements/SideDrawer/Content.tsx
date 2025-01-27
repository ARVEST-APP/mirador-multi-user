import { Box } from "@mui/material";
import { AdminPanel } from "../../../features/admin/components/adminPanel";
import { AllProjects } from "../../../features/projects/components/AllProjects";
import { AllMedias } from "../../../features/media/component/AllMedias";
import { AllGroups } from "../../../features/user-group/components/AllGroups";
import { AllManifests } from "../../../features/manifest/component/AllManifests";
import { UserSettings } from "../../../features/user-setting/UserSettings";
import { MMUModal } from "../modal";
import { ConfirmDisconnect } from "../../../features/auth/components/confirmDisconect";
import { MENU_ELEMENT } from "../SideDrawer";
import { ProjectWorkspace } from "./ProjectWorkspace";
import { User } from "../../../features/auth/types/types.ts";

interface ContentProps {
  HandleSetIsRunning: (isRunning: boolean) => void;
  HandleSetUserProjects: (projects: any) => void;
  fetchGroups: () => void;
  fetchManifestForUser: () => void;
  fetchMediaForUser: () => void;
  groups: any;
  handleDisconnectUser: () => void;
  handleSetMiradorState: (state: any) => void;
  manifests: any;
  medias: any;
  miradorState: any;
  miradorViewerRef: any;
  projectSelected: any;
  saveMiradorState: (state: any) => void;
  selectedContent: string;
  selectedProjectId: number | undefined;
  setGroups: (groups: any) => void;
  setMedias: (medias: any) => void;
  setSelectedProjectId: (id: number | undefined) => void;
  setShowSignOutModal: (show: boolean) => void;
  setViewer: (viewer: any) => void;
  showSignOutModal: boolean;
  user: User;
  userPersonalGroup: any;
  userProjects: any;
  viewer: any;
}

export function Content({
  HandleSetIsRunning,
  HandleSetUserProjects,
  fetchGroups,
  fetchManifestForUser,
  fetchMediaForUser,
  groups,
  handleDisconnectUser,
  handleSetMiradorState,
  manifests,
  medias,
  miradorState,
  miradorViewerRef,
  projectSelected,
  saveMiradorState,
  selectedContent,
  selectedProjectId,
  setGroups,
  setMedias,
  setSelectedProjectId,
  setShowSignOutModal,
  setViewer,
  showSignOutModal,
  user,
  userPersonalGroup,
  userProjects,
  viewer,
}: ContentProps) {
  return (
    <Box
      component="main"
      sx={{ flexGrow: 1, padding: 0, margin: 0, maxHeight: "100vh" }}
    >
      {selectedProjectId && projectSelected && (
        <ProjectWorkspace
          HandleSetIsRunning={HandleSetIsRunning}
          fetchManifestForUser={fetchManifestForUser}
          handleSetMiradorState={handleSetMiradorState}
          manifests={manifests}
          miradorState={miradorState!}
          myRef={miradorViewerRef}
          projectSelected={projectSelected}
          saveMiradorState={saveMiradorState}
          setViewer={setViewer}
          user={user}
          userPersonalGroup={userPersonalGroup}
          viewer={viewer}
        />
      )}
      {user &&
        user.id &&
        user._isAdmin &&
        selectedContent === MENU_ELEMENT.ADMIN && <AdminPanel />}
      {user &&
        user.id &&
        selectedContent === MENU_ELEMENT.PROJECTS &&
        !selectedProjectId && (
          <AllProjects
            handleSetMiradorState={handleSetMiradorState}
            medias={medias}
            selectedProjectId={selectedProjectId}
            setMedias={setMedias}
            setSelectedProjectId={setSelectedProjectId}
            setUserProjects={HandleSetUserProjects}
            user={user}
            userProjects={userProjects}
          />
        )}
      {user &&
        user.id &&
        !selectedProjectId &&
        selectedContent === MENU_ELEMENT.MEDIA && (
          <AllMedias
            fetchMediaForUser={fetchMediaForUser}
            medias={medias}
            setMedias={setMedias}
            user={user}
            userPersonalGroup={userPersonalGroup}
          />
        )}
      {user && user.id && selectedContent === MENU_ELEMENT.GROUPS && (
        <AllGroups
          fetchGroups={fetchGroups}
          groups={groups}
          medias={medias}
          setGroups={setGroups}
          setMedias={setMedias}
          user={user}
          userPersonalGroup={userPersonalGroup}
        />
      )}
      {user && user.id && selectedContent === MENU_ELEMENT.MANIFEST && (
        <AllManifests
          fetchManifestForUser={fetchManifestForUser}
          fetchMediaForUser={fetchMediaForUser}
          manifests={manifests}
          medias={medias}
          user={user}
          userPersonalGroup={userPersonalGroup}
        />
      )}
      {user && user.id && selectedContent === MENU_ELEMENT.SETTING && (
        <UserSettings user={user} />
      )}
      {showSignOutModal && (
        <MMUModal
          openModal={showSignOutModal}
          setOpenModal={setShowSignOutModal}
          width={400}
          children={
            <ConfirmDisconnect handleDisconnect={handleDisconnectUser} />
          }
        />
      )}
    </Box>
  );
}
