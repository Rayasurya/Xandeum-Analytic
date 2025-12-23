import ArrowDownIcon from "./ArrowDownIcon"
import AudioIcon from "./AudioIcon"
import AvatarIcon from "./AvatarIcon"
import ButtonOutlineIcon from "./ButtonOutlineIcon"
import ButtonPrimaryIcon from "./ButtonPrimaryIcon"
import CheckboxIcon from "./CheckboxIcon"
import CodeIcon from "./CodeIcon"
import DateIcon from "./DateIcon"
import DividerIcon from "./DividerIcon"
import GridIcon from "./GridIcon"
import GroupIcon from "./GroupIcon"
import ImageIcon from "./ImageIcon"
import MarkdownIcon from "./MarkdownIcon"
import NumberIcon from "./NumberIcon"
import ParagraphIcon from "./ParagraphIcon"
import PDFIcon from "./PDFIcon"
import RadioIcon from "./RadioIcon"
import RatingIcon from "./RatingIcon"
import SelectIcon from "./SelectIcon"
import SideExpandIcon from "./SideExpandIcon"
import SliderIcon from "./SliderIcon"
import CSVIcon from "./CSVIcon"
import TabsIcon from "./TabsIcon"
import TextAreaIcon from "./TextAreaIcon"
import TextInputIcon from "./TextInputIcon"
import TimeIcon from "./TimeIcon"
import VideoIcon from "./VideoIcon"
import VotingIcon from "./VotingIcon"
import WebIcon from "./WebIcon"
import TrashBinIcon from "./TrashBinIcon"
import CopyIcon from "./CopyIcon"
import DragIcon from "./DragIcon"
import PlusIcon from "./PlusIcon"
import CloseIcon from "./CloseIcon"
import QuestionIcon from "./QuestionIcon"
import CheckboxUncheckIcon from "./CheckboxUncheckIcon"
import LikeIcon from "./LikeIcon"
import DislikeIcon from "./DislikeIcon"
import ImageHolderIcon from "./ImageHolderIcon"
import AlignTopIcon from "./AlignTopIcon"
import AlignMidIcon from "./AlignMidIcon"
import AlignBottomIcon from "./AlignBottomIcon"
import EditIcon from "./EditIcon"
import ReloadIcon from "./ReloadIcon"
import PlayIcon from "./PlayIcon"

export {
  ArrowDownIcon,
  AudioIcon,
  AvatarIcon,
  ButtonOutlineIcon,
  ButtonPrimaryIcon,
  CheckboxIcon,
  CodeIcon,
  DateIcon,
  DividerIcon,
  GridIcon,
  GroupIcon,
  ImageIcon,
  MarkdownIcon,
  NumberIcon,
  ParagraphIcon,
  PDFIcon,
  RadioIcon,
  RatingIcon,
  SelectIcon,
  SideExpandIcon,
  SliderIcon,
  CSVIcon,
  TabsIcon,
  TextAreaIcon,
  TextInputIcon,
  TimeIcon,
  VideoIcon,
  VotingIcon,
  WebIcon,
  TrashBinIcon,
  CopyIcon,
  DragIcon,
  PlusIcon,
  CloseIcon,
  QuestionIcon,
  CheckboxUncheckIcon,
  LikeIcon,
  DislikeIcon,
  ImageHolderIcon,
  AlignTopIcon,
  AlignMidIcon,
  AlignBottomIcon,
  EditIcon,
  ReloadIcon,
  PlayIcon,
}


