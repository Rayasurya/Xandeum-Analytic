import { BlockToolConstructorOptions } from "@editorjs/editorjs/types/tools/block-tool";
import { BlockToolData } from "@editorjs/editorjs/types/tools/block-tool-data";
import icons from "../icons";
import { createBlock, /*createSettings,*/ withName } from "../renderer";
import { audioPreview } from "./Preview";
// import {confirmDialog} from "@/components/Dialog";
// import InputBase from "@/components/InputBase/InputBase";

type TConfig = {
}

type TData = {
  name: string,
  dataKey: string,
}

const HTML = audioPreview

// function Properties({data, onChange}: {data: TData, onChange: (d: TData) => void}) {
//   return (
//     <>
//       <InputBase
//         value={data.name}
//         label="Name"
//         onChange={e => onChange({...data, name: e.target.value})}
//       />
//       <InputBase
//         value={data.dataKey}
//         label="Data Key"
//         onChange={e => onChange({...data, dataKey: e.target.value})}
//       />
//     </>
//   );
// }

export default class AudioBlock {
  data: TData = {
    name: "",
    dataKey: "",
  }

  element: HTMLElement;

  constructor({ data }: BlockToolConstructorOptions<TData, TConfig>) {
    this.data = {
      name: data.name ?? "audio",
      dataKey: data.dataKey ?? "$audio",
    };

    this.element = createBlock("block-audio");
  }

  static get toolbox() {
    return {
      title: "Audio",
      icon: icons.audio,
    };
  }

  render() {
    this.element.innerHTML = withName(this.data.name, HTML);
    return this.element;
  }

  // renderSettings() {
  //   return createSettings(this.data, (k: string) => {
  //     let newData = {...this.data};
  //
  //     confirmDialog({
  //       title: "Properties",
  //       submitText: "Update",
  //       onSubmit: () => {
  //         this.data = newData;
  //         this.render();
  //         this.renderSettings();
  //       },
  //       message: <Properties data={this.data} onChange={d => newData = {...d}} />,
  //     });
  //   });
  // }

  save(): BlockToolData<TData> {
    return this.data;
  }
}
