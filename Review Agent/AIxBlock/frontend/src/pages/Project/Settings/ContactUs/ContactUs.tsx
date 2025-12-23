import { useNavigate } from "react-router-dom";
import Button from "@/components/Button/Button";
import InputBase from "@/components/InputBase/InputBase";
import { TProjectModel } from "@/models/project";
import LayoutSettings from "../LayoutSettings/Index";
import "./Index.scss";

type TContactUsProps = {
  data?: TProjectModel | null;
};

const ContactUs = (props: TContactUsProps) => {
  const navigate = useNavigate();
  return (
    <div className="m-335">
      <div className="p-contact-us m-308">
        <form className="p-contact">
          <h2 className="p-contact__heading">Contact Us</h2>
          <InputBase label="Your name" placeholder="Type your name project" />
          <InputBase
            label="Project name"
            placeholder="Type your name project"
          />
          <InputBase label="Your company" placeholder="Share a reply" />
          <InputBase label="Your requirements" placeholder="Share a reply" />
          <div className="p-contact__action">
            <Button
              type="primary"
              size="medium"
              className="p-contact__action--send"
            >
              Send
            </Button>
          </div>
        </form>
      </div>
      <LayoutSettings.Footer
        prevUrl={"/projects/" + props.data?.id + `/import/internet`}
        nextUrl={`/projects/${props?.data?.id}/data`}
        onSkip={() => navigate("/projects/" + props.data?.id + `/data`)}
      />
    </div>
  );
};

export default ContactUs;
