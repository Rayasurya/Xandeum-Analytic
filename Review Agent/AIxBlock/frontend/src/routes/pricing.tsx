import {Navigate, Route} from "react-router-dom";
import PricingV2 from "../pages/PricingV2/PricingV2";
import Platform from "../pages/PricingV2/Platform";
import Compute from "../pages/PricingV2/Compute";
import Model from "../pages/PricingV2/Model";
import Crowdsourcing from "../pages/PricingV2/Crowdsourcing";

const pricingRoutes = (
  <Route path="/pricing" element={<PricingV2 />}>
    <Route path="platform" element={<Platform />} />
    <Route path="compute" element={<Compute />} />
    <Route path="model" element={<Model />} />
    <Route path="crowdsourcing" element={<Crowdsourcing />} />
    <Route path="*" element={<Navigate to="/pricing/platform" replace={true} />} />
    <Route path="" element={<Navigate to="/pricing/platform" replace={true} />} />
  </Route>
)

export default pricingRoutes;
