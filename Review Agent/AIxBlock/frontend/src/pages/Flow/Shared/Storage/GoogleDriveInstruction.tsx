import styles from "./GoogleDriveInstruction.module.scss";

export default function GoogleDriveInstruction() {
  return (
    <div className={styles.container}>
      <div className={styles.h1}>
        A. Create a Google service account:
      </div>
      <ol>
        <li>Visit <a href="https://console.cloud.google.com/">https://console.cloud.google.com/</a> and log in with your Google account.</li>
        <li>Create a new project if you don't have one, click on <strong>"Create Project"</strong> in the top left corner and give your project a name.</li>
        <li>Click on <strong>"IAM & Admin"</strong> in the left navigation panel.</li>
        <li>Under <strong>"Identity"</strong>, choose <strong>"Service accounts"</strong>.</li>
        <li>Click on <strong>"Create Service account"</strong>.</li>
        <li>Enter a descriptive name for your service account.</li>
        <li>Assign the <strong>"Storage Admin"</strong> role.</li>
        <li>Click on <strong>"Create"</strong>.</li>
        <li>After creating the service account, you'll need to generate a service account key. This key will be used to authenticate your service account with Google APIs.</li>
        <li>Choose a key type: <strong>JSON</strong>.</li>
        <li>Click on <strong>"Create"</strong> and download the JSON file to your computer.</li>
        <li>Copy the content of the JSON file and paste into <strong>Google Application Credentials</strong> field.</li>
      </ol>
      <div className={styles.important}>
        Important: Keep your service account key file secure. It should not be shared publicly.
      </div>
      <div className={styles.h1}>
        B. Grant access to a Google Drive folder for your service account:
      </div>
      <ol>
        <li>Open Google Drive in your web browser.</li>
        <li>Right-click on the folder you want to grant access to.</li>
        <li>Choose <strong>"Share"</strong> from the context menu.</li>
        <li>In the <strong>"People"</strong> field, enter the email address of your service account.</li>
        <li>Grant the service account <strong>"Can edit"</strong> access to the folder.</li>
        <li>Click on <strong>"Send"</strong> to grant access to the service account.</li>
      </ol>
    </div>
  );
}
