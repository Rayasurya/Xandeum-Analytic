import React from "react";
import useDebouncedEffect from "../hooks/useDebouncedEffect";
import { useNavigate } from "react-router-dom";
import EmptyContent from "../components/EmptyContent/EmptyContent";
import { useUserLayout } from "../layouts/UserLayout";

export default function FirstTime() {
  const isFirstLogin = (localStorage.getItem("isSignUpSuccess") ?? "") === "true";
  const navigate = useNavigate();
  const layout = useUserLayout();

  useDebouncedEffect(() => {
    if (!isFirstLogin) {
      navigate("/dashboard");
      return;
    }

    layout.loaderFullWidth();

    const timeout = setTimeout(() => {
      localStorage.removeItem("isSignUpSuccess");
      navigate("/dashboard", {state: {showWelcome: true}});
    }, 2000);

    return () => {
      clearTimeout(timeout);
    }
  }, [ isFirstLogin ]);

  if (!isFirstLogin) {
    return null;
  }

  return <EmptyContent message="Signup Successful."/>;
}