export const IconList = {
  arrow_down: ArrowDownIcon,
  audio: AudioIcon,
  avatar: AvatarIcon,
  button_outline: ButtonOutlineIcon,
  button_primary: ButtonPrimaryIcon,
  checkbox: CheckboxIcon,
  code: CodeIcon,
  date: DateIcon,
  divider: DividerIcon,
  grid: GridIcon,
  group: GroupIcon,
  image: ImageIcon,
  markdown: MarkdownIcon,
  number: NumberIcon,
  paragraph: ParagraphIcon,
  pdf: PDFIcon,
  radio: RadioIcon,
  rating: RatingIcon,
  select: SelectIcon,
  side_expand: SideExpandIcon,
  slider: SliderIcon,
  csv: CSVIcon,
  tabs: TabsIcon,
  text_area: TextAreaIcon,
  text_input: TextInputIcon,
  time: TimeIcon,
  video: VideoIcon,
  voting: VotingIcon,
  web: WebIcon,
  trash_bin: TrashBinIcon,
  copy: CopyIcon,
  drag: DragIcon,
  plus: PlusIcon,
  close: CloseIcon,
  question: QuestionIcon,
  checkbox_uncheck: CheckboxUncheckIcon,
  like: LikeIcon,
  dislike: DislikeIcon,
  image_holder: ImageHolderIcon,
  align_top: AlignTopIcon,
  align_mid: AlignMidIcon,
  align_bottom: AlignBottomIcon,
  edit: EditIcon,
  reload: ReloadIcon,
  play: PlayIcon,
}

export type IconListType = keyof typeof IconList

export const selectList = [
  { value: "arrow_down", label: "Arrow Down" }, // From arrow_down
  { value: "audio", label: "Audio" },          // From audio 
  { value: "avatar", label: "Avatar" },         // From avatar
  { value: "button_outline", label: "Button Outline" },  // From button_outline
  { value: "button_primary", label: "Button Primary" },  // From button_primary
  { value: "checkbox", label: "Checkbox" },      // From checkbox
  { value: "code", label: "Code" },              // From code
  { value: "date", label: "Date" },              // From date
  { value: "divider", label: "Divider" },        // From divider
  { value: "grid", label: "Grid" },              // From grid
  { value: "group", label: "Group" },            // From group
  { value: "image", label: "Image" },            // From image
  { value: "markdown", label: "Markdown" },      // From markdown
  { value: "number", label: "Number" },          // From number
  { value: "paragraph", label: "Paragraph" },     // From paragraph
  { value: "pdf", label: "PDF" },                // From pdf
  { value: "radio", label: "Radio" },            // From radio
  { value: "rating", label: "Rating" },          // From rating
  { value: "select", label: "Select" },          // From select
  { value: "side_expand", label: "Side Expand" },// From side_expand
  { value: "slider", label: "Slider" },          // From slider
  { value: "csv", label: "CSV" },                // From csv
  { value: "tabs", label: "Tabs" },              // From tabs
  { value: "text_area", label: "Text Area" },    // From text_area
  { value: "text_input", label: "Text Input" },  // From text_input
  { value: "time", label: "Time" },              // From time
  { value: "video", label: "Video" },            // From video
  { value: "voting", label: "Voting" },          // From voting
  { value: "web", label: "Web" },                // From web
  { value: "trash_bin", label: "Trash Bin" },    // From trash_bin 
  { value: "copy", label: "Copy" },              // From copy
  { value: "drag", label: "Drag" },              // From drag
  { value: "plus", label: "Plus" },              // From plus
  { value: "close", label: "Close" },            // From close
  { value: "question", label: "Question" },      // From question
  { value: "checkbox_uncheck", label: "Checkbox Uncheck" }, // From checkbox_uncheck
  { value: "like", label: "Like" },              // From like
  { value: "dislike", label: "Dislike" },        // From dislike
  { value: "image_holder", label: "Image Holder" }, // From image_holder
  { value: "align_top", label: "Align Top" },    // From align_top
  { value: "align_mid", label: "Align Mid" },    // From align_mid
  { value: "align_bottom", label: "Edit" }, // From align_bottom
  { value: "edit", label: "Align Bottom" }, // From edit
  { value: "reload", label: "Reload" }, // From reload
  { value: "play", label: "Play" } // From reload
]
