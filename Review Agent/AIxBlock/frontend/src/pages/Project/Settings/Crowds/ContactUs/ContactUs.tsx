import InputBase from "@/components/InputBase/InputBase";
import "./ContactUs.scss";

const ContactUs = () => {
  return (
    <form className="c-contact-us">
      <InputBase label="Your name" placeholder="Type something" />
      <InputBase label="Email" placeholder="Type something" />
      <InputBase label="Your company" placeholder="Type something" />
      <InputBase
        isMultipleLine
        label="Your requirements"
        placeholder="Share a reply"
      />
    </form>
  );
};

export default ContactUs;
