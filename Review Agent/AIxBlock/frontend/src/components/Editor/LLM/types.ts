export type TFromComponent = {
  components: TFormItemProps[];
  layout: TFormItemLayoutProps[];
  environments: TEnvVariable[];
  code: string;
};

export type TFormItemProps = {
  id: string;
  type: ToolType;
  options: TFormCommonProps;
};

export type TEnvVariable = {
  id: string;
  name: string;
  value: string;
  isSecured: boolean;
};

export type TFormItemLayoutProps = {
  id: string;
  type: string | undefined;
  children: TFormItemLayoutProps[];
};

export type TFormCommonProps = {
  label?: string;
  idLabelRequired?: boolean;
  placeholder?: string;
  showLabel?: boolean;
  showIcon?: boolean;
  showInfo?: boolean;
  tooltip?: string;
  resizeable?: boolean;
  icon?: string | null;
  verticalAlignment?: "top" | "mid" | "bottom";
  tabs?: TFormTabs[];
  columns?: TFormGrids[];
  includeTime?: boolean;
  required?: boolean;
  excludeFormExport?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  step?: number;
  text?: string;
  optionType?: "single" | "multiple";
  defaultOptions?: OptionType[];
  options?: OptionType[];
  suffix?: "-" | "$" | "#" | "%";
  sliderType?: "regular" | "range";
  defaultRange?: [number, number];
  numberOfStar?: number;
  url?: string;
  alt?: string;
  value?: string;
  height?: number;
  sourceType?: "url" | "code";
  delimiter?: "," | ";" | "|";
};

export type TFormTabs = {
  id: string;
  label: string;
  children: [];
};
export type TFormGrids = {
  id: string;
  size: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  children: [];
};

export type OptionType = {
  value: string;
  label: string;
};

export type ToolType =
  | "tabs"
  | "group"
  | "grid"
  | "divider"
  | "button_primary"
  | "button_outline"
  | "text_input"
  | "text_area"
  | "number"
  | "code"
  | "paragraph"
  | "markdown"
  | "select"
  | "slider"
  | "check_box"
  | "radio"
  | "voting"
  | "rating"
  | "date"
  | "time"
  | "image"
  | "web"
  | "pdf"
  | "video"
  | "audio"
  | "avatar"
  | "csv";
