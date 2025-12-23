import {BlockToolConstructorOptions} from "@editorjs/editorjs/types/tools/block-tool";
import icons from "../icons";
import {OutputData} from "@editorjs/editorjs";
import ColumnsBlock from "../Columns/Columns";

type TConfig = {
}

type TData = {
  columns: OutputData[],
}

export default class StickyBlock extends ColumnsBlock {
  constructor(opts: BlockToolConstructorOptions<TData, TConfig>) {
    super(opts);

    this.data = {
      columns: opts.data.columns ?? [{blocks: []}],
    };
  }

  static get toolbox() {
    return {
      title: "Sticky",
      icon: icons.sticky,
    };
  }
}
