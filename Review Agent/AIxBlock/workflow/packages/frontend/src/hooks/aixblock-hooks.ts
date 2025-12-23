import axios from 'axios';
import { t } from 'i18next';
import { get } from 'lodash';
import { useCallback, useEffect, useState } from 'react';

import { toast } from '@/components/ui/use-toast';

export type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
  data?: any;
};

export type DataSelect = {
  label?: string | undefined;
  options: SelectOption[];
  //apply one level group
  value?: string;
  data?: any | undefined;
};

export type TMarketplaceGpuModel = {
  id: number;
  gpu_name?: string;
  power_consumption?: string;
  memory_usage?: string;
  gpu_index: number;
  gpu_id?: string;
  branch_name?: string;
  Kind: string;
  Value: string;
};
export type TMarketplaceGpuListModel = {
  compute_id: number;
  compute_gpus: TMarketplaceGpuModel[];
  compute_name: string;
  compute_cpu: {
    name?: string;
    cpu?: string;
    ram?: string;
    storage?: string;
    diskType?: string;
    os?: string;
    serial_number?: string;
    ip?: string;
  };
  is_scale: boolean;
  is_available?: boolean;
}[];

// NOTE: Because workflow will embed in aixblock's platform
// and for some case we need to use API from axb's platform
// This hook will get platformAPI from ancestor origin from window.location
// and it will and only work when using workflow inside aixblock's platform
export const useAIxBlock = () => {
  const [platformAPI, setPlatformAPI] = useState('');
  const [isFetchCpu, setIsFetchCpu] = useState(false);
  useEffect(() => {
    initAPI();
  }, []);

  const initAPI = () => {
    const platformAPI = window.location.ancestorOrigins?.[0];
    setPlatformAPI(platformAPI);
  };

  const getLatestToken = useCallback(async () => {
    if (!platformAPI) return true;
    try {
      const resp = await axios.get(`${platformAPI}/api/current-user/token`, {
        withCredentials: true,
      });
      return resp.data?.token;
    } catch (error) {
      console.error(error);
    }
  }, [platformAPI]);

  const isValidToken = async (headers: Record<string, string>) => {
    try {
      const resp = await axios.get(`${platformAPI}/api/current-user/whoami`, {
        headers,
      });
      return resp.status === 200;
    } catch (error) {
      console.error(error);
    }
    return false;
  };

  const checkEmbed = () => {
    if (!platformAPI) {
      toast({
        variant: 'destructive',
        title: t('Error'),
        description: t(
          `You can only use this function while using workflow inside AIxBlock's platform`,
        ),
        duration: 3000,
      });
      return false;
    }
    return true;
  };

  const getCpus = useCallback(
    async (projectId: string): Promise<TMarketplaceGpuListModel> => {
      if (!platformAPI) return [];
      try {
        setIsFetchCpu(true);
        const latestToken = await getLatestToken();
        if (latestToken) {
          const getGpuResult = await axios.get<TMarketplaceGpuListModel>(
            `${platformAPI}/api/compute_marketplace/gpus`,
            {
              headers: {
                Authorization: `Token ${latestToken}`,
              },
              params: {
                project_id: projectId,
              },
            },
          );
          return get(getGpuResult, 'data', []);
        }
        return [];
      } catch (error) {
        return [];
      } finally {
        setIsFetchCpu(false);
      }
    },
    [setIsFetchCpu, getLatestToken, platformAPI],
  );

  return { getLatestToken, getCpus, isFetchCpu, isValidToken, checkEmbed };
};
