import React, { useEffect, useState } from "react";
import Button from "@/components/Button/Button";
import InputBase from "@/components/InputBase/InputBase";
import { useApi } from "@/providers/ApiProvider";
import './Index.scss'
import { useUserLayout } from "@/layouts/UserLayout";
import Select from "@/components/Select/Select";

const ModifyDocument = () => {
  const api = useApi();
  const [dataTutorial, setDataTutorial] = useState<any>({
    name: undefined,
    order: 0,
    title: undefined,
  });
  const [button, setButton] = useState<string>('group');
  const [documents, setDocuments] = useState<any[]>([]);
  const [subgroups, setSubGroups] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const userLayout = useUserLayout();

  const loadDocuments = React.useCallback(async (search?: string) => {
    const res = await api.call('listDocuments', {
      query: new URLSearchParams({
        keyword: search || '',
      }),
    }).promise;
    const docs = await res.json();
    setDocuments(docs);
    const secs: any = [];
    const subs: any = [];
    docs.map((d: any) => {
      d.sub_groups.map((sg: any) => {
        subs.push({
          label: sg.name,
          value: sg.id
        });
        sg.section_contents.map((sec: any) => {
          secs.push({
            label: sec.title,
            value: sec.id
          });
          return sec;
        })
        return sg;
      })
      return d;
    })
    setSubGroups([{
      label: '',
      options: subs,
    }]);
    setSections([{
      label: '',
      options: secs,
    }]);
    return;
  }, [api]);

  useEffect(() => {
    userLayout.setBreadcrumbs([{ label: "Modify Document" }]);
    loadDocuments();
    return () => {
      userLayout.clearBreadcrumbs();
    }
  }, [loadDocuments, userLayout]);

  const onChangeField = (field: string, val: string) => {
    const update: any = {
      ...dataTutorial,
      [field]: val,
    };
    update && setDataTutorial(update);
  };

  const onClickBtn = (btn: string) => {
    setDataTutorial({});
    setButton(btn);
  };

  const CreateGroupFunction = async () => {
    api.call('createGroup', {
      body: dataTutorial,
    });
    loadDocuments();
  };

  const CreateSubGroupFunction = () => {
    api.call('createSubGroup', {
      body: dataTutorial,
    });
    loadDocuments();
  };

  const CreateSectionFunction = () => {
    api.call('createSectionGroup', {
      body: dataTutorial,
    });
    loadDocuments();
  };

  const CreateContentFunction = () => {
    api.call('createContentGroup', {
      body: dataTutorial,
    });
    loadDocuments();
  };
  
  return (
    <div className="c-add-compute-container">
      <div className="btn-flex" >
        <Button onClick={() => onClickBtn('group')}>Group</Button>
        <Button onClick={() => onClickBtn('sub-group')}>Sub Group</Button>
        <Button onClick={() => onClickBtn('section')}>Section</Button>
        <Button onClick={() => onClickBtn('content')}>Content</Button>
      </div>
        { button === 'group' && 
          <form>
            <InputBase
              label="Name"
              placeholder="Type something"
              allowClear={false}
              value={dataTutorial.name}
              onChange={(val) => onChangeField('name', val.target.value)}
            />
            {/* <InputBase
              label="Order"
              placeholder="Type something"
              allowClear={false}
              value={dataTutorial.order}
              onChange={(val) => onChangeField('order', val.target.value)}
            /> */}
            <Button onClick={CreateGroupFunction}>Add</Button>
          </form>
        }
        { button === 'sub-group' && 
          <form>
            <InputBase
              label="Name"
              placeholder="Type something"
              allowClear={false}
              value={dataTutorial.name}
              onChange={(val) => onChangeField('name', val.target.value)}
            />
            <Select
              className="c-org-form__select"
              label="Group"
              data={[{
                label: '',
                options: documents.map((d) => {
                  return {
                    label: d.name,
                    value: d.id
                  };
                })
              }]}
              onChange={(val) => onChangeField("group_id", val.value)}
            />
            <Button onClick={CreateSubGroupFunction}>Add</Button>
          </form>
        }
        { button === 'section' && 
          <form>
            <InputBase
              label="Title"
              placeholder="Type something"
              allowClear={false}
              value={dataTutorial.name}
              onChange={(val) => onChangeField('title', val.target.value)}
            />
            <Select
              className="c-org-form__select"
              label="Sub Group"
              data={subgroups}
              onChange={(val) => onChangeField("sub_group_id", val.value)}
            />
            <Button onClick={CreateSectionFunction}>Add</Button>
          </form>
        }
        { button === 'content' && 
          <form>
            <InputBase
              label="Title"
              placeholder="Type something"
              allowClear={false}
              value={dataTutorial.name}
              onChange={(val) => onChangeField('title', val.target.value)}
            />
            <InputBase
              label="Url"
              placeholder="Type something"
              allowClear={false}
              value={dataTutorial.url}
              onChange={(val) => onChangeField('url', val.target.value)}
            />
            <Select
              className="c-org-form__select"
              label="Section"
              data={sections}
              onChange={(val) => onChangeField("section_id", val.value)}
            />
            <label>Content</label>
            <textarea
              className="c-account-setting__access-token-input textarea"
              rows={4}
              onChange={(val) => onChangeField('content', val.target.value)}
            ></textarea>
            <Button onClick={CreateContentFunction}>Add</Button>
          </form>
        }
    </div>
  )
};

export default ModifyDocument;
