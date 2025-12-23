import {
  TabsIcon,
  GroupIcon,
  GridIcon,
  DividerIcon,
  ButtonPrimaryIcon,
  ButtonOutlineIcon,
  TextInputIcon,
  TextAreaIcon,
  NumberIcon,
  CodeIcon,
  ParagraphIcon,
  MarkdownIcon,
  SelectIcon,
  SliderIcon,
  CheckboxIcon,
  RadioIcon,
  VotingIcon,
  RatingIcon,
  DateIcon,
  TimeIcon,
  ImageIcon,
  WebIcon,
  PDFIcon,
  AudioIcon,
  AvatarIcon,
  CSVIcon,
} from "../assets/icons"

export const tabTemplate = [
  {
    id: "llm_tab_1",
    label: "Tab 1",
    children: [],
  },
  {
    id: "llm_tab_2",
    label: "Tab 2",
    children: [],
  },
]

export const gridTemplate = [
  {
    id: "llm_grid_1",
    size: 12,
    children: [],
  },
  {
    id: "llm_grid_2",
    size: 12,
    children: [],
  },
]

export const commonWithInfoTemplate = {
  label: "Section name",
  showInfo: false,
  tooltip: "Enter your text here to see it in the info tooltip",
}

export const buttonTemplate = {
  label: "Button",
  showLabel: true,
  showIcon: false,
  icon: null,
  showInfo: false,
  tooltip: "Enter your text here to see it in the info tooltip",
}

export const textInputTemplate = {
  label: "Text Input",
  idLabelRequired: true,
  placeholder: "Text Input",
  showInfo: false,
  tooltip: "Enter your text here to see it in the info tooltip",
  minLength: 0,
  maxLength: 300,
  required: false,
  excludeFormExport: false,
}

export const textAreaTemplate = {
  label: "Text Area",
  idLabelRequired: true,
  placeholder: "Text Area",
  showInfo: false,
  tooltip: "Enter your text here to see it in the info tooltip",
  minLength: 0,
  maxLength: 512,
  required: false,
  excludeFormExport: false,
}

export const numberTemplate = {
  label: "Number",
  showInfo: false,
  tooltip: "Enter your text here to see it in the info tooltip",
  min: null,
  max: null,
  step: 1,
  required: false,
  excludeFormExport: false,
}

export const codeTemplate = {
  label: "Code",
  showInfo: false,
  tooltip: "Enter your text here to see it in the info tooltip",
  required: false,
  excludeFormExport: false,
  text: "",
}

export const paragraphTemplate = {
  label: "Label",
  showInfo: false,
  tooltip: "Enter your text here to see it in the info tooltip",
  text: "Paragraph text",
  excludeFormExport: false,
}

export const markdownTemplate = {
  label: "Label",
  showInfo: false,
  tooltip: "Enter your text here to see it in the info tooltip",
  text: "",
  required: false,
  excludeFormExport: false,
}

export const selectTemplate = {
  label: "Label",
  showInfo: false,
  tooltip: "Enter your text here to see it in the info tooltip",
  placeholder: "",
  required: false,
  excludeFormExport: false,
  optionType: "single",
  defaultOptions: [
    {
      value: "option_1",
      label: "Option 1",
    },
  ],
  options: [
    {
      value: "option_1",
      label: "Option 1",
    },
    {
      value: "option_2",
      label: "Option 2",
    },
    {
      value: "option_3",
      label: "Option 3",
    },
  ],
}

export const sliderTemplate = {
  label: "Slider",
  showInfo: false,
  tooltip: "Enter your text here to see it in the info tooltip",
  min: 0,
  max: 100,
  step: 1,
  excludeFormExport: false,
  suffix: "-",
  sliderType: "regular",
}

export const checkboxTemplate = {
  label: "Checkbox",
  showInfo: false,
  tooltip: "Enter your text here to see it in the info tooltip",
  required: false,
  excludeFormExport: false,
  optionType: "multiple",
  defaultOptions: [
    {
      value: "option_1",
      label: "Option 1",
    },
  ],
  options: [
    {
      value: "option_1",
      label: "Option 1",
    },
    {
      value: "option_2",
      label: "Option 2",
    },
    {
      value: "option_3",
      label: "Option 3",
    },
  ],
}

export const radioTemplate = {
  label: "Radio",
  showInfo: false,
  tooltip: "Enter your text here to see it in the info tooltip",
  required: false,
  excludeFormExport: false,
  optionType: "single",
  defaultOptions: [
    {
      value: "option_1",
      label: "Option 1",
    },
  ],
  options: [
    {
      value: "option_1",
      label: "Option 1",
    },
    {
      value: "option_2",
      label: "Option 2",
    },
    {
      value: "option_3",
      label: "Option 3",
    },
  ],
}

export const votingTemplate = {
  label: "Approve / Disapprove",
  showInfo: false,
  tooltip: "Enter your text here to see it in the info tooltip",
  value: "",
  required: false,
  excludeFormExport: false,
}

