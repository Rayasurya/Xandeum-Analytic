import { useMutation, useQuery } from '@tanstack/react-query';
import { t } from 'i18next';
import { AlertTriangle, Hammer, Plus, Settings, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { pieceSelectorUtils } from '@/app/builder/pieces-selector/block-selector-utils';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { TableTitle } from '@/components/ui/table-title';
import { useToast } from '@/components/ui/use-toast';
import { flowsApi } from '@/features/flows/lib/flows-api';
import { mcpApi } from '@/features/mcp/lib/mcp-api';
import { mcpHooks } from '@/features/mcp/lib/mcp-hooks';
import { piecesHooks } from '@/features/pieces/lib/blocks-hook';
import { PieceStepMetadataWithSuggestions, StepMetadata } from '@/features/pieces/lib/types';
import { useAuthorization } from '@/hooks/authorization-hooks';
import { flagsHooks } from '@/hooks/flags-hooks';
import { authenticationSession } from '@/lib/authentication-session';
import {
  ApFlagId,
  assertNotNullOrUndefined,
  FlowOperationRequest,
  FlowOperationType,
  McpBlockWithConnection,
  Permission,
  PopulatedFlow,
  Trigger,
  TriggerType,
} from 'workflow-shared';

import { McpToolsSection } from '../../mcp/mcp-tools-section';

import { McpClientTabs } from './mcp-client-tabs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export enum McpTabs {
  BLOCK = 'block',
  FLOWS = 'flows',
}

