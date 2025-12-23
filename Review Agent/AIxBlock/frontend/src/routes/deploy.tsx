import {Route} from "react-router-dom";
import TrainDeploy from "../pages/Flow/Deploy/Index";
import Project from "../pages/Flow/Deploy/Project";
import FlowProvider from "../pages/Flow/FlowProvider";
// import Storage from "../pages/Flow/Deploy/Storage";
import GPU from "../pages/Flow/Deploy/GPU";
import SetupModel from "../pages/Flow/Deploy/SetupModel";
import Settings from "../pages/Flow/Deploy/Settings";
import React from "react";
import DemoDeploy from "../pages/Flow/Deploy/DemoDeploy";
import {RequireCompute, RequireModel/*, RequireStorage*/} from "../pages/Flow/Deploy/hooks";
import {ModelDetail, ModelMarketplace} from "../pages/Flow/Deploy/ModelMarketplace";

const deployRoutes = (
  <Route element={<FlowProvider />}>
    <Route path="/deploy" handle={{ title: 'Deploy' }}>
      <Route path="" element={<TrainDeploy />} />
      <Route path="create" element={<Project />} />
    </Route>,
    <Route path="/deploy/:id" handle={{ title: 'Deploy' }}>
      <Route path="" element={<TrainDeploy />} />
      <Route path="project" element={<Project />} />
      {/*<Route path="setup-infrastructure/storage" element={<Storage />} />*/}
      {/*<Route element={<RequireStorage />}>*/}
        <Route path="setup-infrastructure/gpu" element={<GPU />} />
        <Route element={<RequireCompute />}>
          <Route path="setup-model" element={<SetupModel />} />
          <Route path="setup-model/marketplace" element={<ModelMarketplace />} />
          <Route path="setup-model/marketplace/:modelId" element={<ModelDetail />} />
          <Route element={<RequireModel />}>
            <Route path="settings" element={<Settings />} />
            <Route path="demo-and-deploy" element={<DemoDeploy />} />
          </Route>
        </Route>
      {/*</Route>*/}
    </Route>
  </Route>
);

export default deployRoutes;
