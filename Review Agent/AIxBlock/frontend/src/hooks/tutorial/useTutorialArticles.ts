import React from "react";
import {TApiCallResult, useApi} from "@/providers/ApiProvider";
import {TTutorialArticle} from "@/models/tutorialArticle";

export type TProps = {}

export type TUseTutorialArticlesHook = {
  saving: boolean,
  error: string | null,
  save: (obj: Partial<TTutorialArticle>) => TApiCallResult,
}

export default function useTutorialArticles(): TUseTutorialArticlesHook {
  const [saving, setSaving] = React.useState<boolean>(false);
  const [error, setError] = React.useState<null | string>(null);
  const api = useApi();

  const save = React.useCallback((obj: Partial<TTutorialArticle>) => {
    setSaving(true);

    const ar = api.call(obj.id && obj.id > 0 ? "updateTutorialContent" : "createTutorialContent", {
      body: obj,
      params: obj?.id && obj?.id > 0 ? {id: obj.id?.toString()} : {},
    });

    ar.promise
      .catch(e => {
        if (ar.controller.signal.aborted) {
          return;
        }

        let msg = "An error occurred while saving tutorial article.";

        if (e instanceof Error) {
          msg += " Error: " + e.message + ".";
        }

        setError(msg + " Please try again!");

        if (window.APP_SETTINGS.debug) {
          console.error(e);
        }
      })
      .finally(() => {
        if (ar.controller.signal.aborted) {
          return;
        }

        setSaving(false);
      });

    return ar;
  }, [api]);

  return React.useMemo(() => {
    return {
      saving,
      error,
      save,
    }
  }, [
    saving,
    error,
    save,
  ]);
}