export default function MCPPage() {
  const { theme } = useTheme();
  const { data: publicUrl } = flagsHooks.useFlag(ApFlagId.PUBLIC_URL);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { checkAccess } = useAuthorization();
  const doesUserHavePermissionToWriteFlow = checkAccess(Permission.WRITE_FLOW);
  const { metadata } = piecesHooks.useAllStepsMetadata({
    searchQuery: '',
    type: 'trigger',
  });
  const [activeTab, setActiveTab] = useState(McpTabs.BLOCK);
  const [showInstructionDialog, setShowInstructionDialog] = useState(false);

  const { data: mcp, isLoading, refetch: refetchMcp } = mcpHooks.useMcp();

  const {
    data: flowsData,
    isLoading: isFlowsLoading,
    refetch: refetchFlows,
  } = useQuery({
    queryKey: ['mcp-flows'],
    queryFn: () => {
      return flowsApi
        .list({
          projectId: authenticationSession.getProjectId()!,
          limit: 100,
        })
        .then((flows) => {
          const flowsData = flows.data.filter(
            (flow) => flow.version.trigger.type === TriggerType.PIECE && flow.version.trigger.settings.blockName === '@activepieces/piece-mcp'
          );
          return {
            ...flows,
            data: flowsData,
          };
        });
    },
  });

  const serverUrl = publicUrl + 'api/v1/mcp/' + (mcp?.token || '') + '/sse';

  const { pieces } = piecesHooks.usePieces({});

  const rotateMutation = useMutation({
    mutationFn: async (mcpId: string) => {
      return mcpApi.rotateToken(mcpId);
    },
    onSuccess: () => {
      toast({
        description: t('Token rotated successfully'),
        duration: 3000,
      });
      refetchMcp();
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: t('Error'),
        description: t('Failed to rotate token'),
        duration: 5000,
      });
    },
  });

  const removePieceMutation = useMutation({
    mutationFn: async (pieceId: string) => {
      return mcpApi.deletePiece(pieceId);
    },
    onSuccess: () => {
      toast({
        description: t('Block removed successfully'),
        duration: 3000,
      });
      refetchMcp();
    },
    onError: (err) => {
      console.error(err);
      toast({
        variant: 'destructive',
        title: t('Error'),
        description: t('Failed to remove block'),
        duration: 5000,
      });
    },
  });

  const { mutate: createFlow, isPending: isCreateFlowPending } = useMutation({
    mutationFn: async () => {
      const flow = await flowsApi.create({
        projectId: authenticationSession.getProjectId()!,
        displayName: t('Untitled'),
      });
      return flow;
    },
    onSuccess: async (flow) => {
      const triggerMetadata = metadata?.find((m) => (m as PieceStepMetadataWithSuggestions).blockName === '@activepieces/piece-mcp');
      const trigger = (triggerMetadata as PieceStepMetadataWithSuggestions)?.suggestedTriggers?.find((t: any) => t.name === 'mcp_tool');
      assertNotNullOrUndefined(trigger, 'Trigger not found');
      const stepData = pieceSelectorUtils.getDefaultStep({
        stepName: 'trigger',
        stepMetadata: triggerMetadata as StepMetadata,
        actionOrTrigger: trigger,
      });
      await applyOperation(flow, {
        type: FlowOperationType.UPDATE_TRIGGER,
        request: stepData as Trigger,
      });
      toast({
        description: t('Flow created successfully'),
        duration: 3000,
      });
      navigate(`/flows/${flow.id}`);
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: t('Error'),
        description: t('Failed to create flow'),
        duration: 5000,
      });
    },
  });

  const applyOperation = async (flow: PopulatedFlow, operation: FlowOperationRequest) => {
    try {
      const updatedFlowVersion = await flowsApi.update(flow.id, operation, true);
      return {
        flowVersion: {
          ...flow.version,
          id: updatedFlowVersion.version.id,
          state: updatedFlowVersion.version.state,
        },
      };
    } catch (error) {
      console.error(error);
    }
  };

  const removePiece = async (piece: McpBlockWithConnection) => {
    if (!mcp?.id || removePieceMutation.isPending) return;
    removePieceMutation.mutate(piece.id);
  };

  const handleRotateToken = () => {
    if (!mcp?.id) return;
    rotateMutation.mutate(mcp.id);
  };

  const getPieceInfo = (piece: McpBlockWithConnection) => {
    const pieceMetadata = pieces?.find((p) => p.name === piece.blockName);

    return {
      displayName: pieceMetadata?.displayName || piece.blockName,
      logoUrl: pieceMetadata?.logoUrl,
    };
  };

  const pieceInfoMap: Record<string, { displayName: string; logoUrl?: string }> = {};
  mcp?.pieces?.forEach((piece) => {
    pieceInfoMap[piece.id] = getPieceInfo(piece);
  });

  const emptyFlowsMessage = (
    <div className="flex">
      <div
        className={`w-64 flex flex-col items-center justify-center py-6 px-5 text-muted-foreground ${
          theme === 'dark' ? 'bg-card border-border' : 'bg-white'
        } rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
        onClick={() => createFlow()}
      >
        <div className="flex flex-col items-center gap-2">
          <div className={`rounded-full ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'} p-2.5 mb-1`}>
            <Plus className={`h-5 w-5 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`} />
          </div>
          <p className={`font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{t('Add Flow')}</p>
          <p className={`text-xs mt-0.5 text-center ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            {t('Let your AI assistant trigger automations')}
          </p>
        </div>
        <Button className="sr-only" disabled={!doesUserHavePermissionToWriteFlow || isCreateFlowPending} onClick={() => createFlow()}>
          {t('Create Your First MCP Flow')}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="w-full flex flex-col items-center justify-center gap-8 pb-12">
      <div className="w-full space-y-8">
        {/* <div className="flex items-center gap-2">
          <TableTitle description={t('Use any MCP client to connect to your hosted server and access your tools.')}>{t('MCP Server')}</TableTitle>
        </div> */}

        <div className="flex flex-col gap-4 mb-8">
          {/* <div className="flex items-center justify-between gap-2">
            <div className="flex gap-2 items-center">
              <Hammer className="h-5 w-5 text-primary" />
              <span className="text-xl font-bold">{t('Tools')}</span>
            </div>
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowInstructionDialog(true)}>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div> */}

          <div className="absolute right-[16px] top-[30px]">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  asChild
                  className="disabled:pointer-events-auto"
                >
                  <Button
                    size={'sm'}
                    variant="outline-primary"
                    onClick={() => setShowInstructionDialog(true)}
                  >
                    <Settings className="h-5 w-5 mr-1" /> MCP Client Config
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {t('MCP Client Config')}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as McpTabs)} className="w-full">
            <TabsList variant="outline">
              <TabsTrigger value={McpTabs.BLOCK} variant="outline">
                {t('Blocks')}
              </TabsTrigger>
              <TabsTrigger value={McpTabs.FLOWS} variant="outline">
                {t('Flows')}
              </TabsTrigger>
            </TabsList>
            <TabsContent value={McpTabs.BLOCK}>
              <McpToolsSection
                tools={mcp?.pieces || []}
                emptyMessage={null}
                isLoading={isLoading}
                type="pieces"
                onAddClick={() => {}}
                onToolDelete={removePiece}
                pieceInfoMap={pieceInfoMap}
                canAddTool={true}
                addButtonLabel={t('Add Block')}
                isPending={removePieceMutation.isPending}
                refetchFlows={refetchFlows}
              />
            </TabsContent>
            <TabsContent value={McpTabs.FLOWS}>
              <McpToolsSection
                tools={flowsData?.data || []}
                emptyMessage={emptyFlowsMessage}
                isLoading={isFlowsLoading}
                type="flows"
                onAddClick={() => createFlow()}
                onToolClick={(flow) => navigate(`/flows/${flow.id}`)}
                canAddTool={doesUserHavePermissionToWriteFlow}
                addButtonLabel={t('Create Flow')}
                isPending={isCreateFlowPending}
                refetchFlows={refetchFlows}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Dialog open={showInstructionDialog} onOpenChange={setShowInstructionDialog}>
        <DialogContent className="max-w-[90%]" onInteractOutside={(event) => event.preventDefault()}>
          <McpClientTabs
            mcpServerUrl={serverUrl}
            hasTools={(mcp?.pieces?.length || 0) > 0 || (flowsData?.data?.length || 0) > 0}
            onRotateToken={handleRotateToken}
            isRotating={rotateMutation.isPending}
            hasValidMcp={!!mcp?.id}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
