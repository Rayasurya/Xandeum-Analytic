import { useMutation, useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { t } from 'i18next';
import { AppWindow, Calendar, CheckIcon, Globe, Tag, Trash, User } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { NewConnectionDialog } from '@/app/connections/new-connection-dialog';
import { ReconnectButtonDialog } from '@/app/connections/reconnect-button-dialog';
import { ConfirmationDeleteDialog } from '@/components/delete-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CopyTextTooltip } from '@/components/ui/copy-text-tooltip';
import { BulkAction, CURSOR_QUERY_PARAM, DataTable, LIMIT_QUERY_PARAM, PAGE_QUERY_PARAM, RowDataWithActions } from '@/components/ui/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import { PermissionNeededTooltip } from '@/components/ui/permission-needed-tooltip';
import { StatusIconWithText } from '@/components/ui/status-icon-with-text';
import { TableTitle } from '@/components/ui/table-title';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';
import { UserFullName } from '@/components/ui/user-fullname';
import { RenameConnectionDialog } from '@/features/connections/components/rename-connection-dialog';
import { appConnectionsApi } from '@/features/connections/lib/app-connections-api';
import { appConnectionsHooks } from '@/features/connections/lib/app-connections-hooks';
import { appConnectionUtils } from '@/features/connections/lib/app-connections-utils';
import BlockIconWithBlockName from '@/features/pieces/components/block-icon-from-name';
import { piecesHooks } from '@/features/pieces/lib/blocks-hook';
import { useAuthorization } from '@/hooks/authorization-hooks';
import { userHooks } from '@/hooks/user-hooks';
import { authenticationSession } from '@/lib/authentication-session';
import { cn, formatUtils } from '@/lib/utils';
import { AppConnectionScope, AppConnectionStatus, AppConnectionWithoutSensitiveData, Permission, PlatformRole } from 'workflow-shared';
import { Card, CardContent } from '@/components/ui/card';
function AppConnectionsPage() {
  const [refresh, setRefresh] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Array<AppConnectionWithoutSensitiveData>>([]);
  const { toast } = useToast();
  const { checkAccess } = useAuthorization();
  const userPlatformRole = userHooks.getCurrentUserPlatformRole();
  const location = useLocation();
  const { pieces } = piecesHooks.usePieces({});
  const pieceOptions = (pieces ?? []).map((piece) => ({
    label: piece.displayName,
    value: piece.name,
  }));
  const projectId = authenticationSession.getProjectId()!;
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['appConnections', location.search, projectId],
    queryFn: () => {
      const searchParams = new URLSearchParams(location.search);
      const page = searchParams.get(PAGE_QUERY_PARAM) ? parseInt(searchParams.get(PAGE_QUERY_PARAM)!) : 1;
      const limit = searchParams.get(LIMIT_QUERY_PARAM) ? parseInt(searchParams.get(LIMIT_QUERY_PARAM)!) : 10;
      const status = (searchParams.getAll('status') as AppConnectionStatus[]) ?? [];
      const blockName = searchParams.get('blockName') ?? undefined;
      const displayName = searchParams.get('displayName') ?? undefined;
      return appConnectionsApi.v2.list({
        projectId,
        limit,
        page,
        status,
        blockName,
        displayName,
      });
    },
  });

  const filteredData = useMemo(() => {
    if (!data?.data) return undefined;
    const searchParams = new URLSearchParams(location.search);
    const ownerEmails = searchParams.getAll('owner');

    if (ownerEmails.length === 0) return data;

    return {
      data: data.data.filter((conn) => conn.owner && ownerEmails.includes(conn.owner.email)),
      next: data.next,
      previous: data.previous,
    };
  }, [data, location.search]);

  const userHasPermissionToWriteAppConnection = checkAccess(Permission.WRITE_APP_CONNECTION);

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => appConnectionsApi.delete(id)));
    },
    onSuccess: () => {
      refetch();
    },
    onError: () => {
      toast({
        title: t('Error deleting connections'),
        variant: 'destructive',
      });
    },
  });

  const { data: owners } = appConnectionsHooks.useConnectionsOwners();
  const ownersOptions = owners?.map((owner) => ({
    label: `${owner.firstName} ${owner.lastName} (${owner.email})`,
    value: owner.email,
  }));
  const filters = [
    {
      type: 'select',
      title: t('Status'),
      accessorKey: 'status',
      options: Object.values(AppConnectionStatus).map((status) => {
        return {
          label: formatUtils.convertEnumToHumanReadable(status),
          value: status,
        };
      }),
      icon: CheckIcon,
    } as const,
    {
      type: 'select',
      title: t('Blocks'),
      accessorKey: 'blockName',
      icon: AppWindow,
      options: pieceOptions,
    } as const,
    {
      type: 'input',
      title: t('Display Name'),
      accessorKey: 'displayName',
      icon: Tag,
      options: [],
    } as const,
    {
      type: 'select',
      title: t('Owner'),
      accessorKey: 'owner',
      icon: User,
      options: ownersOptions ?? [],
    } as const,
  ];

  const columns: ColumnDef<RowDataWithActions<AppConnectionWithoutSensitiveData>, unknown>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected()}
          onCheckedChange={(value) => {
            const isChecked = !!value;
            table.toggleAllPageRowsSelected(isChecked);

            if (isChecked) {
              const allRows = table
                .getRowModel()
                .rows.map((row) => row.original)
                .filter((row) => row.scope !== AppConnectionScope.PLATFORM);

              const newSelectedRows = [...allRows, ...selectedRows];

              const uniqueRows = Array.from(new Map(newSelectedRows.map((item) => [item.id, item])).values());

              setSelectedRows(uniqueRows);
            } else {
              const filteredRows = selectedRows.filter((row) => {
                return !table.getRowModel().rows.some((r) => r.original.id === row.id);
              });
              setSelectedRows(filteredRows);
            }
          }}
        />
      ),
      cell: ({ row }) => {
        const isPlatformConnection = row.original.scope === AppConnectionScope.PLATFORM;
        const isChecked = selectedRows.some((selectedRow) => selectedRow.id === row.original.id);
        return (
          <Checkbox
            checked={isChecked}
            disabled={isPlatformConnection}
            onCheckedChange={(value) => {
              const isChecked = !!value;
              let newSelectedRows = [...selectedRows];
              if (isChecked) {
                const exists = newSelectedRows.some((selectedRow) => selectedRow.id === row.original.id);
                if (!exists) {
                  newSelectedRows.push(row.original);
                }
              } else {
                newSelectedRows = newSelectedRows.filter((selectedRow) => selectedRow.id !== row.original.id);
              }
              setSelectedRows(newSelectedRows);
              row.toggleSelected(!!value);
            }}
          />
        );
      },
      accessorKey: 'select',
    },
    {
      accessorKey: 'blockName',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('App')} />,
      cell: ({ row }) => {
        return (
          <div className="text-left">
            <BlockIconWithBlockName blockName={row.original.blockName} />
          </div>
        );
      },
    },
    {
      accessorKey: 'displayName',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('Display Name')} />,
      cell: ({ row }) => {
        const isPlatformConnection = row.original.scope === 'PLATFORM';
        return (
          <div className="flex items-center gap-2">
            {isPlatformConnection && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Globe className="w-4 h-4" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('This connection is global and can be managed in the platform admin')}</p>
                </TooltipContent>
              </Tooltip>
            )}

            <CopyTextTooltip title={t('External ID')} text={row.original.externalId || ''}>
              <div className="text-left">{row.original.displayName}</div>
            </CopyTextTooltip>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('Status')} />,
      cell: ({ row }) => {
        const status = row.original.status;
        const { variant, icon: Icon } = appConnectionUtils.getStatusIcon(status);
        return (
          <div className="text-left">
            <StatusIconWithText icon={Icon} text={formatUtils.convertEnumToHumanReadable(status)} variant={variant} />
          </div>
        );
      },
    },
    {
      accessorKey: 'updated',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('Connected At')} />,
      cell: ({ row }) => {
        return <div className="text-left">{formatUtils.formatDate(new Date(row.original.updated))}</div>;
      },
    },
    {
      accessorKey: 'owner',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('Owner')} />,
      cell: ({ row }) => {
        return (
          <div className="text-left">
            {row.original.owner && (
              <UserFullName firstName={row.original.owner.firstName} lastName={row.original.owner.lastName} email={row.original.owner.email} />
            )}
            {!row.original.owner && <div className="text-left">-</div>}
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const isPlatformConnection = row.original.scope === 'PLATFORM';
        const userHasPermissionToRename = isPlatformConnection ? userPlatformRole === PlatformRole.ADMIN : userHasPermissionToWriteAppConnection;
        return (
          <div className="flex items-center gap-2 justify-end">
            <RenameConnectionDialog
              connectionId={row.original.id}
              currentName={row.original.displayName}
              onRename={() => {
                refetch();
              }}
              userHasPermissionToRename={userHasPermissionToRename}
            />
            <ReconnectButtonDialog
              hasPermission={userHasPermissionToRename}
              connection={row.original}
              onConnectionCreated={() => {
                refetch();
              }}
            />
          </div>
        );
      },
    },
  ];

  const bulkActions: BulkAction<AppConnectionWithoutSensitiveData>[] = useMemo(
    () => [
      {
        render: (_, resetSelection) => {
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <PermissionNeededTooltip hasPermission={userHasPermissionToWriteAppConnection}>
                <ConfirmationDeleteDialog
                  title={t('Confirm Deletion')}
                  message={t('Are you sure you want to delete the selected connections? This action cannot be undone.')}
                  entityName="connections"
                  mutationFn={async () => {
                    try {
                      await bulkDeleteMutation.mutateAsync(selectedRows.map((row) => row.id));
                      resetSelection();
                      setSelectedRows([]);
                    } catch (error) {
                      console.error('Error deleting connections:', error);
                    }
                  }}
                >
                  {selectedRows.length > 0 && (
                    <Button className="w-full mr-2" onClick={() => setIsDialogOpen(true)} size="sm" variant="destructive">
                      <Trash className="mr-2 w-4" />
                      {`${t('Delete')} (${selectedRows.length})`}
                    </Button>
                  )}
                </ConfirmationDeleteDialog>
              </PermissionNeededTooltip>
            </div>
          );
        },
      },
      {
        render: () => {
          return (
            <PermissionNeededTooltip hasPermission={userHasPermissionToWriteAppConnection}>
              <NewConnectionDialog
                isGlobalConnection={false}
                onConnectionCreated={() => {
                  setRefresh(refresh + 1);
                  refetch();
                }}
              >
                <Button variant="default" size="sm" disabled={!userHasPermissionToWriteAppConnection}>
                  {t('New Connection')}
                </Button>
              </NewConnectionDialog>
            </PermissionNeededTooltip>
          );
        },
      },
    ],
    [bulkDeleteMutation, userHasPermissionToWriteAppConnection, isDialogOpen, selectedRows]
  );
  return (
    <div className="flex-col w-full -mt-4">
      {/*<TableTitle description={t('Manage project connections to external systems.')}>{t('Connections')}</TableTitle>*/}
      <DataTable
        emptyStateTextTitle={t('No connections found')}
        emptyStateTextDescription={t('Come back later when you create a automation to manage your connections')}
        emptyStateIcon={<Globe className="size-14" />}
        columns={columns}
        page={filteredData}
        isLoading={isLoading}
        filters={filters}
        bulkActions={bulkActions}
        customContent={() => {
          if (!data?.data?.length)
            return (
              <div className="flex flex-col items-center justify-center gap-2">
                <Globe className="size-14" />
                <p className="text-lg font-semibold">{t('No connections found')}</p>
                <p className="text-sm text-muted-foreground ">{t('Come back later when you create a automation to manage your connections')}</p>
              </div>
            );
          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.data.map((connection) => {
                const isPlatformConnection = connection.scope === 'PLATFORM';
                const status = connection.status;
                const { variant, icon: Icon } = appConnectionUtils.getStatusIcon(status);
                const userHasPermissionToRename = isPlatformConnection
                  ? userPlatformRole === PlatformRole.ADMIN
                  : userHasPermissionToWriteAppConnection;
                return (
                  <Card
                    className={cn(
                      'overflow-hidden transition-all duration-200 relative border-border cursor-pointer h-full',
                      'hover:shadow-md hover:border-primary/30 hover:bg-accent/10'
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <BlockIconWithBlockName blockName={connection.blockName} />
                            {isPlatformConnection && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Globe className="w-4 h-4" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{t('This connection is global and can be managed in the platform admin')}</p>
                                </TooltipContent>
                              </Tooltip>
                            )}

                            <CopyTextTooltip title={t('External ID')} text={connection.externalId || ''}>
                              <div className="text-left">{connection.displayName}</div>
                            </CopyTextTooltip>
                          </div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center space-x-1 text-xs text-muted-foreground flex-shrink-0">
                                <Calendar className="h-3 w-3" />
                                <span className="whitespace-nowrap">{formatUtils.formatDate(new Date(connection.created))}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>{t('Connected At')}</TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="w-full mt-5 flex justify-between items-center">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                <StatusIconWithText icon={Icon} text={formatUtils.convertEnumToHumanReadable(status)} variant={variant} />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>{t('Status')}</TooltipContent>
                          </Tooltip>
                          <div className='flex gap-2 items-center'>
                            <div>
                              {connection.owner && (
                                <UserFullName
                                  firstName={connection.owner.firstName}
                                  lastName={connection.owner.lastName}
                                  email={connection.owner.email}
                                />
                              )}
                              {!connection.owner && <div className="text-left">-</div>}
                            </div>
                            <RenameConnectionDialog
                              connectionId={connection.id}
                              currentName={connection.displayName}
                              onRename={() => {
                                refetch();
                              }}
                              userHasPermissionToRename={userHasPermissionToRename}
                            />
                            <ReconnectButtonDialog
                              hasPermission={userHasPermissionToRename}
                              connection={connection}
                              onConnectionCreated={() => {
                                refetch();
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          );
        }}
      />
    </div>
  );
}

export { AppConnectionsPage };
