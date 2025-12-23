import React from "react";
import {Outlet, useNavigate} from "react-router-dom";
import {useAuth} from "../providers/AuthProvider";
import "./GuestLayout.scss"

export default function GuestLayout() {
  const {user} = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate("/dashboard/")
      // if (user.is_compute_supplier) {
      //   navigate("/computes-supplier");
      // } else if (user.is_model_seller) {
      //   navigate("/models-seller");
      // } else {
      //   navigate("/projects");
      // }
    }
  }, [navigate, user]);

  if (user) {
    return null;
  }

  return (
    <div className="layout-guest">
      <Outlet/>
    </div>
  );
}
