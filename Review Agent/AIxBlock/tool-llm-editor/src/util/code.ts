import { concat } from "lodash"
import { TFormItemProps } from "../common/types"
import { TEnvVariable } from "../components/templates/PreviewLayout"

export const renderPythonTemplate = (
  items: TFormItemProps[]
) => {
  const codeBegin = `from typing import List, Union
# import requests.asyncs as requests
import requests
import sa`

  const codeHooks = `
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
	return`

  const codeFieldInit = `<TYPE>_<ID> = ['<ID>']`

  const codeAction = `def on_<ID>_change(path: List[Union[str, int]], value):
# The path is a list of strings and integers, the length of which is always an odd number and not less than 1.
# The last value is the identifier of the form element and the pairs preceding it are
# the group identifiers and the subgroup index, respectively
# value is current value of the form element

# Your code goes here
return
`
  const codeFieldList = []
  const codeActionList = []
  let envsText = "<ENV>"

  for (let index = 0; index < items.length; index++) {
    const element = items[index]
    codeFieldList.push(
      codeFieldInit
        .replaceAll("<ID>", element.id)
        .replaceAll("<TYPE>", element.type)
    )
    codeActionList.push(codeAction.replaceAll("<ID>", element.id))
  }

  return concat(
    [codeBegin],
    [envsText],
    codeFieldList,
    [codeHooks],
    codeActionList
  ).join("\n")
}
