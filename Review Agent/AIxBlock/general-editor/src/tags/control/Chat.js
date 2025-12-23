import { toJS } from "mobx";
import { inject, observer } from "mobx-react";
import { types } from "mobx-state-tree";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IconPencil, IconText, IconTrash } from "../../assets/icons";
import { Button } from "../../common/Button/Button";
import { confirm, info } from "../../common/Modal/Modal";
import { RadioGroup } from "../../common/RadioGroup/RadioGroup";
import { TextArea } from "../../common/TextArea/TextArea";
import { Tooltip } from "../../common/Tooltip/Tooltip";
import Registry from "../../core/Registry";
import Tree from "../../core/Tree";
import { AnnotationMixin } from "../../mixins/AnnotationMixin";
import ProcessAttrsMixin from "../../mixins/ProcessAttrs";
import Result from "../../regions/Result";
import { cn } from "../../utils/bem";
import "./Chat.styl";
import { darkColorNames } from "../../utils/colors";

const TagAttrs = types.model({
  name: types.identifier,
  roles: types.optional(types.string, "User,System,Agent"),
  value: types.string,
  style: types.maybeNull(types.string),
  canadd: types.optional(types.boolean, true),
});

export const ChatMessage = types.model({
  role: types.string,
  content: types.string,
});

const Model = types.model({
  _value: types.optional(types.union(types.string, types.array(ChatMessage)), []),
  _roles: types.optional(types.array(types.string), []),
  type: "chat",
  valueType: "chat",
  classification: false,
  holdsState: true,
  messages: types.optional(types.array(ChatMessage), []),
  updatedAt: types.optional(types.string, (new Date).toISOString()),
})
  .views(() => ({

  }))
  .actions((self) => ({

    afterCreate() {
      self.updatedAt = (new Date).toISOString();
    },

    parseStringToMessages(str) {
      const messages = str.split("\n");
      const result = [];

      messages.forEach(m => {
        m = m.trim();
        const colonIdx = m.indexOf(":");

        if (colonIdx === -1) return;

        result.push({
          role: m.substring(0, colonIdx).trim(),
          content: m.substring(colonIdx + 1).trim(),
        });
      });

      return result;
    },

    parseRoles() {
      self._roles = self.roles.split(",").map(r => r.trim());
    },

    parseValue(store) {
      self.updateValue(store);

      if (typeof self._value === "string") {
        self.messages = self.parseStringToMessages(self._value);
      } else if (Array.isArray(self._value)) {
        self.messages = self._value.map(m => ({ ...m }));
      }
    },

    getArea() {
      return self.annotation.regions.find(r => {
        return r.results?.length > 0
          && r.results[0].from_name === self
          && r.results[0].type === "chat";
      });
    },

    getOrCreateArea() {
      const area = self.getArea();

      if (area) {
        return area;
      }

      self.annotation.appendResults([{
        type: "chat",
        from_name: "chat",
        to_name: "chat",
        value: {
          chat: toJS(self.messages),
        },
      }]);

      self.updatedAt = (new Date).toISOString();
      return self.getArea();
    },

    addMessage(role, content) {
      const area = self.getOrCreateArea();

      area.results[0].setValue([...area.results[0].value.chat, { role, content }]);
      self.updatedAt = (new Date).toISOString();
    },

    removeMessage(removeAt) {
      const area = self.getOrCreateArea();

      area.results[0].setValue(area.results[0].value.chat.filter((_, idx) => idx !== removeAt));
      self.updatedAt = (new Date).toISOString();
    },

    modifyMessage(modifyAt, newContent) {
      const area = self.getOrCreateArea();

      area.results[0].setValue(area.results[0].value.chat.map((m, idx) => {
        if (idx !== modifyAt) {
          return m;
        }

        return { ...m, content: newContent };
      }));

      self.updatedAt = (new Date).toISOString();
    },

    getAllMessages() {
      const area = self.getArea();

      return area ? area.results[0].value["chat"] : self.messages;
    },

  }));

