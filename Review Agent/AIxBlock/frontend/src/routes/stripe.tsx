import {Route} from "react-router-dom";
import StripeConfirm from "../pages/Stripe/Confirm";

const stripeRoutes = (
  <Route path={"/stripe"}>
    <Route path="confirm/:cs" element={<StripeConfirm />} />
  </Route>
)

export default stripeRoutes;
