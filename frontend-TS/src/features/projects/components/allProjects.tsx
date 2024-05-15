import { Grid, Snackbar, Typography } from "@mui/material";
import React, { FC, useEffect, useState } from "react";
import { Project } from "../types/types.ts";
import MiradorViewer from "../../mirador/Mirador.tsx";
import IWorkspace from "../../mirador/interface/IWorkspace.ts";
import { User } from "../../auth/types/types.ts";
import { ProjectCard } from "./projectCard.tsx";
import { deleteProject } from "../api/deleteProject.ts";
import { getUserAllProjects } from "../api/getUserAllProjects.ts";
import { updateProject } from "../api/updateProject";
import { createProject } from "../api/createProject";

interface AllProjectsProps {
  user: User;
}

export const AllProjects: FC<AllProjectsProps> = ({ user }) => {
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [isMiradorViewerVisible, setIsMiradorViewerVisible] = useState(false);
  const [miradorWorkspace, setMiradorWorkspace] = useState<IWorkspace>();
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(undefined);
  const emptyWorkspace: IWorkspace = {
    catalog: [],
    companionWindows: {},
    config: {},
    elasticLayout: {},
    layers: {},
    manifests: {},
    viewers: {},
    windows: {},
    workspace: {}
  };
  const emptyProject: Project = {
    id: 0,
    name: "",
    owner: 0,
    userWorkspace: emptyWorkspace
  };
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projects = await getUserAllProjects(user.id);
        setUserProjects(projects);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      }
    };
    fetchProjects();
  }, [user]);

  const deleteUserProject = (projectId: number) => {
    deleteProject(projectId);
    const updatedListOfProject = userProjects.filter(function(project) {
      return project.id != projectId;
    });
    setUserProjects(updatedListOfProject);
  };

  const initializeMirador = (workspace: IWorkspace, projectId: number) => {
    setIsMiradorViewerVisible(!isMiradorViewerVisible);
    setMiradorWorkspace(workspace);
    setSelectedProjectId(projectId);
  };

  const saveState = (state: IWorkspace, name: string) => {


    // TODO Fucking spaghetti
    if (selectedProjectId) {
      // Use coalesce operator to avoid typescript error "value possibly undefined"
      // That's non sense to use coalesce operator here, because selectedProjectId is always defined
      const updatedProject = userProjects.find(project => project.id == selectedProjectId) ?? emptyProject;
      updatedProject.userWorkspace = state;
      updatedProject.name = name;
      updateProject(updatedProject).then(r => {
        console.log(r);
      });
    } else {
      const project = {
        name: name,
        owner: user.id,
        userWorkspace: state
      };
      createProject(project).then(r => {
        setSelectedProjectId(r.id);
        setUserProjects([...userProjects, r]);
      });
    }
  };

  return (
    <>
      <Grid container spacing={2} justifyContent="center" flexDirection="column">
        {
          !isMiradorViewerVisible && (
            <Grid item container justifyContent="center">
              <Typography variant="h5" component="h1">{user.name}'s Projects</Typography>
            </Grid>
          )
        }
        <Grid item container spacing={4}>

          {!isMiradorViewerVisible && userProjects ? (
            <>
              {userProjects.map((project) => (
                  <React.Fragment key={project.id}>
                    <ProjectCard
                      projectName={project.name}
                      projectWorkspace={project.userWorkspace}
                      initializeMirador={initializeMirador}
                      NumberOfManifests={project.userWorkspace.catalog.length}
                      deleteProject={deleteUserProject}
                      projectId={project.id}
                    />
                  </React.Fragment>
                )
              )}
              <ProjectCard
                projectName={"Create new Project"}
                projectWorkspace={emptyWorkspace}
                initializeMirador={initializeMirador}
                projectId={0}
              />
            </>
          ) : (
            <Grid item xs={12}>
              <MiradorViewer
                workspace={miradorWorkspace!}
                toggleMirador={() => setIsMiradorViewerVisible(!isMiradorViewerVisible)}
                saveState={saveState}
                projectName={userProjects.find(project => project.id == selectedProjectId)?.name ?? "Newww project"}
              />
            </Grid>
          )}
        </Grid>
      </Grid>
    </>
  );
};
