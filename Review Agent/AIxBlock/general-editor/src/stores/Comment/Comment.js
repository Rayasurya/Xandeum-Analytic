import { getEnv, types } from "mobx-state-tree";
import Utils from "../../utils";
import { camelizeKeys } from "../../utils/utilities";

export const Comment = types.model("Comment", {
  id: types.identifierNumber,
  text: types.string,
  createdAt: types.optional(types.string, Utils.UDate.currentISODate()),
  resolvedAt: types.optional(types.maybeNull(types.string), null),
  createdBy: types.optional(types.maybeNull(types.model({
    id: types.identifierNumber,
    first_name: types.maybeNull(types.string),
    last_name: types.maybeNull(types.string),
    username: types.maybeNull(types.string),
    avatar: types.maybeNull(types.string),
  })), null),
  isResolved: false,
})
  .preProcessSnapshot((sn) => {
    return camelizeKeys(sn ?? {});
  })
  .views(self => ({
    get sdk() {
      return getEnv(self).events;
    },
    get isPersisted() {
      return self.id > 0;
    },
  }))
  .actions(self => {
    function setResolve(state) {
      self.isResolved = state;
    }

    async function toggleResolve() {
      if (!self.isPersisted) return;

      try {
        const [result] = await self.sdk.invoke("comments:update", {
          id: self.id,
          is_resolved: !self.isResolved,
        });

        if (typeof result === "object" && "is_resolved" in result) {
          self.setResolve(Boolean(result["is_resolved"]));
        }
      } catch(e) {
        console.error(e);
      }
    }

    return {
      setResolve,
      toggleResolve,
    };
  });
