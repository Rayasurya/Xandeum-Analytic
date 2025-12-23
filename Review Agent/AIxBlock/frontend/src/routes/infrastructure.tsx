import {Route} from "react-router-dom";
import Infrastructure from "../pages/Infrastructure/Infrastructure";
import Platform from "../pages/Infrastructure/Platform/Platform";
import CloudStorage from "../pages/Infrastructure/Storage/CloudStorage";
import SelfHostStorage from "../pages/Infrastructure/Storage/SelfHostStorage";
import SelfHostGpu from "../pages/Infrastructure/Gpu/SelfHostGpu";
import MarketGpu from "../pages/Infrastructure/Gpu/MarketGpu";
import SetupPlatform from "../pages/Infrastructure/SetupPlatform/SetupPlatform";
import SetupCloudStorage from "../pages/Infrastructure/SetupStorage/SetupCloudStorage";
import SetupSelfHostStorage from "../pages/Infrastructure/SetupStorage/SetupSelfHostStorage";
import SetupSelfHostGpu from "../pages/Infrastructure/SetupGpu/SetupSelfHostGpu";
import ListingComputes from "../pages/Infrastructure/ComputeListings/ListingComputes";
import ListMyCompute from "../pages/Infrastructure/ComputeListings/ListMyCompute";
import Earnings from "../pages/Infrastructure/ComputeListings/Earnings";

const infrastructureRoutes = (
  <Route path="/infrastructure" element={<Infrastructure />} handle={{title: "My Infrastructure"}}>
    <Route path="platform" element={<Platform />} handle={{title: "Server to host platform"}} />
    <Route path="storage/cloud" element={<CloudStorage />} handle={{title: "Cloud Storage"}} />
    <Route path="storage/self-host" element={<SelfHostStorage />} handle={{title: "Self-host Storage"}} />
    <Route path="gpu/self-host" element={<SelfHostGpu />} handle={{title: "Self-host GPU"}} />
    <Route path="gpu/from-marketplace" element={<MarketGpu />} handle={{title: "GPU from marketplace"}} />
    <Route path="setup-platform" element={<SetupPlatform />} handle={{title: "Setup platform"}} />
    <Route path="setup-storage/cloud" element={<SetupCloudStorage />} handle={{title: "Setup cloud storage"}} />
    <Route path="setup-storage/self-host" element={<SetupSelfHostStorage />} handle={{title: "Setup self-host storage"}} />
    <Route path="setup-gpu/self-host" element={<SetupSelfHostGpu />} handle={{title: "Setup self-host GPU"}} />
    <Route path="compute-listings" element={<ListingComputes />} handle={{title: "Compute Listings"}} />
    <Route path="compute-listings/earnings" element={<Earnings />} handle={{title: "Earnings"}} />
    <Route path="list-compute" element={<ListMyCompute />} handle={{title: "List my compute"}} />
    <Route path="list-compute/:id" element={<ListMyCompute />} handle={{title: "List my compute"}} />
  </Route>
)

export default infrastructureRoutes;
