import Upload from "@/components/Upload/Upload";
import "./UploadGuideline.scss";

const UploadGuideline = () => {
  return (
    <div className="c-upload-guide">
      <Upload describe={"PDF, Doc,... Max size of 10mb"} />
    </div>
  );
};

export default UploadGuideline;
