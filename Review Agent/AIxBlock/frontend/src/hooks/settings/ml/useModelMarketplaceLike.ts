import { useMemo, useState, useCallback } from "react";
import { TApiCallResult, useApi } from "@/providers/ApiProvider";
import { validateModelMarketplaceLikeModel } from "@/models/modelMarketplaceLike";
import useDebouncedEffect from "../../useDebouncedEffect";


export const useModelMarketplaceLike = (model_id: number) => {
  const [error, setError] = useState<string | null>(null);
  const [isLike, setIsLike] = useState<boolean>();
  const [likeCount, setLikeCount] = useState<number>();
  const api = useApi();
  const [loading, setLoading] = useState<boolean>(false);

  const likeModel = useCallback(() => {
    setLoading(true);
    const response = api.call("likeModel", {
      params: {
        model_id: model_id.toString()
      }
    });

    response.promise
      .then(async (res) => {

        if (response.controller.signal.aborted) return;
        const data = await res.json();
        const vr = validateModelMarketplaceLikeModel(data);

        if (vr.isValid) {
          setIsLike(vr.data.is_like);
          setLikeCount(vr.data.like_count);
        } else {
          setError("Invalid like model response receive the server. Please try again!");

          if (window.APP_SETTINGS.debug) {
            console.error(vr);
          }
        }
      })
      .catch((e) => {
        if (response.controller.signal.aborted) {
          return;
        }

        let msg = "An error occurred while loading like model.";

        if (e instanceof Error) {
          msg += " Error: " + e.message + ".";
        }

        setError(msg + " Please try again!");

        if (window.APP_SETTINGS.debug) {
          console.error(e);
        }
      })
      .finally(() => {
        if (response.controller.signal.aborted) return;
        setLoading(false);
      });

    return response;
  }, [api, model_id]);

  useDebouncedEffect(() => {
    setLoading(true);
    const response: TApiCallResult = api.call("getLikeModel", {
      params: {
        model_id: model_id.toString()
      }
    });

    response.promise
      .then(async (res) => {
        if (response.controller.signal.aborted) {
          return;
        }

        const data = await res.json();
        const vr = validateModelMarketplaceLikeModel(data);

        if (vr.isValid) {
          setIsLike(vr.data.is_like);
          setLikeCount(vr.data.like_count);
        } else {
          setError("Invalid like model response receive the server. Please try again!");

          if (window.APP_SETTINGS.debug) {
            console.error(vr);
          }
        }
      })
      .catch((e) => {
        if (response.controller.signal.aborted) {
          return;
        }

        let msg = "An error occurred while loading like model.";

        if (e instanceof Error) {
          msg += " Error: " + e.message + ".";
        }

        setError(msg + " Please try again!");

        if (window.APP_SETTINGS.debug) {
          console.error(e);
        }
      })
      .finally(() => {
        if (response.controller.signal.aborted) return;
        setLoading(false);
      });
  }, [api, model_id]);

  return useMemo(() => {
    return {
      isLike,
      likeCount,
      likeModel,
      error,
      loading,
    };
  }, [isLike, likeCount, likeModel, error, loading]);
};
