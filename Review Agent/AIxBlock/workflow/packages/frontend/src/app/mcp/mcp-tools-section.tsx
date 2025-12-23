import { t } from 'i18next';
import { ArrowDown, ArrowUp, Calendar, PlugIcon, Plus, RotateCcw, Trash2, Unplug } from 'lucide-react';
import { useState } from 'react';

import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FlowStatus, isNil, McpBlockStatus, McpBlockWithConnection, PopulatedFlow, STATUS_COLORS, STATUS_VARIANT } from 'workflow-shared';

import { McpPiece } from './mcp-block';
import { McpPieceDialog } from './mcp-block-dialog';
import { McpFlowCard } from './mcp-flow-card';
import { DataTable } from '@/components/ui/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { piecesHooks } from '@/features/pieces/lib/blocks-hook';
import { PieceIcon } from '@/features/pieces/components/block-icon';
import { Switch } from '@/components/ui/switch';
import { mcpApi } from '@/features/mcp/mcp-api';
import { toast } from '@/components/ui/use-toast';
import { useMutation } from '@tanstack/react-query';
import { mcpHooks } from '@/features/mcp/mcp-hooks';
import { ConfirmationDeleteDialog } from '@/components/delete-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { get } from 'lodash';
import { formatUtils } from '@/lib/utils';
import { flowsApi } from '@/features/flows/lib/flows-api';
import { api } from '@/lib/api';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PieceIconList } from '@/features/pieces/components/block-icon-list';

// Define a union type for tool items
type ToolItem = McpBlockWithConnection | PopulatedFlow;

interface McpToolsProps {
  tools: ToolItem[];
  emptyMessage: React.ReactNode;
  isLoading: boolean;
  type: 'pieces' | 'flows';
  onAddClick: () => void;
  onToolClick?: (tool: PopulatedFlow) => void;
  onToolDelete?: (tool: McpBlockWithConnection) => void;
  pieceInfoMap?: Record<string, { displayName: string; logoUrl?: string }>;
  canAddTool: boolean;
  addButtonLabel: string;
  isPending?: boolean;
  refetchFlows: () => void;
}

