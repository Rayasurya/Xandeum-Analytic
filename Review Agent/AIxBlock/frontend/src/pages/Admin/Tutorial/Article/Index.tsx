import Button from "@/components/Button/Button";
import React from "react";
import AdminLayout from "../../Layout";
import {IconArrowLeft, IconSave} from "@/assets/icons/Index";
import {useNavigate, useParams} from "react-router-dom";
import {createAlert} from "@/utils/createAlert";
import Select, {DataSelect, SelectOption} from "@/components/Select/Select";
import InputBase from "@/components/InputBase/InputBase";
import {TTutorialArticle} from "@/models/tutorialArticle";
import useTutorialArticles from "@/hooks/tutorial/useTutorialArticles";
import {usePromiseLoader} from "@/providers/LoaderProvider";
import HtmlEditor from "@/components/HtmlEditor/HtmlEditor";
import useTutorialGroups from "@/hooks/tutorial/useTutorialGroups";

type TArticleContent = Pick<TTutorialArticle, "id" | "title" | "content" | "section_id">

const emptyArticle: TArticleContent = {
  id: 0,
  title: "",
  content: "",
  section_id: -1,
}

export default function TutorialArticle() {
  const {error: groupsError, list: groups, refresh: refreshGroups} = useTutorialGroups();
  const {save: saveArticle} = useTutorialArticles();
  const {id} = useParams();
  const isAdd = id === "add";
  const [form, setForm] = React.useState<TArticleContent | null>(null);
  const {addPromise} = usePromiseLoader();
  const [errors, setErrors] = React.useState<{[k:string]: string[]}>({});
  const [saveError, setSaveError] = React.useState<string>("");
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!groups) {
      return;
    }

    if (id === "add") {
      setForm(emptyArticle);
      return;
    }

    groups.forEach(g => {
      g.sub_groups.forEach(sg => {
        sg.section_contents.forEach(s => {
          if (s.tutorial_content && s.tutorial_content.id.toString() === id) {
            setForm(s.tutorial_content);
          }
        })
      });
    })
  }, [groups, id]);

  const geoupsErrorNode = React.useMemo(() => {
    return createAlert(groupsError, refreshGroups, false, { marginBottom: 32 })
  }, [groupsError, refreshGroups]);

  const sectionOptions = React.useMemo((): DataSelect[] => {
    if (!groups) {
      return [];
    }

    const list: SelectOption[] = [];

    groups.forEach(g => {
      g.sub_groups.forEach(sg => {
        sg.section_contents.forEach(s => {
          list.push({label: g.name + " > " + sg.name + " > " + s.title, value: s.id.toString()});
        })
      });
    });

    return [{
      label: "",
      options: list,
    }]
  }, [groups]);

  const selectedOption = React.useMemo((): SelectOption => {
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];

      for (let j = 0; j < group.sub_groups.length; j++) {
        const subgroup = group.sub_groups[j];

        for (let k = 0; k < subgroup.section_contents.length; k++) {
          const section = subgroup.section_contents[k];

          if (section.id === form?.section_id) {
            return {label: group.name + " > " + subgroup.name + " > " + section.title, value: section.id.toString()}
          }
        }
      }
    }

    return {label: "-- Select section --", value: "0"};
  }, [form?.section_id, groups]);

  const save = React.useCallback(() => {
    if (!form) {
      return;
    }

    setErrors({});
    setSaveError("");

    const ar = saveArticle(form);
    addPromise(ar.promise, "Saving article...");

    ar.promise
      .then(async r => {
        if (r.ok) {
          navigate("/admin/tutorial");
          return;
        }

        const res = await r.json();

        if (Object.hasOwn(res, "validation_errors")) {
          setErrors(res["validation_errors"]);
        } else if (Object.hasOwn(res, "detail")) {
          setSaveError(res["detail"]);
        }
      });
  }, [form, navigate, saveArticle, addPromise]);

  const saveErrorNode = React.useMemo(() => {
    return createAlert(saveError);
  }, [saveError]);

  return (
    <React.Fragment>
      <AdminLayout
        title={isAdd ? "New Article" : "Update Article"}
        actions={<>
          <Button size="medium" type="hot" icon={<IconArrowLeft/>} onClick={save}>
            Cancel
          </Button>
          <Button size="medium" type="gradient" icon={<IconSave/>} onClick={save}>
            Save
          </Button>
        </>}
      >
        {geoupsErrorNode}
        {saveErrorNode}
        <div className="page-admin-tutorial-article-form">
          <InputBase
            label="Title"
            value={form?.title ?? ""}
            error={Object.hasOwn(errors, "title") ? errors["title"][0] : null}
            onChange={e => setForm(f => ({...f ?? emptyArticle, title: e.target.value}))}
          />
          <Select
            data={sectionOptions}
            label="Section"
            disabled={!!groupsError}
            defaultValue={selectedOption}
            onChange={o => setForm(f => ({...f ?? emptyArticle, section_id: parseInt(o.value)}))}
          />
          {form && (
            <HtmlEditor value={form?.content ?? ""} onChange={v => setForm(f => ({...f ?? emptyArticle, content: v}))} />
          )}
        </div>
      </AdminLayout>
    </React.Fragment>
);
}
