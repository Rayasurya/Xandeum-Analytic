import { t } from 'i18next';
import { Loader2, RefreshCcw } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/spinner';
import { userHooks } from '@/hooks/user-hooks';
import { authenticationSession } from '@/lib/authentication-session';
import { copilotApi } from '@/lib/copilot-api';
import {
    AIxBlockProvider,
    AzureOpenAiProvider,
    CopilotProviderType,
    CopilotSettings,
    OpenAiProvider,
} from 'workflow-shared';
import AIxBlock from '@tonyshark/aixblock-sdk';

type ConfigureProviderDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  copilotSettings: CopilotSettings;
  refetch: () => void;
};

interface IAIxBlockModel {
  id: string | number;
  name: string;
}

export const ConfigureProviderDialog = ({
  open,
  onOpenChange,
  copilotSettings,
  refetch,
}: ConfigureProviderDialogProps) => {
  const user = userHooks.useCurrentUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openaiProvider = copilotSettings?.providers?.[
    CopilotProviderType.OPENAI
  ] as OpenAiProvider | undefined;

  const [selectedProvider, setSelectedProvider] = useState<CopilotProviderType>(
    CopilotProviderType.OPENAI,
  );
  const [aixblockModel, setAixblockModel] = useState<IAIxBlockModel[]>([]);
  const [loadingAIxBlockModel, setLoadingAIxBlockModel] = useState(false);

  const [formData, setFormData] = useState({
    baseUrl: openaiProvider?.baseUrl || 'https://api.openai.com',
    apiKey: openaiProvider?.apiKey || '',
    resourceName: '',
    deploymentName: '',
    model: '',
  });

  useEffect(() => {
    initAIxBlockModel();
  }, [formData.baseUrl, formData.apiKey]);

  const initAIxBlockModel = async () => {
    if (selectedProvider !== CopilotProviderType.AIXBLOCK || !formData.baseUrl || !formData.apiKey) {
      setAixblockModel([]);
      return;
    }
    setLoadingAIxBlockModel(true);
    try {
      const aixblockSdk = new AIxBlock({
          baseApi: formData.baseUrl,
          apiKey: formData.apiKey,
      });
      const models = await aixblockSdk.getSupportedModels({
        modelType: 'copilot'
      })
      setAixblockModel(models)
    } catch {
      setAixblockModel([])
    } finally {
      setLoadingAIxBlockModel(false)
    }
  }

  const handleProviderChange = (value: CopilotProviderType) => {
    setSelectedProvider(value);
    const azureProvider = copilotSettings?.providers?.[
      CopilotProviderType.AZURE_OPENAI
    ] as AzureOpenAiProvider | undefined;
    const openaiProvider = copilotSettings?.providers?.[
      CopilotProviderType.OPENAI
    ] as OpenAiProvider | undefined;
    const aixblockProvider = copilotSettings?.providers?.[
      CopilotProviderType.AIXBLOCK
    ] as AIxBlockProvider | undefined;

    if (value === CopilotProviderType.OPENAI) {
      setFormData({
        baseUrl: openaiProvider?.baseUrl || 'https://api.openai.com',
        apiKey: openaiProvider?.apiKey || '',
        resourceName: '',
        deploymentName: '',
        model: '',
      });
    } else if (value === CopilotProviderType.AIXBLOCK) {
      setFormData({
        baseUrl: aixblockProvider?.baseUrl || 'https://app.aixblock.io',
        apiKey: aixblockProvider?.apiKey || '',
        resourceName: '',
        deploymentName: '',
        model: aixblockProvider?.model || '',
      });
    } else {
      setFormData({
        baseUrl: '',
        apiKey: azureProvider?.apiKey || '',
        resourceName: azureProvider?.resourceName || '',
        deploymentName: azureProvider?.deploymentName || '',
        model: '',
      });
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const platformId = authenticationSession.getPlatformId();
      if (!platformId) return;

      const newSettings: CopilotSettings = {
        providers: {
          [selectedProvider]:
            selectedProvider === CopilotProviderType.OPENAI
              ? {
                  baseUrl: formData.baseUrl,
                  apiKey: formData.apiKey,
                } :
             selectedProvider === CopilotProviderType.AIXBLOCK ? {
              baseUrl: formData.baseUrl,
              apiKey: formData.apiKey,
              model: formData.model
            }: {
                  resourceName: formData.resourceName,
                  deploymentName: formData.deploymentName,
                  apiKey: formData.apiKey,
                },
        },
      };

      await copilotApi.upsert(
        {
          setting: newSettings,
        },
      );

      await refetch();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to configure provider:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-4">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-lg font-medium">
            {t('Configure AI Provider')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <RadioGroup
            value={selectedProvider}
            onValueChange={handleProviderChange}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={CopilotProviderType.OPENAI} id="openai" />
              <label
                htmlFor="openai"
                className="flex items-center gap-2 cursor-pointer text-sm"
              >
                <img
                  src="https://cdn.activepieces.com/pieces/openai.png"
                  alt="OpenAI"
                  className="w-4 h-4"
                />
                OpenAI
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value={CopilotProviderType.AIXBLOCK}
                id="aixblock"
              />
              <label
                htmlFor="aixblock"
                className="flex items-center gap-1 cursor-pointer text-sm"
              >
                <img
                  src="https://aixblock.io/assets/images/logo-img.svg"
                  alt="AIxBlock"
                  className="w-4 h-4"
                />
                AIxBlock
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value={CopilotProviderType.AZURE_OPENAI}
                id="azure"
              />
              <label
                htmlFor="azure"
                className="flex items-center gap-2 cursor-pointer text-sm"
              >
                <img
                  src="https://cdn.activepieces.com/pieces/azure-openai.png"
                  alt="Azure OpenAI"
                  className="w-4 h-4"
                />
                Azure OpenAI
              </label>
            </div>
          </RadioGroup>

          <div className="space-y-3">
            {selectedProvider === CopilotProviderType.OPENAI ? (
              <>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">{t('Base URL')}</label>
                  <Input
                    value={formData.baseUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, baseUrl: e.target.value })
                    }
                    placeholder="https://api.openai.com"
                    disabled={isSubmitting}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">{t('API Key')}</label>
                  <Input
                    type="password"
                    value={formData.apiKey}
                    onChange={(e) =>
                      setFormData({ ...formData, apiKey: e.target.value })
                    }
                    placeholder="sk-..."
                    disabled={isSubmitting}
                    className="h-9"
                  />
                </div>
              </>
            ) : (selectedProvider === CopilotProviderType.AIXBLOCK) ? (
              <>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">{t('Base URL')}</label>
                  <Input
                    value={formData.baseUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, baseUrl: e.target.value })
                    }
                    placeholder="https://api.openai.com"
                    disabled={isSubmitting}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium flex justify-between items-center">
                    {t('API Key')}
                    {user.data?.token && (
                      <div
                        className='cursor-pointer flex gap-2 items-center'
                        onClick={() => {
                          if (user.data?.token) {
                            setFormData({ ...formData, apiKey: user.data?.token })
                          }
                        }}
                      >
                        <RefreshCcw className="w-4 h-4" />
                        Auto fill
                      </div>
                    )}
                  </label>
                  <Input
                    type="text"
                    value={formData.apiKey}
                    onChange={(e) =>
                      setFormData({ ...formData, apiKey: e.target.value })
                    }
                    placeholder="Enter API key"
                    disabled={isSubmitting}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium flex gap-2 items-center">
                    {t('Select model')}
                    <RefreshCcw className="w-4 h-4 cursor-pointer" onClick={initAIxBlockModel} />
                  </label>
                  {loadingAIxBlockModel ? (
                    <LoadingSpinner />
                  ) : <Select
                          value={formData.model}
                          onValueChange={(value) => setFormData({ ...formData, model: value })}
                      >
                          <SelectTrigger>
                            <SelectValue/>
                          </SelectTrigger>
                          <SelectContent>
                              {aixblockModel?.map((model) => {
                                  return <SelectItem value={model.id as string}>{model.name}</SelectItem>;
                              })}
                          </SelectContent>
                      </Select>
                  }
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    {t('Resource Name')}
                  </label>
                  <Input
                    value={formData.resourceName}
                    onChange={(e) =>
                      setFormData({ ...formData, resourceName: e.target.value })
                    }
                    placeholder="my-resource"
                    disabled={isSubmitting}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    {t('Deployment Name')}
                  </label>
                  <Input
                    value={formData.deploymentName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        deploymentName: e.target.value,
                      })
                    }
                    placeholder="gpt-4"
                    disabled={isSubmitting}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">{t('API Key')}</label>
                  <Input
                    type="password"
                    value={formData.apiKey}
                    onChange={(e) =>
                      setFormData({ ...formData, apiKey: e.target.value })
                    }
                    placeholder="Enter API key"
                    disabled={isSubmitting}
                    className="h-9"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="h-9 px-4 text-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                  {t('Saving')}
                </>
              ) : (
                t('Save')
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
