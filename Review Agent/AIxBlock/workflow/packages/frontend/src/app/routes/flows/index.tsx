import { useMutation, useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { t } from 'i18next';
import {
  Calendar,
  CheckIcon,
  ChevronDown,
  EllipsisVertical,
  Import,
  Plus,
  Workflow,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FlowStatus, Permission, PopulatedFlow } from 'workflow-shared';

import { TableTitle } from '../../../components/ui/table-title';
import FlowActionMenu from '../../components/flow-actions-menu';

import TaskLimitAlert from './task-limit-alert';

import { useEmbedding, useNewWindow } from '@/components/embed-provider';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable, LIMIT_QUERY_PARAM, PAGE_QUERY_PARAM, RowDataWithActions } from '@/components/ui/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PermissionNeededTooltip } from '@/components/ui/permission-needed-tooltip';
import { INTERNAL_ERROR_TOAST, toast } from '@/components/ui/use-toast';
import { FlowStatusToggle } from '@/features/flows/components/flow-status-toggle';
import { ImportFlowDialog } from '@/features/flows/components/import-flow-dialog';
import { SelectFlowTemplateDialog } from '@/features/flows/components/select-flow-template-dialog';
import { flowsApi } from '@/features/flows/lib/flows-api';
import { useFlowsBulkActions } from '@/features/flows/lib/use-flows-bulk-actions';
import { FolderBadge } from '@/features/folders/component/folder-badge';
import {
  FolderFilterList,
  folderIdParamName,
} from '@/features/folders/component/folder-filter-list';
import { foldersApi } from '@/features/folders/lib/folders-api';
import { PieceIconList } from '@/features/pieces/components/block-icon-list';
import { useAuthorization } from '@/hooks/authorization-hooks';
import { authenticationSession } from '@/lib/authentication-session';
import { cn, formatUtils, NEW_FLOW_QUERY_PARAM } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

const filters = [
  {
    type: 'input',
    title: t('Flow name'),
    accessorKey: 'name',
    options: [],
    icon: CheckIcon,
  } as const,
  {
    type: 'select',
    title: t('Status'),
    accessorKey: 'status',
    options: Object.values(FlowStatus).map((status) => {
      return {
        label: formatUtils.convertEnumToHumanReadable(status),
        value: status,
      };
    }),
    icon: CheckIcon,
  } as const,
];

