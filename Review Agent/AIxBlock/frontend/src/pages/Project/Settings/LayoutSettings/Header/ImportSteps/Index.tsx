import React, { Fragment } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getPath } from "../../utils";
import { IconBoldGlobal, IconBoldSms, IconCloud, IconCricle, IconCricleCheckedWhite, IconDataSet, IconDocumentUpload } from "@/assets/icons/Index";
import { TImportDataType } from "../Index";
import { DATATYPE } from "../../../Index";

const MemoizedSteps = (props: TImportDataType) => {
  const { importDataType, setImportDataType } = props;
  const location = useLocation();
  const path = getPath(location.pathname, 1);
  const projectId = getPath(location.pathname, 3);
  const navigate = useNavigate();
  const onSelectStep = (value: string | null) => {
    projectId && navigate(`/projects/${projectId}/import/${value}`);
  };

  const maxStep = path === "create-project" ? 0 : null;
  const activeStep = path === "create-project" ? "general" : path;

  const IMPORT_STEPS = [
    {
      index: 0,
      title: "Local upload",
      value: "local",
      icon: <IconCloud />,
    },
    {
      index: 1,
      title: "From/To cloud",
      value: "cloud",
      icon: <IconDocumentUpload />,
    },
    {
      index: 2,
      title: importDataType === "RAWDATA" ? "Crawl from internet, IoT devices" : "Dataset Hubs",
      value: importDataType === "RAWDATA" ? "internet" : "dataset_hubs",
      icon: importDataType === "RAWDATA" ? <IconBoldGlobal /> : <IconDataSet />,
    },
    {
      index: 3,
      title: importDataType === "RAWDATA" ? "Contact us to collect custom data" : null,
      value: importDataType === "RAWDATA" ? "contact_us" : null,
      icon: importDataType === "RAWDATA" ? <IconBoldSms /> : null,
    },
  ];

  return (
    <div className="c-step-wrapper">
      <div className="c-step data-type">
        <div className={`c-step-item ${importDataType === "RAWDATA" ? "active" : ""}`} onClick={() => {
          setImportDataType?.(DATATYPE.RAWDATA);
          onSelectStep("local");
        }}>
          <div className="c-step-item__number">
            {importDataType === "RAWDATA" ? <IconCricleCheckedWhite /> : <IconCricle />}
          </div>
          <span className="c-step-item__title">Raw data</span>
        </div>
        <div className={`c-step-item ${importDataType === "DATASET" ? "active" : ""}`} onClick={() => {
          setImportDataType?.(DATATYPE.DATASET);
          onSelectStep("local");
        }}>
          <div className="c-step-item__number">
            {importDataType === "DATASET" ? <IconCricleCheckedWhite /> : <IconCricle />}
          </div>
          <span className="c-step-item__title">Labeled data</span>
        </div>
      </div>
      <div className="c-step import">
        {IMPORT_STEPS?.map((step, index) => (
          <Fragment key={`step-key-${step.title}`}>
            {step.value !== null &&
              <div
                className={`c-step-item ${activeStep === step.value ? "active" : ""
                  } ${maxStep === 0 && index === 0
                    ? "allow"
                    : maxStep === null
                      ? "allow"
                      : "not-allowed"
                  }`}
                key={`key-${step.title}`}
                onClick={() => onSelectStep(step.value)}
              >
                <div className="c-step-item__number">
                  {(maxStep === 0 && index === 0) || maxStep === null ? (
                    <>{step.icon}</>
                  ) : (
                    <span className="ellipse" />
                  )}
                </div>
                <span className="c-step-item__title">{step.title}</span>
              </div>
            }
          </Fragment>
        ))}
      </div>
    </div>
  );
};

const ImportStep = React.memo(MemoizedSteps);

export default ImportStep;
