import {Route} from "react-router-dom";
import TrainDeploy from "../pages/Flow/TrainDeploy/Index";
import Project from "../pages/Flow/TrainDeploy/Project";
import FlowProvider from "../pages/Flow/FlowProvider";
import Storage from "../pages/Flow/TrainDeploy/Storage";
import GPU from "../pages/Flow/TrainDeploy/GPU";
import LocalUpload from "../pages/Flow/TrainDeploy/LocalUpload";
import CloudSync from "../pages/Flow/TrainDeploy/CloudSync";
import Crawler from "../pages/Flow/TrainDeploy/Crawler";
import DataHubs from "../pages/Flow/TrainDeploy/DataHubs";
import SetupModel from "../pages/Flow/TrainDeploy/SetupModel";
import Settings from "../pages/Flow/TrainDeploy/Settings";
import Data from "../pages/Flow/TrainDeploy/Data";
import React from "react";
import TrainingDashboard from "../pages/Flow/TrainDeploy/TrainingDashboard";
import DemoDeploy from "../pages/Flow/TrainDeploy/DemoDeploy";
// import DataPipeline from "../pages/Flow/TrainDeploy/DataPipeline";
import Crowdsource from "../pages/Flow/TrainDeploy/Crowdsource";
import {RequireCompute, RequireDataPipeline, RequireModel, RequireStorage} from "../pages/Flow/TrainDeploy/hooks";

const trainAndDeployRoutes = (
  <Route element={<FlowProvider />}>
    <Route key="train-and-deploy" path="/train-and-deploy" handle={{ title: 'Train and Deploy' }}>
      <Route path="" element={<TrainDeploy />} />
      <Route path="create" element={<Project />} />
    </Route>,
    <Route key="train-and-deploy-with-project" path="/train-and-deploy/:id" handle={{ title: 'Train and Deploy' }}>
      <Route path="" element={<TrainDeploy />} />
      <Route path="project" element={<Project />} />
      <Route path="setup-infrastructure/storage" element={<Storage />} />
      <Route element={<RequireStorage />}>
        <Route path="setup-infrastructure/gpu" element={<GPU />} />
        <Route element={<RequireCompute />}>
          <Route path="data-preparation">
            <Route path="local-upload" element={<LocalUpload />} />
            <Route path="cloud-storage" element={<CloudSync />} />
            <Route path="crawler" element={<Crawler />} />
            <Route path="data-hubs" element={<DataHubs />} />
            <Route path="crowdsource" element={<Crowdsource />} />
          </Route>
          <Route path="setup-model" element={<SetupModel />} />
          <Route element={<RequireModel />}>
            <Route path="settings" element={<Settings />} />
            <Route path="training-dashboard" element={<TrainingDashboard />} />
            <Route path="demo-and-deploy" element={<DemoDeploy />} />
            <Route element={<RequireDataPipeline />}>
              <Route path="data" element={<Data />} />
              {/*<Route path="data-pipeline" element={<DataPipeline />} />*/}
            </Route>
          </Route>
        </Route>
      </Route>
    </Route>
  </Route>
);

export default trainAndDeployRoutes;