const FlowsPage = () => {
  const { checkAccess } = useAuthorization();
  const doesUserHavePermissionToWriteFlow = checkAccess(Permission.WRITE_FLOW);
  const { embedState } = useEmbedding();
  const navigate = useNavigate();
  const [refresh, setRefresh] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const openNewWindow = useNewWindow();
  const [searchParams] = useSearchParams();
  const projectId = authenticationSession.getProjectId()!;
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['flow-table', searchParams.toString(), projectId],
    staleTime: 0,
    queryFn: () => {
      const name = searchParams.get('name');
      const status = searchParams.getAll('status') as FlowStatus[];
      const page = searchParams.get(PAGE_QUERY_PARAM)
        ? parseInt(searchParams.get(PAGE_QUERY_PARAM)!)
        : 1;
      const limit = searchParams.get(LIMIT_QUERY_PARAM)
        ? parseInt(searchParams.get(LIMIT_QUERY_PARAM)!)
        : 10;
      const folderId = searchParams.get('folderId') ?? undefined;

      return flowsApi.v2.list({
        projectId,
        cursor: undefined,
        page,
        limit,
        name: name ?? undefined,
        status,
        folderId,
      });
    },
  });

  const { mutate: createFlow, isPending: isCreateFlowPending } = useMutation<
    PopulatedFlow,
    Error,
    void
  >({
    mutationFn: async () => {
      const folderId = searchParams.get(folderIdParamName);
      const folder =
        folderId && folderId !== 'NULL'
          ? await foldersApi.get(folderId)
          : undefined;
      const flow = await flowsApi.create({
        projectId: authenticationSession.getProjectId()!,
        displayName: t('Untitled'),
        folderName: folder?.displayName,
      });
      return flow;
    },
    onSuccess: (flow) => {
      navigate(`/flows/${flow.id}?${NEW_FLOW_QUERY_PARAM}=true`);
    },
    onError: () => toast(INTERNAL_ERROR_TOAST),
  });

  const [selectedRows, setSelectedRows] = useState<Array<PopulatedFlow>>([]);

  const columns: (ColumnDef<RowDataWithActions<PopulatedFlow>> & {
    accessorKey: string;
  })[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            table.getIsSomePageRowsSelected()
          }
          onCheckedChange={(value) => {
            const isChecked = !!value;
            table.toggleAllPageRowsSelected(isChecked);

            if (isChecked) {
              const allRowIds = table
                .getRowModel()
                .rows.map((row) => row.original);

              const newSelectedRowIds = [...allRowIds, ...selectedRows];

              const uniqueRowIds = Array.from(
                new Map(
                  newSelectedRowIds.map((item) => [item.id, item]),
                ).values(),
              );

              setSelectedRows(uniqueRowIds);
            } else {
              const filteredRowIds = selectedRows.filter((row) => {
                return !table
                  .getRowModel()
                  .rows.some((r) => r.original.version.id === row.version.id);
              });
              setSelectedRows(filteredRowIds);
            }
          }}
        />
      ),
      cell: ({ row }) => {
        const isChecked = selectedRows.some(
          (selectedRow) =>
            selectedRow.id === row.original.id &&
            selectedRow.status === row.original.status,
        );
        return (
          <Checkbox
            checked={isChecked}
            onCheckedChange={(value) => {
              const isChecked = !!value;
              let newSelectedRows = [...selectedRows];
              if (isChecked) {
                const exists = newSelectedRows.some(
                  (selectedRow) => selectedRow.id === row.original.id,
                );
                if (!exists) {
                  newSelectedRows.push(row.original);
                }
              } else {
                newSelectedRows = newSelectedRows.filter(
                  (selectedRow) => selectedRow.id !== row.original.id,
                );
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
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('Name')} />
      ),
      cell: ({ row }) => {
        const status = row.original.version.displayName;
        return <div className="text-left">{status}</div>;
      },
    },
    {
      accessorKey: 'steps',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('Steps')} />
      ),
      cell: ({ row }) => {
        return (
          <PieceIconList
            trigger={row.original.version.trigger}
            maxNumberOfIconsToShow={2}
          />
        );
      },
    },
    {
      accessorKey: 'folderId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('Folder')} />
      ),
      cell: ({ row }) => {
        const folderId = row.original.folderId;
        return (
          <div className="text-left min-w-[150px]">
            {folderId ? (
              <FolderBadge folderId={folderId} />
            ) : (
              <span>{t('Uncategorized')}</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'selling',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('In Marketplace')} />
      ),
      cell: ({ row }) => {
        return (
          <div className="text-left font-medium">
            {!row.original.listingStatus
              ? ''
              : '$' + ((row.original.listingPrice ?? 0) / 100).toFixed(2)}
          </div>
        );
      },
    },
    {
      accessorKey: 'created',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('Created')} />
      ),
      cell: ({ row }) => {
        const created = row.original.created;
        return (
          <div className="text-left font-medium min-w-[150px]">
            {formatUtils.formatDate(new Date(created))}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('Status')} />
      ),
      cell: ({ row }) => {
        return (
          <div
            className="flex items-center space-x-2"
            onClick={(e) => e.stopPropagation()}
          >
            <FlowStatusToggle
              flow={row.original}
              flowVersion={row.original.version}
            ></FlowStatusToggle>
          </div>
        );
      },
    },
    {
      accessorKey: 'actions',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="" />
      ),
      cell: ({ row }) => {
        const flow = row.original;
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <FlowActionMenu
              insideBuilder={false}
              flow={flow}
              readonly={false}
              flowVersion={flow.version}
              onRename={() => {
                setRefresh(refresh + 1);
                refetch();
              }}
              onMoveTo={() => {
                setRefresh(refresh + 1);
                refetch();
              }}
              onDuplicate={() => {
                setRefresh(refresh + 1);
                refetch();
              }}
              onDelete={() => {
                setRefresh(refresh + 1);
                refetch();
              }}
            >
              <EllipsisVertical className="h-10 w-10" />
            </FlowActionMenu>
          </div>
        );
      },
    },
  ];

  const bulkActions = useFlowsBulkActions({
    selectedRows,
    isDropdownOpen,
    setIsDropdownOpen,
    refresh,
    setSelectedRows,
    setRefresh,
    refetch,
  });

  const onRowClick = (flow: PopulatedFlow, newWindow: boolean) => {
    if (newWindow) {
      openNewWindow(authenticationSession.appendProjectRoutePrefix(`/flows/${flow.id}`));
    } else {
      navigate(authenticationSession.appendProjectRoutePrefix(`/flows/${flow.id}`));
    }
  };

  return (
    <div className="flex flex-col gap-4 grow">
      <TaskLimitAlert />
      <div className="flex flex-col gap-4 w-full grow -mt-4">
        {/*<div className="flex">
          <TableTitle description={t('Create and manage your automation flows')}>{t('Flows')}</TableTitle>
          <div className="ml-auto flex flex-row gap-2">
            <PermissionNeededTooltip hasPermission={doesUserHavePermissionToWriteFlow}>
              <ImportFlowDialog
                insideBuilder={false}
                onRefresh={() => {
                  setRefresh(refresh + 1);
                  refetch();
                }}
              >
                <Button disabled={!doesUserHavePermissionToWriteFlow} variant="outline" className="flex gap-2 items-center">
                  <Import className="w-4 h-4" />
                  {t('Import Flow')}
                </Button>
              </ImportFlowDialog>
            </PermissionNeededTooltip>

            <PermissionNeededTooltip hasPermission={doesUserHavePermissionToWriteFlow}>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger disabled={!doesUserHavePermissionToWriteFlow} asChild>
                  <Button
                    disabled={!doesUserHavePermissionToWriteFlow}
                    variant="default"
                    className="flex gap-2 items-center"
                    loading={isCreateFlowPending}
                  >
                    <span>{t('New Flow')}</span>
                    <ChevronDown className="h-4 w-4 " />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      createFlow();
                    }}
                    disabled={isCreateFlowPending}
                  >
                    <Plus className="h-4 w-4 me-2" />
                    <span>{t('From scratch')}</span>
                  </DropdownMenuItem>
                  <SelectFlowTemplateDialog>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={isCreateFlowPending}>
                      <Workflow className="h-4 w-4 me-2" />
                      <span>{t('Use a template')}</span>
                    </DropdownMenuItem>
                  </SelectFlowTemplateDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </PermissionNeededTooltip>
          </div>
        </div>*/}
        <div className="absolute right-[16px] top-[22px] flex flex-row gap-2">
          <PermissionNeededTooltip hasPermission={doesUserHavePermissionToWriteFlow}>
            <ImportFlowDialog
              insideBuilder={false}
              onRefresh={() => {
                setRefresh(refresh + 1);
                refetch();
              }}
            >
              <Button disabled={!doesUserHavePermissionToWriteFlow} variant="outline" className="flex gap-2 items-center">
                <Import className="w-4 h-4" />
                {t('Import Flow')}
              </Button>
            </ImportFlowDialog>
          </PermissionNeededTooltip>

          <PermissionNeededTooltip hasPermission={doesUserHavePermissionToWriteFlow}>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger disabled={!doesUserHavePermissionToWriteFlow} asChild>
                <Button
                  disabled={!doesUserHavePermissionToWriteFlow}
                  variant="default"
                  className="flex gap-2 items-center"
                  loading={isCreateFlowPending}
                >
                  <span>{t('New Flow')}</span>
                  <ChevronDown className="h-4 w-4 " />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    createFlow();
                  }}
                  disabled={isCreateFlowPending}
                >
                  <Plus className="h-4 w-4 me-2" />
                  <span>{t('From scratch')}</span>
                </DropdownMenuItem>
                <SelectFlowTemplateDialog>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={isCreateFlowPending}>
                    <Workflow className="h-4 w-4 me-2" />
                    <span>{t('Use a template')}</span>
                  </DropdownMenuItem>
                </SelectFlowTemplateDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </PermissionNeededTooltip>
        </div>
        <div className="flex flex-row gap-4">
          {!embedState.hideFolders && <FolderFilterList refresh={refresh} />}
          <div className="w-full">
            <DataTable
              emptyStateTextTitle={t('No flows found')}
              emptyStateTextDescription={t('Create a workflow to start automating')}
              emptyStateIcon={<Workflow className="size-14" />}
              columns={columns.filter((column) => !embedState.hideFolders || column.accessorKey !== 'folderId')}
              page={data}
              isLoading={isLoading}
              filters={filters}
              bulkActions={bulkActions}
              customContent={() => {
                if (!data?.data?.length)
                  return (
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Workflow className="size-14" />
                      <p className="text-lg font-semibold">{t('No flows found')}</p>
                      <p className="text-sm text-muted-foreground ">{t('Create a workflow to start automating')}</p>
                    </div>
                  );
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.data.map((flow) => {
                      return (
                        <Card
                          className={cn(
                            'overflow-hidden transition-all duration-200 relative border-border cursor-pointer h-full',
                            'hover:shadow-md hover:border-primary/30 hover:bg-accent/10'
                          )}
                          onClick={(e) => {
                            onRowClick(flow, e.ctrlKey);
                          }}
                          onAuxClick={(e) => {
                            onRowClick(flow, e.ctrlKey);
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex flex-col">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-foreground truncate text-sm min-w-0 flex-1">{flow.version.displayName}</h4>
                                <div className="flex items-center space-x-1 text-xs text-muted-foreground flex-shrink-0">
                                  <Calendar className="h-3 w-3" />
                                  <span className="whitespace-nowrap">{formatUtils.formatDate(new Date(flow.created))}</span>
                                </div>
                              </div>
                              <div className="w-full mt-3">
                                <div className="w-full flex items-center gap-2 justify-between">
                                  <div className="flex items-start py-1 flex-1 min-w-0 overflow-hidden">
                                    <PieceIconList trigger={flow.version.trigger} maxNumberOfIconsToShow={3} size="md" />
                                  </div>
                                  <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                                    <FlowStatusToggle flow={flow} flowVersion={flow.version} />
                                    <div onClick={(e) => e.stopPropagation()}>
                                      <FlowActionMenu
                                        insideBuilder={false}
                                        flow={flow}
                                        readonly={false}
                                        flowVersion={flow.version}
                                        onRename={() => {
                                          setRefresh(refresh + 1);
                                          refetch();
                                        }}
                                        onMoveTo={() => {
                                          setRefresh(refresh + 1);
                                          refetch();
                                        }}
                                        onDuplicate={() => {
                                          setRefresh(refresh + 1);
                                          refetch();
                                        }}
                                        onDelete={() => {
                                          setRefresh(refresh + 1);
                                          refetch();
                                        }}
                                      >
                                        <EllipsisVertical className="h-10 w-10" />
                                      </FlowActionMenu>
                                    </div>
                                  </div>
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
        </div>
      </div>
    </div>
  );
};

export { FlowsPage };
