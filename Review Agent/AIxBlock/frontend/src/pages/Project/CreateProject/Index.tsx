import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserLayout } from "@/layouts/UserLayout";
import General from "../Settings/General/General";
import LayoutSettings from "../Settings/LayoutSettings/Index";

const CreateProject = () => {
  const navigate = useNavigate();
  const userLayout = useUserLayout();

  useEffect(() => {
    userLayout.setCloseCallback("/projects");
    return () => {
      userLayout.clearCloseCallback();
    };
  }, [userLayout, navigate]);

  return (
    <LayoutSettings.Container>
      <LayoutSettings.Header />
      <General />
    </LayoutSettings.Container>
  );
};

export default CreateProject;
