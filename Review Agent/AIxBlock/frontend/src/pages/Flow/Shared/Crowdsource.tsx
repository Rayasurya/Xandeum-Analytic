import Button from "@/components/Button/Button";
import InputBase from "@/components/InputBase/InputBase";
import styles from "./Crowdsource.module.scss";

const Crowdsource = () => {
  // Todo: Wait api to implement send email contact

  return <div className={styles.crowdsource}>
    <form className={styles.form}>
      <h2 className="p-contact__heading">Contact Us For Crowdsource Data</h2>
      <InputBase label="Type your name" placeholder="Type your name project" />
      <InputBase
        label="Project name"
        placeholder="Type your name project"
      />
      <InputBase label="Type your company’s name" placeholder="Share a reply" />
      <InputBase label="Your requirements" placeholder="Share a reply" />
      <div className={styles.action}>
        <Button
          type="primary"
          size="medium"
          className={styles.send}
        >
          Send to Contact Us
        </Button>
      </div>
    </form>
  </div>
}

export default Crowdsource;
