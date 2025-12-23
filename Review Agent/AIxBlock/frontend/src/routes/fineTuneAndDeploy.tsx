import {Route} from "react-router-dom";
import TrainDeploy from "../pages/Flow/FineTuneDeploy/Index";
import Project from "../pages/Flow/FineTuneDeploy/Project";
import FlowProvider from "../pages/Flow/FlowProvider";
import Storage from "../pages/Flow/FineTuneDeploy/Storage";
import GPU from "../pages/Flow/FineTuneDeploy/GPU";
import LocalUpload from "../pages/Flow/FineTuneDeploy/LocalUpload";
import CloudSync from "../pages/Flow/FineTuneDeploy/CloudSync";
import Crawler from "../pages/Flow/FineTuneDeploy/Crawler";
import DataHubs from "../pages/Flow/FineTuneDeploy/DataHubs";
import SetupModel from "../pages/Flow/FineTuneDeploy/SetupModel";
import Settings from "../pages/Flow/FineTuneDeploy/Settings";
import Data from "../pages/Flow/FineTuneDeploy/Data";
import React from "react";
import TrainingDashboard from "../pages/Flow/FineTuneDeploy/TrainingDashboard";
import DemoDeploy from "../pages/Flow/FineTuneDeploy/DemoDeploy";
// import DataPipeline from "../pages/Flow/FineTuneDeploy/DataPipeline";
import Crowdsource from "../pages/Flow/FineTuneDeploy/Crowdsource";
import {RequireCompute, RequireDataPipeline, RequireModel, RequireStorage} from "../pages/Flow/FineTuneDeploy/hooks";
import {ModelMarketplace, ModelDetail} from "../pages/Flow/FineTuneDeploy/ModelMarketplace";

const fineTuneAndDeployRoutes = (
  <Route element={<FlowProvider />}>
    <Route key="fine-tune-and-deploy" path="/fine-tune-and-deploy" handle={{ title: 'Fine-tune and Deploy' }}>
      <Route path="" element={<TrainDeploy />} />
      <Route path="create" element={<Project />} />
    </Route>,
    <Route key="fine-tune-and-deploy-with-project" path="/fine-tune-and-deploy/:id" handle={{ title: 'Fine-tune and Deploy' }}>
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
          <Route path="setup-model/marketplace" element={<ModelMarketplace />} />
          <Route path="setup-model/marketplace/:modelId" element={<ModelDetail />} />
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

export default fineTuneAndDeployRoutes;