const BlockConnectionName = ({ displayName, blockInfo, logoUrl }: { displayName: string; logoUrl: string; blockInfo: McpBlockWithConnection }) => {
  const { pieceModel, isLoading: isPieceLoading } = piecesHooks.usePiece({
    name: blockInfo.blockName,
  });

  const connectionRequired = !isNil(pieceModel?.auth);
  const connectionMissing = connectionRequired && !blockInfo.connection;
  if (isPieceLoading) {
    return <Skeleton className="h-10 w-10 rounded-full" />;
  }
  return (
    <div className="flex items-center space-x-3 min-w-0 py-1.5 flex-1">
      <div className="relative flex-shrink-0">
        <PieceIcon displayName={displayName} logoUrl={logoUrl} size="md" showTooltip={true} circle={true} border={true} />
        {blockInfo.connection && (
          <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-0.5">
            <PlugIcon className="h-3 w-3" />
          </div>
        )}
        {connectionMissing && (
          <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-0.5">
            <Unplug className="h-3 w-3" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="font-medium text-foreground truncate flex items-center gap-1.5">{displayName}</h4>
        {blockInfo.connection ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-full">{blockInfo.connection.displayName}</p>
            </TooltipTrigger>
            <TooltipContent className="max-w-[300px] break-all">
              <p className="text-sm">{blockInfo.connection.displayName}</p>
            </TooltipContent>
          </Tooltip>
        ) : connectionMissing ? (
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
            <span className="text-amber-500">{t('Connection required')}</span>
          </p>
        ) : null}
      </div>
    </div>
  );
};

const BlockConnectionStatus = ({ blockInfo, refetchMcp }: { blockInfo: McpBlockWithConnection; refetchMcp: () => void }) => {
  const { mutate: updatePieceStatus } = useMutation({
    mutationFn: async (status: McpBlockStatus) => {
      setStatus(status === McpBlockStatus.ENABLED);
      await mcpApi.updatePiece({
        pieceId: blockInfo.id,
        status,
      });
      return status;
    },
    onSuccess: (status) => {
      toast({
        title: `${t('MCP piece')} (${blockInfo.connection?.displayName || ''})`,
        description: t(`${status === McpBlockStatus.ENABLED ? 'Enabled' : 'Disabled'} successfully`),
      });
      refetchMcp();
    },
    onError: () => {
      toast({
        title: `${t('MCP piece')} (${blockInfo.connection?.displayName || ''})`,
        description: t('Failed to update piece status'),
        variant: 'destructive',
      });
    },
  });

  const [status, setStatus] = useState(blockInfo.status === McpBlockStatus.ENABLED);
  return (
    <Switch
      checked={status}
      onCheckedChange={(checked) => {
        updatePieceStatus(checked ? McpBlockStatus.ENABLED : McpBlockStatus.DISABLED);
      }}
      className="scale-75"
    />
  );
};

const BlockEditConnection = ({ blockInfo, onDelete }: { blockInfo: McpBlockWithConnection; onDelete: () => void }) => {
  const { pieceModel, isLoading: isPieceLoading } = piecesHooks.usePiece({
    name: blockInfo.blockName,
  });

  const connectionRequired = !isNil(pieceModel?.auth);
  const connectionMissing = connectionRequired && !blockInfo.connection;

  if (isPieceLoading) {
    return <Skeleton className="h-10 w-10 rounded-full" />;
  }

  return (
    <>
      {pieceModel?.auth && (
        <Tooltip>
          <McpPieceDialog mcpPieceToUpdate={blockInfo}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
          </McpPieceDialog>
          <TooltipContent>{t(connectionMissing ? 'Add Connection' : 'Edit Connection')}</TooltipContent>
        </Tooltip>
      )}
      <Tooltip>
        <ConfirmationDeleteDialog
          title={`${t('Delete')} ${blockInfo.connection?.displayName || ''}`}
          message={
            <div>
              {t("Are you sure you want to delete this tool from your MCP? if you delete it you won't be able to use it in your MCP client.")}
            </div>
          }
          mutationFn={async () => {
            onDelete();
          }}
          entityName={t('piece')}
        >
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon">
              <Trash2 className="h-4 w-4 text-destructive transition-colors duration-200 group-hover:text-destructive/90" />
            </Button>
          </TooltipTrigger>
        </ConfirmationDeleteDialog>

        <TooltipContent>{t('Delete')}</TooltipContent>
      </Tooltip>
    </>
  );
};

const DeleteFlow = ({ refetchFlows, flowId, displayName }: { refetchFlows: () => void; flowId: string; displayName: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => flowsApi.delete(flowId),
    onSuccess: async () => {
      toast({
        title: t('Success'),
        description: t('Your flow was successfully deleted.'),
        duration: 3000,
        variant: 'success',
      });
      setIsOpen(false);
      refetchFlows();
    },
    onError: (error) => {
      if (api.isError(error)) {
        toast({
          variant: 'destructive',
          title: t('Error'),
          description: t('Failed to delete flow.'),
          duration: 3000,
        });
      }
      console.error(error);
    },
  });

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Trash2
            className="h-4 w-4 text-destructive cursor-pointer transition-colors duration-200 group-hover:text-destructive/90"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(true);
            }}
          />
        </TooltipTrigger>
        <TooltipContent>{t('Delete')}</TooltipContent>
      </Tooltip>

      <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{`${t('Delete')} ${displayName}`}</DialogTitle>
            <DialogDescription>
              <div>{t('Are you sure you want to delete this flow?')}</div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant={'outline'}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setIsOpen(false);
              }}
            >
              {t('Cancel')}
            </Button>
            <Button
              loading={isPending}
              variant={'destructive'}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                mutate();
              }}
            >
              <Trash2 className="size-4 mr-2" /> {t('Delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const McpToolsSection = ({
  tools,
  emptyMessage,
  isLoading,
  type,
  onAddClick,
  onToolClick,
  onToolDelete,
  pieceInfoMap = {},
  canAddTool,
  addButtonLabel,
  isPending,
  refetchFlows,
}: McpToolsProps) => {
  const { theme } = useTheme();

  const { refetch: refetchMcp } = mcpHooks.useMcp();

  const renderAddButton = () => {
    // Only render the button if there's at least one tool
    if (tools.length === 0) {
      return null;
    }

    if (type === 'pieces') {
      return (
        <McpPieceDialog>
          <Button variant="default" size="sm" className="flex items-center gap-1" disabled={!canAddTool || isPending}>
            <Plus className="h-4 w-4" />
            {addButtonLabel}
          </Button>
        </McpPieceDialog>
      );
    } else {
      return (
        <Button variant="default" size="sm" className="flex items-center gap-1" onClick={onAddClick} disabled={!canAddTool || isPending}>
          <Plus className="h-4 w-4" />
          {addButtonLabel}
        </Button>
      );
    }
  };

  const renderSkeletons = () => {
    if (type === 'pieces') {
      return Array(3)
        .fill(0)
        .map((_, index) => (
          <McpPiece
            key={`skeleton-${index}`}
            piece={{} as McpBlockWithConnection}
            pieceInfo={{ displayName: '', logoUrl: '' }}
            onDelete={() => {}}
            isLoading={true}
          />
        ));
    } else {
      return Array(3)
        .fill(0)
        .map((_, index) => (
          <Card key={`flow-skeleton-${index}`} className="overflow-hidden transition-all duration-200 relative hover:shadow-sm group border-border">
            <div className="p-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 w-48 bg-muted animate-pulse rounded"></div>
                  <div className="h-3 w-24 bg-muted animate-pulse rounded"></div>
                </div>
              </div>
            </div>
          </Card>
        ));
    }
  };

  const renderEmptyState = () => {
    if (type === 'pieces') {
      // For connections, we need to replace the button in the empty message with our dialog
      return (
        <McpPieceDialog>
          <div className="flex">
            <div
              className={`w-64 flex flex-col items-center justify-center py-6 px-5 text-muted-foreground ${
                theme === 'dark' ? 'bg-card border-border' : 'bg-white'
              } rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`rounded-full ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'} p-2.5 mb-1`}>
                  <Plus className={`h-5 w-5 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`} />
                </div>
                <p className={`font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{t(addButtonLabel)}</p>
                <p className={`text-xs mt-0.5 text-center ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  {t('Connect your AI assistant to external services')}
                </p>
              </div>
            </div>
          </div>
        </McpPieceDialog>
      );
    } else {
      return emptyMessage || null;
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between mb-4">{renderAddButton()}</div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          renderSkeletons()
        ) : tools.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {type === 'pieces' && (
              <DataTable
                page={{ data: tools, next: null, previous: null }}
                isLoading={false}
                hidePagination={true}
                columns={[
                  {
                    accessorKey: 'connection.displayName',
                    header: ({ column }) => <DataTableColumnHeader column={column} title={t('Connection name')} />,
                    cell: ({ row }: any) => {
                      const pieceInfo = pieceInfoMap[row.original.id] || {
                        displayName: row.original.blockName,
                        logoUrl: '',
                      };
                      return <BlockConnectionName displayName={pieceInfo.displayName} blockInfo={row.original} logoUrl={pieceInfo.logoUrl || ''} />;
                    },
                  },
                  {
                    accessorKey: 'status',
                    header: ({ column }) => <DataTableColumnHeader column={column} title={t('Status')} />,
                    cell: ({ row }: any) => {
                      return <BlockConnectionStatus blockInfo={row.original} refetchMcp={refetchMcp} />;
                    },
                  },
                  {
                    accessorKey: 'actions',
                    header: ({ column }) => <DataTableColumnHeader column={column} title={t('Actions')} />,
                    cell: ({ row }: any) => {
                      return <BlockEditConnection blockInfo={row.original} onDelete={() => onToolDelete && onToolDelete(row.original)} />;
                    },
                  },
                ]}
                emptyStateTextTitle={''}
                emptyStateTextDescription={''}
                emptyStateIcon={undefined}
              />
            )}
            {type === 'flows' && (
              <>
                <DataTable
                  page={{ data: tools, next: null, previous: null }}
                  isLoading={false}
                  hidePagination={true}
                  columns={[
                    {
                      accessorKey: 'flowName',
                      header: ({ column }) => <DataTableColumnHeader column={column} title={t('Flow name')} />,
                      cell: ({ row }: any) => {
                        const flow = row.original;
                        return (
                          <>
                            <div className="text-blue-500 font-medium cursor-pointer mb-1" onClick={() => onToolClick && onToolClick(flow)}>
                              {row.original.version.displayName || ''}
                            </div>
                            <div className="flex items-start py-1 flex-1 min-w-0 overflow-hidden">
                              <PieceIconList trigger={flow.version.trigger} maxNumberOfIconsToShow={3} size="md" />
                            </div>
                          </>
                        );
                      },
                    },
                    {
                      accessorKey: 'mcpName',
                      header: ({ column }) => <DataTableColumnHeader column={column} title={t('MCP name')} />,
                      cell: ({ row }: any) => {
                        return (
                          <div>
                            <h4 className="font-medium text-foreground truncate text-sm min-w-0 flex-1">
                              {get(row, 'original.version.trigger.settings.input.toolName') || t('Unnamed tool')}
                            </h4>
                          </div>
                        );
                      },
                    },
                    {
                      accessorKey: 'status',
                      header: ({ column }) => <DataTableColumnHeader column={column} title={t('Status')} />,
                      cell: ({ row }: any) => {
                        const flow = row.original;
                        return (
                          <div>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span
                                  style={{
                                    backgroundColor:
                                      flow.status === FlowStatus.ENABLED
                                        ? STATUS_COLORS[STATUS_VARIANT.POSITIVE].color
                                        : STATUS_COLORS[STATUS_VARIANT.NEGATIVE].color,
                                    color:
                                      flow.status === FlowStatus.ENABLED
                                        ? STATUS_COLORS[STATUS_VARIANT.POSITIVE].textColor
                                        : STATUS_COLORS[STATUS_VARIANT.NEGATIVE].textColor,
                                  }}
                                  className="text-xs px-2 py-1 rounded-sm flex-shrink-0 cursor-help"
                                >
                                  {flow.status === FlowStatus.ENABLED ? t('Enabled') : t('Disabled')}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                {flow.status === FlowStatus.ENABLED ? t('This flow is enabled') : t('Enable this flow to make it available')}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        );
                      },
                    },
                    {
                      accessorKey: 'createdAt',
                      header: ({ column }) => <DataTableColumnHeader column={column} title={t('Created At')} />,
                      cell: ({ row }: any) => {
                        return (
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground flex-shrink-0">
                            <Calendar className="h-3 w-3" />
                            <span className="whitespace-nowrap">{formatUtils.formatDate(new Date(row.original.created))}</span>
                          </div>
                        );
                      },
                    },
                    {
                      accessorKey: 'action',
                      header: ({ column }) => <DataTableColumnHeader column={column} title={t('Actions')} />,
                      cell: ({ row }: any) => {
                        const flow = row.original;
                        return <DeleteFlow flowId={flow.id} displayName={flow.version.displayName} refetchFlows={refetchFlows} />;
                      },
                    },
                  ]}
                  emptyStateTextTitle={''}
                  emptyStateTextDescription={''}
                  emptyStateIcon={undefined}
                />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
