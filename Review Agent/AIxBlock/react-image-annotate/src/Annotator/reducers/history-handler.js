// @flow

import type { MainLayoutState, Action } from "../../MainLayout/types"
import { setIn, updateIn, asMutable, without } from "seamless-immutable"
import moment from "moment"
import { getIn } from "immutable"

const typesToSaveWithHistory = {
  BEGIN_BOX_TRANSFORM: "Transform/Move Box",
  BEGIN_MOVE_POINT: "Move Point",
  DELETE_REGION: "Delete Region",
}

export const saveToHistory = (state: MainLayoutState, name: string) => {
  return updateIn(setIn(state, ["redoHistory"], []), ["history"], (h) =>
    [
      {
        time: moment().toDate(),
        state: without(state, "history"),
        name,
      },
    ].concat((h || []).slice(0, 9))
  )
}

export default (reducer) => {
  return (state: MainLayoutState, action: Action) => {
    const prevState = state
    const nextState = reducer(state, action)

    if (action.type === "RESTORE_HISTORY" || action.type === "UNDO_HISTORY") {
      if (state.history.length > 0) {
        const redoHistory = getIn(state, ["redoHistory"])
        const newRedo = [
          {
            time: moment().toDate(),
            state: state,
          },
        ].concat(redoHistory || {})
        return setIn(
          setIn(
            setIn(
              nextState.history[0].state,
              ["history"],
              nextState.history.slice(1)
            ),
            ["redoHistory"],
            newRedo
          ),
          ["saveState"],
          "start"
        )
      }
    } else if (action.type === "REDO_HISTORY") {
      if (state.redoHistory?.length > 0) {
        return setIn(
          setIn(
            nextState.redoHistory[0].state,
            ["redoHistory"],
            nextState.redoHistory.slice(1)
          ),
          ["saveState"],
          "start"
        )
      }
    } else {
      if (
        prevState !== nextState &&
        Object.keys(typesToSaveWithHistory).includes(action.type)
      ) {
        return setIn(
          nextState,
          ["history"],
          [
            {
              time: moment().toDate(),
              state: without(prevState, "history"),
              name: typesToSaveWithHistory[action.type] || action.type,
            },
          ]
            .concat(nextState.history || [])
            .slice(0, 9)
        )
      }
    }

    return nextState
  }
}
