export const mockForm = {
  components: [
    {
      id: "llm_DTBG7J",
      type: "tabs",
      options: {
        tabs: [
          {
            id: "llm_tab_1",
            label: "Tab 1",
            children: [{ id: "llm_A4U1HJ", type: "text_area", children: [] }],
          },
          { id: "llm_tab_2", label: "Tab 2", children: [] },
        ],
      },
    },
    {
      id: "llm_9KBE9O",
      type: "text_input",
      options: {
        label: "Text Input",
        idLabelRequired: true,
        placeholder: "Text Input",
        showInfo: false,
        tooltip: "Enter your text here to see it in the info tooltip",
        minLength: 0,
        maxLength: 300,
        required: false,
        excludeFormExport: false,
      },
    },
    {
      id: "llm_A4U1HJ",
      type: "text_area",
      options: {
        label: "Text Area",
        idLabelRequired: true,
        placeholder: "Text Area",
        showInfo: false,
        tooltip: "Enter your text here to see it in the info tooltip",
        minLength: 0,
        maxLength: 512,
        required: false,
        excludeFormExport: false,
      },
    },
    {
      id: "llm_OJ3GPH",
      type: "button_primary",
      options: {
        label: "Button",
        showLabel: true,
        showIcon: false,
        icon: null,
        showInfo: false,
        tooltip: "Enter your text here to see it in the info tooltip",
      },
    },
    {
      id: "llm_XTU85L",
      type: "grid",
      options: {
        columns: [
          {
            id: "llm_grid_1",
            size: 12,
            children: [
              { id: "llm_9KBE9O", type: "text_input", children: [] },
              { id: "llm_CFX4KL", type: "rating", children: [] },
              { id: "llm_Y80BW4", type: "check_box", children: [] },
            ],
          },
          {
            id: "llm_grid_2",
            size: 12,
            children: [
              { id: "llm_FNTA3M", type: "text_input", children: [] },
              { id: "llm_K6WA9C", type: "rating", children: [] },
              { id: "llm_CJURL6", type: "radio", children: [] },
            ],
          },
        ],
      },
    },
    {
      id: "llm_FNTA3M",
      type: "text_input",
      options: {
        label: "Text Input",
        idLabelRequired: true,
        placeholder: "Text Input",
        showInfo: false,
        tooltip: "Enter your text here to see it in the info tooltip",
        minLength: 0,
        maxLength: 300,
        required: false,
        excludeFormExport: false,
      },
    },
    {
      id: "llm_CFX4KL",
      type: "rating",
      options: {
        label: "Rating",
        showInfo: false,
        tooltip: "Enter your text here to see it in the info tooltip",
        value: "",
        required: false,
        excludeFormExport: false,
        numberOfStar: 5,
      },
    },
    {
      id: "llm_K6WA9C",
      type: "rating",
      options: {
        label: "Rating",
        showInfo: false,
        tooltip: "Enter your text here to see it in the info tooltip",
        value: "",
        required: false,
        excludeFormExport: false,
        numberOfStar: 5,
      },
    },
    {
      id: "llm_Y80BW4",
      type: "check_box",
      options: {
        label: "Checkbox",
        showInfo: false,
        tooltip: "Enter your text here to see it in the info tooltip",
        required: false,
        excludeFormExport: false,
        optionType: "multiple",
        defaultOptions: [{ value: "option_1", label: "Option 1" }],
        options: [
          { value: "option_1", label: "Option 1" },
          { value: "option_2", label: "Option 2" },
          { value: "option_3", label: "Option 3" },
        ],
      },
    },
    {
      id: "llm_CJURL6",
      type: "radio",
      options: {
        label: "Radio",
        showInfo: false,
        tooltip: "Enter your text here to see it in the info tooltip",
        required: false,
        excludeFormExport: false,
        optionType: "single",
        defaultOptions: [{ value: "option_1", label: "Option 1" }],
        options: [
          { value: "option_1", label: "Option 1" },
          { value: "option_2", label: "Option 2" },
          { value: "option_3", label: "Option 3" },
        ],
      },
    },
    {
      id: "llm_KFUOG5",
      type: "date",
      options: {
        label: "Date",
        showInfo: false,
        tooltip: "Enter your text here to see it in the info tooltip",
        value: "",
        includeTime: false,
        required: false,
        excludeFormExport: false,
      },
    },
    {
      id: "llm_GZTEAB",
      type: "number",
      options: {
        label: "Number",
        showInfo: false,
        tooltip: "Enter your text here to see it in the info tooltip",
        min: null,
        max: null,
        step: 1,
        required: false,
        excludeFormExport: false,
      },
    },
  ],
  layout: [
    {
      id: "llm_DTBG7J",
      type: "tabs",
      children: [
        {
          id: "llm_tab_1",
          label: "Tab 1",
          children: [{ id: "llm_A4U1HJ", type: "text_area", children: [] }],
        },
        { id: "llm_tab_2", label: "Tab 2", children: [] },
      ],
    },
    {
      id: "llm_XTU85L",
      type: "grid",
      children: [
        {
          id: "llm_grid_1",
          size: 12,
          children: [
            { id: "llm_9KBE9O", type: "text_input", children: [] },
            { id: "llm_CFX4KL", type: "rating", children: [] },
            { id: "llm_Y80BW4", type: "check_box", children: [] },
          ],
        },
        {
          id: "llm_grid_2",
          size: 12,
          children: [
            { id: "llm_FNTA3M", type: "text_input", children: [] },
            { id: "llm_K6WA9C", type: "rating", children: [] },
            { id: "llm_CJURL6", type: "radio", children: [] },
          ],
        },
      ],
    },
    { id: "llm_KFUOG5", type: "date", children: [] },
    { id: "llm_GZTEAB", type: "number", children: [] },
    { id: "llm_OJ3GPH", type: "button_primary", children: [] },
  ],
}

export const mockCode = `from typing import List, Union
# import requests.asyncs as requests
import requests
import sa

textarea_r_dyer8z = ['r_dyer8z']

def before_save_hook(old_status: str, new_status: str) -> bool:
    # Your code goes here
    return

def on_saved_hook():
    # Your code goes here
    return

def before_status_change_hook(old_status: str, new_status: str) -> bool:
    # Your code goes here
    return

def on_status_changed_hook(old_status: str, new_status: str):
    # Your code goes here
    return

def post_hook():
    # Your code goes here
    return

def on_r_dyer8z_change(path: List[Union[str, int]], value):
    # The path is a list of strings and integers, the length of which is always an odd number and not less than 1.
    # The last value is the identifier of the form element and the pairs preceding it are
    # the group identifiers and the subgroup index, respectively
    # value is current value of the form element

    # Your code goes here
    return
`