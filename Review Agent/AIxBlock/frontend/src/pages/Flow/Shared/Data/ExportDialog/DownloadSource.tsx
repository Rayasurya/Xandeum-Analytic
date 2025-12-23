/* eslint-disable no-useless-escape */
import { useMemo } from "react";
import { CodeBlock, codepen } from "react-code-blocks";
import Select, { DataSelect, SelectOption } from "@/components/Select/Select";
import { FormatsData } from "@/hooks/project/export/useGetExportData";
import Button from "@/components/Button/Button";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

type TDownloadSourceProps = {
  token: string;
  pjId: string;
  currentFormat: SelectOption;
  availableFormats: FormatsData[];
  onSelectType: (val: SelectOption) => void;
};

const DownloadSource = (props: TDownloadSourceProps) => {
  const { token, pjId, currentFormat, availableFormats, onSelectType } = props;
  const [ copiedText, copy ] = useCopyToClipboard();

  const sourceCode = useMemo(() => {
    return `!pip install aixblock-sdk

import time
from aixblock_sdk import Client
AIXBLOCK_URL = '${window.location.protocol + "//" + window.location.host}'
API_KEY = '${token}'
PROJECT_ID = ${pjId}

# connect to AIxBlock
axb = Client(url=AIXBLOCK_URL, api_key=API_KEY)
axb.check_connection()

# get existing project
project = axb.get_project(PROJECT_ID)

# get the first tab
views = project.get_views()
task_filter_options = \{'view': views[0]['id']} if views else {}

# create new export snapshot
export_result = project.export_snapshot_create(
    title='Export SDK Snapshot',
    task_filter_options=task_filter_options
)
assert('id' in export_result)
export_id = export_result['id']

# wait until snapshot is ready
while project.export_snapshot_status(export_id).is_in_progress():
    time.sleep(1.0)

# download snapshot file
status, file_name = project.export_snapshot_download(export_id, export_type='${currentFormat}')
assert(status == 200)
assert(file_name is not None)
print(f"Status of the export is {status}.\\nFile name is {file_name}")`;
  }, [token, pjId, currentFormat]);

  const dataSelect = useMemo(() => {
    const data = [];
    const options = availableFormats
      .filter((f) => !f.disabled)
      .map((f) => {
        return {
          value: f.name,
          label: f.title,
        };
      });
    data.push({
      label: "",
      options: options,
    });
    return data;
  }, [availableFormats]);

  return (
    <div className="c-export-formats__opt2">
      <div className="formats__select">
        <Select
          defaultValue={currentFormat}
          data={dataSelect as DataSelect[]}
          className="c-export-formats__select"
          onChange={(value) => onSelectType(value)}
        />
        <Button className="formats__select--copy" onClick={() => copy && copy(sourceCode ?? "")}>
          Copy code
        </Button>
      </div>
      {copiedText && <span>The below code has been copied into the clipboard!</span>}
      <CodeBlock
        customStyle={{
          border: "solid 1px rgba(255,255,255,.1)",
          padding: "16",
          fontFamily: "monospace",
          borderRadius: "16",
        }}
        language="python"
        theme={codepen}
        text={sourceCode}
        showLineNumbers={false}
      />
    </div>
  );
};

export default DownloadSource;