export const ratingTemplate = {
  label: "Rating",
  showInfo: false,
  tooltip: "Enter your text here to see it in the info tooltip",
  value: "",
  required: false,
	excludeFormExport: false,
	numberOfStar: 5
}

export const dateTemplate = {
  label: "Date",
  showInfo: false,
  tooltip: "Enter your text here to see it in the info tooltip",
  value: "",
  includeTime: false,
  required: false,
	excludeFormExport: false,
}

export const timeTemplate = {
  label: "Time",
  showInfo: false,
  tooltip: "Enter your text here to see it in the info tooltip",
  value: "",
  required: false,
	excludeFormExport: false,
}
export const imageTemplate = {
  label: "Form Image",
  showInfo: false,
  tooltip: "Enter your text here to see it in the info tooltip",
  url: "",
  alt: "",
	excludeFormExport: false,
}

export const videoTemplate = {
  label: "Form Video",
  showInfo: false,
  tooltip: "Enter your text here to see it in the info tooltip",
  url: "",
  alt: "",
	excludeFormExport: false,
}

export const audioTemplate = {
  label: "Form Audio",
  showInfo: false,
  tooltip: "Enter your text here to see it in the info tooltip",
  url: "",
  alt: "",
	excludeFormExport: false,
}

export const avatarTemplate = {
  label: "Avatar Image",
  showInfo: false,
  tooltip: "Enter your text here to see it in the info tooltip",
  url: "",
  alt: "",
	excludeFormExport: false,
}
export const pdfTemplate = {
  label: "Form PDF",
  showInfo: false,
  tooltip: "Enter your text here to see it in the info tooltip",
  url: "",
  height: 400,
	excludeFormExport: false,
}
export const webTemplate = {
  label: "Form Web",
  showInfo: false,
  tooltip: "Enter your text here to see it in the info tooltip",
  sourceType: "url",
  text: "",
  url: "",
  height: 400,
	excludeFormExport: false,
}

export const csvTemplate = {
  label: "Form CSV",
  showInfo: false,
  tooltip: "Enter your text here to see it in the info tooltip",
  value: "",
  delimiter: ",",
	excludeFormExport: false,
}


export const groupTemplate = {}

export const IconsMapping = {
  tabs: {
    name: "Tabs",
    icon: TabsIcon,
    type: "tabs",
  },
  group: {
    name: "Group",
    icon: GroupIcon,
    type: "group",
  },
  grid: {
    name: "Grid",
    icon: GridIcon,
    type: "grid",
  },
  divider: {
    name: "Divider",
    icon: DividerIcon,
    type: "divider",
  },
  button_primary: {
    name: "Primary",
    icon: ButtonPrimaryIcon,
    type: "button_primary",
  },
  button_outline: {
    name: "Outline",
    icon: ButtonOutlineIcon,
    type: "button_outline",
  },
  text_input: {
    name: "Text input",
    icon: TextInputIcon,
    type: "text_input",
  },
  text_area: {
    name: "Text area",
    icon: TextAreaIcon,
    type: "text_area",
  },
  number: {
    name: "Number",
    icon: NumberIcon,
    type: "number",
  },
  code: {
    name: "Code",
    icon: CodeIcon,
    type: "code",
  },
  paragraph: {
    name: "Paragraph",
    icon: ParagraphIcon,
    type: "paragraph",
  },
  markdown: {
    name: "Markdown",
    icon: MarkdownIcon,
    type: "markdown",
  },
  select: {
    name: "Select",
    icon: SelectIcon,
    type: "select",
  },
  slider: {
    name: "Slider",
    icon: SliderIcon,
    type: "slider",
  },
  check_box: {
    name: "Check box",
    icon: CheckboxIcon,
    type: "check_box",
  },
  radio: {
    name: "Radio",
    icon: RadioIcon,
    type: "radio",
  },
  voting: {
    name: "Voting",
    icon: VotingIcon,
    type: "voting",
  },
  rating: {
    name: "Rating",
    icon: RatingIcon,
    type: "rating",
  },
  date: {
    name: "Date",
    icon: DateIcon,
    type: "date",
  },
  time: {
    name: "Time",
    icon: TimeIcon,
    type: "time",
  },
  image: {
    name: "Image",
    icon: ImageIcon,
    type: "image",
  },
  web: {
    name: "Web",
    icon: WebIcon,
    type: "web",
  },
  pdf: {
    name: "PDF",
    icon: PDFIcon,
    type: "pdf",
  },
  video: {
    name: "Video",
    icon: TabsIcon,
    type: "video",
  },
  audio: {
    name: "Audio",
    icon: AudioIcon,
    type: "audio",
  },
  avatar: {
    name: "Avatar",
    icon: AvatarIcon,
    type: "avatar",
  },
  csv: {
    name: "CSV",
    icon: CSVIcon,
    type: "csv",
  },
}