const ChatView = ({ store, item }) => {
  const cls = cn("control-chat");
  const [role, setRole] = useState(0);
  const textareaRef = useRef(null);
  const contentInnerRef = useRef();
  const colors = useRef({});
  const colorIdx = useRef(-1);
  const area = useMemo(() => item.getArea(), [item.updatedAt]);
  const [showShortcut, setShowShortcut] = useState(false);

  const getColor = useCallback(str => {
    str = !str || str.trim().length === 0 ? "(Unknown)" : str.trim();

    if (!(str in colors.current)) {
      colorIdx.current++;
      const colorKeys = Object.keys(darkColorNames);
      const color = darkColorNames[colorKeys[colorIdx.current % colorKeys.length]];

      colors.current[str] = {
        color,
      };
    }

    return colors.current[str];
  }, []);

  const getColorStyle = useCallback(str => {
    const color = getColor(str);

    return {
      color: color.color,
    };
  }, [getColor]);

  const style = useMemo(() => {
    if (item.style) {
      return Tree.cssConverter(item.style);
    }

    return {};
  }, [item.style]);

  const renderMessage = useCallback((key, role, content, userMessage, onRemove = undefined, onEdit = undefined) => {
    return (
      <div key={key} className={cls.elem("message").mod({ userMessage })}>
        <div className={cls.elem("sender")} style={getColorStyle(role)}>
          <span className={cls.elem("senderName")}>{!role || role.trim().length === 0 ? "(Unknown)" : role}</span>
          {onRemove && (
            <Tooltip title="Remove">
              <span className={cls.elem("messageIcon")} onClick={() => onRemove()}>
                <IconTrash />
              </span>
            </Tooltip>
          )}
          {onEdit && (
            <Tooltip title="Edit">
              <span className={cls.elem("messageIcon")} onClick={() => onEdit()}>
                <IconPencil />
              </span>
            </Tooltip>
          )}
        </div>
        <div>
          {
            content.split("\n").map((l, idx) => <div key={"line-" + idx}>{l}</div>)
          }
        </div>
      </div>
    );
  }, []);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => {
      contentInnerRef.current?.scrollTo({ top: contentInnerRef.current?.scrollHeight, behavior: "smooth" });
    }, 250);
  }, []);

  const submit = useCallback(() => {
    const msg = textareaRef.current.el.current.value.trim();

    if (msg.length === 0) {
      info({ title: "Error", body: "Please enter the content" });
      return;
    }

    if (role > item._roles - 1 || role < 0) {
      info({ title: "Error", body: "No role specified" });
      return;
    }

    item.addMessage(item._roles[role], msg);
    textareaRef.current.update("");
    textareaRef.current.el.current.focus();
    scrollToEnd();
  }, [item, role, scrollToEnd]);

  const removeMessage = useCallback(idx => {
    item.removeMessage(idx);
  }, [item.removeMessage]);

  const modifyMessage = useCallback(idx => {
    const m = area ? area.results[0].value["chat"][idx] : item.messages?.[idx];

    if (!m) {
      info({ title: "Error", body: `Mesasge #${idx + 1} not found` });
      return;
    }

    let newMessage = "";

    confirm({
      title: "Modify Message",
      body: (
        <TextArea
          autoSize={true}
          value={m.content}
          onChange={content => newMessage = content}
        />
      ),
      onOk: () => {
        if (newMessage.trim().length > 0) {
          item.modifyMessage(idx, newMessage);
          return;
        }

        info({
          title: "Error",
          body: "Please enter the content",
          onOkPress: () => modifyMessage(idx),
        });
      },
    });
  }, [item.removeMessage]);

  useEffect(() => {
    scrollToEnd();
  }, [item.updatedAt, scrollToEnd]);

  useEffect(() => {
    item.parseRoles();
    item.parseValue(store);
    item.afterCreate();
  }, [item, store]);

  return (
    <div className={cls} style={style}>
      <div className={cls.elem("contentWrapper")}>
        <div className={cls.elem("contentInner")} ref={contentInnerRef}>
          <div className={cls.elem("messages")}>
            {!area && item.messages.map((m, idx) => {
              return renderMessage(
                "data-message-" + idx,
                m.role,
                m.content,
                m.role.toLowerCase() === item._roles?.[role]?.toLowerCase(),
                () => removeMessage(idx),
                () => modifyMessage(idx),
              );
            })}
            {area && area.results[0].value["chat"].map((m, idx) => {
              return renderMessage(
                "result-message-" + idx,
                m.role,
                m.content,
                m.role.toLowerCase() === item._roles?.[role]?.toLowerCase(),
                () => removeMessage(idx),
                () => modifyMessage(idx),
              );
            })}
          </div>
        </div>
      </div>
      <div>
        <RadioGroup value={role} onChange={ev => setRole(Number(ev.target.value))} size="medium" style={{ marginBottom: 8 }}>
          {item._roles.map((r, idx) => {
            return (
              <RadioGroup.Button key={"role-" + r} value={idx}>
                <span style={getColorStyle(r)}>
                  {r}
                </span>
                {idx < 9 && showShortcut && (
                  <>
                    &nbsp;
                    <sup>[Ctrl + {idx + 1}]</sup>
                  </>
                )}
              </RadioGroup.Button>
            );
          })}
        </RadioGroup>
        {item.canadd && (
          <div className={cls.elem("inputWrapper")}>
            <TextArea
              autoSize={true}
              actionRef={textareaRef}
              placeholder="Chat content goes here..."
              onKeyUp={ev => {
                if (!ev.ctrlKey) {
                  return;
                }

                if (ev.key === "Enter") {
                  submit();
                  ev.preventDefault();
                  ev.stopPropagation();
                  return;
                }

                const keyNumber = parseInt(ev.key);

                if (isNaN(keyNumber) || keyNumber < 1 || keyNumber > 9 || keyNumber > item._roles.length) {
                  return;
                }

                setRole(keyNumber - 1);
              }}
              onFocus={() => setShowShortcut(true)}
              onBlur={() => setShowShortcut(false)}
            />
            <Button
              look="primary"
              onClick={submit}
              onKeyUp={ev => {
                if (ev.key === "Enter") {
                  submit();
                }
              }}
            >
              Submit {showShortcut && <sup style={{ whiteSpace: "nowrap" }}>&nbsp;[Ctrl + Enter]</sup>}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const ChatModel = types.compose(
  "ChatModel",
  Model,
  AnnotationMixin,
  ProcessAttrsMixin,
  TagAttrs,
);

Registry.addTag("chat", ChatModel, inject("store")(observer(ChatView)));
Registry.addObjectType(ChatModel);

export { ChatModel };
