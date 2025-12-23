import {Route} from "react-router-dom";
import TrainDeploy from "../pages/Flow/LabelValidateData/Index";
import Project from "../pages/Flow/LabelValidateData/Project";
import FlowProvider from "../pages/Flow/FlowProvider";
import Storage from "../pages/Flow/LabelValidateData/Storage";
import GPU from "../pages/Flow/LabelValidateData/GPU";
import LocalUpload from "../pages/Flow/LabelValidateData/LocalUpload";
import CloudSync from "../pages/Flow/LabelValidateData/CloudSync";
import Crawler from "../pages/Flow/LabelValidateData/Crawler";
import DataHubs from "../pages/Flow/LabelValidateData/DataHubs";
import SetupModel from "../pages/Flow/LabelValidateData/SetupModel";
import Settings from "../pages/Flow/LabelValidateData/Settings";
import Data from "../pages/Flow/LabelValidateData/Data";
import React from "react";
// import DataPipeline from "../pages/Flow/LabelValidateData/DataPipeline";
import Crowdsource from "../pages/Flow/LabelValidateData/Crowdsource";
import {RequireCompute, RequireModel, RequireStorage} from "../pages/Flow/LabelValidateData/hooks";
import {ModelDetail, ModelMarketplace} from "../pages/Flow/LabelValidateData/ModelMarketplace";

const labelAndValidateDataRoutes = (
  <Route element={<FlowProvider />}>
    <Route key="label-and-validate-data" path="/label-and-validate-data" handle={{ title: 'Label and Validate Data' }}>
      <Route path="" element={<TrainDeploy />} />
      <Route path="create" element={<Project />} />
    </Route>,
    <Route key="label-and-validate-data-with-project" path="/label-and-validate-data/:id" handle={{ title: 'Label and Validate Data' }}>
      <Route path="" element={<TrainDeploy />} />
      <Route path="project" element={<Project />} />
      <Route path="setup-infrastructure/storage" element={<Storage />} />
      <Route element={<RequireStorage />}>
        <Route path="data-preparation">
          <Route path="local-upload" element={<LocalUpload />} />
          <Route path="cloud-storage" element={<CloudSync />} />
          <Route path="crawler" element={<Crawler />} />
          <Route path="data-hubs" element={<DataHubs />} />
          <Route path="crowdsource" element={<Crowdsource />} />
        </Route>
        <Route path="setup-compute" element={<GPU />} />
        <Route element={<RequireCompute />}>
          <Route path="setup-model" element={<SetupModel />} />
          <Route path="setup-model/marketplace" element={<ModelMarketplace />} />
          <Route path="setup-model/marketplace/:modelId" element={<ModelDetail />} />
          <Route element={<RequireModel />}>
            <Route path="settings" element={<Settings />} />
            {/*<Route path="data-pipeline" element={<DataPipeline />} />*/}
            <Route path="data" element={<Data />} />
          </Route>
        </Route>
      </Route>
    </Route>
  </Route>
);

export default labelAndValidateDataRoutes;
