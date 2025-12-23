import { useMutation, useQuery } from '@tanstack/react-query';
import { t } from 'i18next';
import { Bot, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { authenticationSession } from '@/lib/authentication-session';
import { isNil } from 'workflow-shared';

import { copilotApi } from '@/lib/copilot-api';
import { ConfigureProviderDialog } from './configure-provider-dialog';
import { DataTable } from '@/components/ui/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import clsx from 'clsx';

const CopilotSetup = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    data: copilot,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ['copilot'],
    queryFn: () => copilotApi.get(),
  });

  const { mutate: deleteMutation, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      const platformId = authenticationSession.getPlatformId();
      if (!platformId) return null;
      return await copilotApi.delete();
    },
    onSuccess: (response) => {
      if (response) {
        refetch();
      }
    },
  });

  const getConfiguredProvider = () => {
    if (isNil(copilot?.platformId) || isNil(copilot?.projectId)) return false;
    return true;
  };

  const configuredProvider = getConfiguredProvider();

  const handleConfigure = () => {
    setDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <DataTable
        page={{ data: [{ id: 'copilot' }], next: null, previous: null }}
        isLoading={false}
        hidePagination={true}
        columns={[
          {
            accessorKey: 'providerName',
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('Name')} />,
            cell: ({ row }: any) => {
              return (
                <div className="flex items-center">
                  <div className="flex flex-col gap-2 text-center mr-2">
                    <Bot className="size-8" />
                  </div>
                  <div className="flex flex-grow flex-col">
                    <div className="text-lg">{t('Platform Copilot')}</div>
                    <div className="text-sm text-muted-foreground">
                      {configuredProvider
                        ? t('Copilot is configured and ready to help you build flows faster using AI.')
                        : t('Configure AIxBlock Copilot to help you build flows faster using AI.')}
                    </div>
                  </div>
                </div>
              );
            },
          },
          {
            accessorKey: 'status',
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('Status')} />,
            cell: ({ row }: any) => {
              return (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className={clsx(
                        'text-xs px-2 py-1 rounded-sm flex-shrink-0 cursor-help',
                        configuredProvider ? 'bg-[rgb(229,239,231)] text-[rgb(40,129,62)]' : 'bg-[rgb(251,226,227)] text-[rgb(221,17,27)]'
                      )}
                    >
                      {configuredProvider ? t('Enabled') : t('Disabled')}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{configuredProvider ? t('This AI provider is enabled') : t('Enable this AI provider to use it')}</TooltipContent>
                </Tooltip>
              );
            },
          },
          {
            accessorKey: 'actions',
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('Actions')} />,
            cell: ({ row }: any) => {
              return (
                <div className="flex flex-row justify-center items-center gap-2">
                  <Button variant={configuredProvider ? 'ghost' : 'basic'} size={'sm'} disabled={isDeleting} onClick={handleConfigure}>
                    {configuredProvider ? <Pencil className="size-4" /> : t('Enable')}
                  </Button>
                  {configuredProvider && (
                    <Button
                      variant="ghost"
                      size={'sm'}
                      onClick={() => {
                        deleteMutation();
                      }}
                      loading={isDeleting}
                      className="text-destructive hover:text-destructive/90 hover:bg-destructive/10 flex items-center gap-2"
                    >
                      <Trash2 className="size-4" />
                      {t('Remove')}
                    </Button>
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

      {copilot?.setting && (
        <ConfigureProviderDialog open={dialogOpen} onOpenChange={setDialogOpen} copilotSettings={copilot.setting} refetch={refetch} />
      )}
    </div>
  );
};

CopilotSetup.displayName = 'CopilotSetup';
export { CopilotSetup };
