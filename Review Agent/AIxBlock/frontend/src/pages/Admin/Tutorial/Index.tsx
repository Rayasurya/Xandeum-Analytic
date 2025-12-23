import "./Index.scss";
import useTutorialGroups from "@/hooks/tutorial/useTutorialGroups";
import React from "react";
import {createAlert} from "@/utils/createAlert";
import AdminLayout from "../Layout";
import Button from "@/components/Button/Button";
import IconPlus from "@/assets/icons/IconPlus";
import Table, {TableActions} from "@/components/Table/Table";
import {formatDateTime} from "@/utils/formatDate";
import {TTutorialGroup} from "@/models/tutorialGroup";
import {TTutorialSubgroup} from "@/models/tutorialSubgroup";
import {TTutorialSection} from "@/models/tutorialSection";
import {TTutorialArticle} from "@/models/tutorialArticle";
import TutorialGroupForm from "./Group/Form";
import TutorialSubgroupForm from "./Subgroup/Form";
import TutorialSectionForm from "./Section/Form";
import {useNavigate} from "react-router-dom";
import {useApi} from "@/providers/ApiProvider";
import {usePromiseLoader} from "@/providers/LoaderProvider";
import {confirmDialog, infoDialog} from "@/components/Dialog";

export type TTutorialGroupForm = Pick<TTutorialGroup, "id" | "name" | "order">
export type TTutorialSubgroupForm = Pick<TTutorialSubgroup, "id" | "name" | "group_id">
export type TTutorialSectionForm = Pick<TTutorialSection, "id" | "title" | "url" | "sub_group_id">

type TTableData = {
  id: number,
  type: "group" | "subgroup" | "section" | "content",
  name: string,
  created_at: string | null | undefined,
  obj: TTutorialGroup | TTutorialSubgroup | TTutorialSection | TTutorialArticle,
}

