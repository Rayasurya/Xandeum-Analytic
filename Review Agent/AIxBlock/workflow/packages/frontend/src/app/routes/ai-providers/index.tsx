import { useMutation, useQuery } from '@tanstack/react-query';
import { t } from 'i18next';

import { Skeleton } from '@/components/ui/skeleton';
import { TableTitle } from '@/components/ui/table-title';
import { INTERNAL_ERROR_TOAST, toast } from '@/components/ui/use-toast';
import { aiProviderApi } from '@/features/platform-admin-panel/lib/ai-provider-api';
import { userHooks } from '@/hooks/user-hooks';
import { AI_PROVIDERS } from 'workflow-blocks-common';
import { CopilotSetup } from '../platform/setup/ai/copilot';
import { AIProviderCard } from '../platform/setup/ai/universal-pieces/ai-provider-card';
import { DataTable } from '@/components/ui/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AiProviderConfig, isNil } from 'workflow-shared';
import clsx from 'clsx';
import { UpsertAIProviderDialog } from '../platform/setup/ai/universal-pieces/upsert-provider-dialog';
import { Button } from '@/components/ui/button';
import { Pencil, Trash } from 'lucide-react';
import { platformHooks } from '@/hooks/platform-hooks';
import { projectHooks } from '@/hooks/project-hooks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';

export enum AiProviderTabs {
  AI_PROVIDER = 'AiProvider',
  COPILOT = 'Copilot',
}

export default function AIProvidersProjectPage() {
  const {
    data: providers,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ['ai-providers'],
    queryFn: () => aiProviderApi.list(),
  });
  const { data: currentUser } = userHooks.useCurrentUser();
  const [activeTab, setActiveTab] = useState(AiProviderTabs.AI_PROVIDER);

  const { mutate: deleteProvider, isPending: isDeleting } = useMutation({
    mutationFn: (provider: string) => aiProviderApi.delete(provider),
    onSuccess: () => {
      refetch();
    },
    onError: () => {
      toast(INTERNAL_ERROR_TOAST);
    },
  });
  const { platform } = platformHooks.useCurrentPlatform();
  const { project } = projectHooks.useCurrentProject();

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="flex flex-col gap-4">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AiProviderTabs)} className="w-full">
          <TabsList variant="outline">
            <TabsTrigger value={AiProviderTabs.AI_PROVIDER} variant="outline">
              {t('AI Providers')}
            </TabsTrigger>
            <TabsTrigger value={AiProviderTabs.COPILOT} variant="outline">
              {t('Copilot')}
            </TabsTrigger>
          </TabsList>
          <TabsContent value={AiProviderTabs.AI_PROVIDER}>
            {/* <div>
              <div className="flex justify-between flex-row w-full">
                <TableTitle description={t('Set provider credentials that will be used by universal AI blocks, i.e Text AI.')}>
                  {t('AI Providers')}
                </TableTitle>
              </div>
            </div> */}
            {isLoading || isDeleting ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <>
                <DataTable
                  page={{ data: AI_PROVIDERS.map((provider) => ({ ...provider, id: provider.value })), next: null, previous: null }}
                  isLoading={false}
                  hidePagination={true}
                  columns={[
                    {
                      accessorKey: 'providerName',
                      header: ({ column }) => <DataTableColumnHeader column={column} title={t('Name')} />,
                      cell: ({ row }: any) => {
                        const providerMetadata = row.original;
                        return (
                          <div className="flex gap-2 items-center">
                            <div className="flex flex-col gap-2 text-center mr-2">
                              <img src={providerMetadata.logoUrl} alt="icon" width={32} height={32} />
                            </div>
                            <div className="flex flex-grow flex-col">
                              <div className="text-lg">{providerMetadata.label}</div>
                              <div className="text-sm text-muted-foreground">
                                {t('Configure credentials for {providerName} AI provider.', {
                                  providerName: providerMetadata.label,
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      },
                    },
                    {
                      accessorKey: 'providerStatus',
                      header: ({ column }) => <DataTableColumnHeader column={column} title={t('Status')} />,
                      cell: ({ row }: any) => {
                        const providerMetadata = row.original;
                        const provider = providers?.data.find((c) => c.provider === providerMetadata.value);
                        const isEnabled = !isNil(provider?.config);
                        return (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span
                                className={clsx(
                                  'text-xs px-2 py-1 rounded-sm flex-shrink-0 cursor-help',
                                  isEnabled ? 'bg-[rgb(229,239,231)] text-[rgb(40,129,62)]' : 'bg-[rgb(251,226,227)] text-[rgb(221,17,27)]'
                                )}
                              >
                                {isEnabled ? t('Enabled') : t('Disabled')}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>{isEnabled ? t('This AI provider is enabled') : t('Enable this AI provider to use it')}</TooltipContent>
                          </Tooltip>
                        );
                      },
                    },
                    {
                      accessorKey: 'actions',
                      header: ({ column }) => <DataTableColumnHeader column={column} title={t('Actions')} />,
                      cell: ({ row }: any) => {
                        const providerMetadata = row.original;
                        const provider: any = providers?.data.find((c) => c.provider === providerMetadata.value);

                        const config: Omit<AiProviderConfig, 'id'> & { id?: string } = provider ?? {
                          baseUrl: providerMetadata?.baseUrl ?? providerMetadata.defaultBaseUrl ?? '',
                          provider: providerMetadata.value,
                          config: {
                            defaultHeaders: {},
                          },
                          created: new Date().toISOString(),
                          updated: new Date().toISOString(),
                          platformId: platform.id,
                          projectId: project.id,
                        };
                        return (
                          <div className="flex flex-row justify-center items-center gap-1">
                            <UpsertAIProviderDialog provider={config} providerMetadata={providerMetadata} onSave={() => refetch()}>
                              <Button variant={provider ? 'ghost' : 'basic'} size={'sm'}>
                                {provider ? <Pencil className="size-4" /> : t('Enable')}
                              </Button>
                            </UpsertAIProviderDialog>
                            {provider && (
                              <div className="gap-2 flex">
                                <Button
                                  variant={'ghost'}
                                  size={'sm'}
                                  onClick={() => deleteProvider(providerMetadata.value)}
                                  loading={isDeleting}
                                  disabled={isDeleting}
                                >
                                  <Trash className="size-4 text-destructive" />
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      },
                    },
                  ]}
                  emptyStateTextTitle={''}
                  emptyStateTextDescription={''}
                  emptyStateIcon={undefined}
                />
              </>
            )}
          </TabsContent>
          <TabsContent value={AiProviderTabs.COPILOT}>
            <div>
              {/* <div className="mb-4 flex">
                <div className="flex justify-between flex-row w-full">
                  <div className="flex flex-col gap-2">
                    <TableTitle>{t('Copilot')}</TableTitle>
                  </div>
                </div>
              </div> */}
              <CopilotSetup />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