export default function Tutorial() {
  const {error: groupError, list: groups, save: saveGroup, saving: savingGroup, refresh: refreshGroups} = useTutorialGroups();
  const [group, setGroup] = React.useState<TTutorialGroupForm | null>(null);
  const [subgroup, setSubgroup] = React.useState<TTutorialSubgroupForm | null>(null);
  const [section, setSection] = React.useState<TTutorialSectionForm | null>(null);
  const {addPromise} = usePromiseLoader();
  const navigate = useNavigate();
  const api = useApi();

  // Transform groups, subgroups, sections, contents to a flat array
  const tableData = React.useMemo(() => {
    const list: TTableData[] = [];

    groups.forEach(g => {
      list.push({id: g.id, type: "group", created_at: g.created_at, name: g.name, obj: g});

      g.sub_groups.forEach(sg => {
        list.push({id: sg.id, type: "subgroup", created_at: sg.created_at, name: sg.name, obj: sg})

        sg.section_contents.forEach(s => {
          list.push({id: s.id, type: "section", created_at: s.created_at, name: s.title, obj: s})

          if (s.tutorial_content) {
            list.push({
              id: s.tutorial_content.id,
              type: "content",
              created_at: s.tutorial_content.created_at,
              name: s.tutorial_content.title,
              obj: s.tutorial_content,
            });
          }
        });
      });
    });

    return list;
  }, [groups]);

  const groupErrorNode = React.useMemo(() => {
    return createAlert(groupError, refreshGroups, false, { marginBottom: 32 });
  }, [groupError, refreshGroups]);

  const groupFormNode = React.useMemo(() => {
    if (!group) {
      return null;
    }

    return <TutorialGroupForm
      obj={group}
      onCancel={() => setGroup(null)}
      onChange={(obj) => setGroup(obj)}
      onSuccess={() => {
        setGroup(null);
        refreshGroups();
      }}
      saveGroup={saveGroup}
      saving={savingGroup}
    />;
  }, [group, refreshGroups, saveGroup, savingGroup]);

  const subgroupFormNode = React.useMemo(() => {
    if (!subgroup) {
      return null;
    }

    return <TutorialSubgroupForm
      groups={groups}
      obj={subgroup}
      onCancel={() => setSubgroup(null)}
      onChange={sg => setSubgroup(sg)}
      onSuccess={() => {
        setSubgroup(null);
        refreshGroups();
      }}
    />
  }, [groups, refreshGroups, subgroup]);

  const sectionFormNode = React.useMemo(() => {
    if (!section) {
      return null;
    }

    return <TutorialSectionForm
      groups={groups}
      obj={section}
      onCancel={() => setSection(null)}
      onChange={sg => setSection(sg)}
      onSuccess={() => {
        setSection(null);
        refreshGroups();
      }}
    />
  }, [groups, refreshGroups, section]);

  const remove = React.useCallback((type: "group" | "subgroup" | "section" | "content", id: number) => {
    confirmDialog({
      title: "DELETE " + type.toUpperCase(),
      message: "Are you sure you want to delete " + type + "?",
      onSubmit: () => {
        const apiMap: {[k: string]: string} = {
          "group": "deleteTutorialContent",
          "subgroup": "deleteTutorialSubgroup",
          "section": "deleteTutorialSection",
          "content": "deleteTutorialContent",
        }

        const ar = api.call(apiMap[type], {params: {id: id.toString()}});
        addPromise(ar.promise, "Deleting " + type + "...");

        ar.promise
          .then(async r => {
            if (r.ok) {
              refreshGroups();
              return;
            }

            const res = await r.json();

            if (Object.hasOwn(res, "detail")) {
              infoDialog({title: "Error", message: res["detail"]});
            }
          })
      },
    });
  }, [api, refreshGroups, addPromise]);

  return (
    <React.Fragment>
      <AdminLayout
        title="Tutorials"
        actions={<>
          <Button size="medium" type="gradient" icon={<IconPlus/>} onClick={() => setGroup({id: 0, name: "", order: 0})}>
            Add group
          </Button>
        </>}
      >
        {groupErrorNode}
        <Table
          columns={[
            {
              label: "Type",
              noWrap: true,
              renderer: (obj: TTableData) => obj.type.toUpperCaseFirst(),
            },
            {
              label: "Name",
              noWrap: true,
              renderer: (obj: TTableData) => {
                if (obj.type === "subgroup") {
                  return "---- " + obj.name;
                } else if (obj.type === "section") {
                  return "---- ---- " + obj.name;
                } else if (obj.type === "content") {
                  return "---- ---- ---- " + obj.name;
                }

                return obj.name;
              },
            },
            {
              label: "Date Created",
              noWrap: true,
              renderer: (obj: TTableData) => obj["created_at"] ? formatDateTime(obj["created_at"]) : "",
            },
            {
              align: "RIGHT",
              noWrap: true,
              renderer: (obj: TTableData) => {
                const actions = [];

                switch (true) {
                  case obj.type === "group":
                    const g = obj.obj as TTutorialGroup;
                    actions.push(
                      {icon: "DELETE", onClick: () => remove("group", g.id)},
                      {icon: "ADD", onClick: () => setSubgroup({id: 0, name: "", group_id: g.id})},
                      {icon: "EDIT", onClick: () => setGroup(g)},
                    );
                    break;
                  case obj.type === "subgroup":
                    const sg = obj.obj as TTutorialSubgroup;
                    actions.push(
                      {icon: "DELETE", onClick: () => remove("subgroup", sg.id)},
                      {icon: "ADD", onClick: () => setSection({id: 0, title: "", url: "", sub_group_id: sg.id})},
                      {icon: "EDIT", onClick: () => setSubgroup(sg)},
                    );
                    break;
                  case obj.type === "section":
                    const s = obj.obj as TTutorialSection;
                    actions.push(
                      {icon: "DELETE", onClick: () => remove("section", s.id)},
                      {icon: "ADD", onClick: () => navigate("/admin/tutorial/article/add")},
                      {icon: "EDIT", onClick: () => setSection(s)},
                    );
                    break;
                  case obj.type === "content":
                    const c = obj.obj as TTutorialArticle;
                    actions.push(
                      {icon: "DELETE", onClick: () => remove("content", c.id)},
                      {icon: "EDIT", onClick: () => navigate("/admin/tutorial/article/" + c.id)},
                    );
                    break;
                }

                return <TableActions actions={actions} />;
              },
            }
          ]}
          data={tableData}
        />
      </AdminLayout>
      {groupFormNode}
      {subgroupFormNode}
      {sectionFormNode}
    </React.Fragment>
  );
}

