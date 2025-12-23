import { t } from 'i18next';
import { Calendar, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from '@/components/ui/use-toast';
import { flowsApi } from '@/features/flows/lib/flows-api';
import { PieceIconList } from '@/features/pieces/components/block-icon-list';
import { api } from '@/lib/api';
import { cn, formatUtils } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import {
  FlowStatus,
  PopulatedFlow,
  STATUS_COLORS,
  STATUS_VARIANT,
} from 'workflow-shared';

type McpFlowCardProps = {
  flow: PopulatedFlow;
  onClick: () => void;
  refetchFlows: () => void;
};

export const McpFlowCard = ({ flow, onClick, refetchFlows }: McpFlowCardProps) => {

  const [isOpen, setIsOpen] = useState(false);

  const { mutate, isPending } = useMutation({
      mutationFn: async () => flowsApi.delete(flow.id),
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
      <Card
        className={cn(
          'overflow-hidden transition-all duration-200 relative border-border cursor-pointer h-full',
          'hover:shadow-md hover:border-primary/30 hover:bg-accent/10',
        )}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex flex-col">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-foreground truncate text-sm min-w-0 flex-1">
                {flow.version.displayName}
              </h4>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground flex-shrink-0">
                <Calendar className="h-3 w-3" />
                <span className="whitespace-nowrap">
                  {formatUtils.formatDate(new Date(flow.created))}
                </span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mb-2 h-5">
              {flow.version.trigger.settings?.input?.toolName || (
                <span className="text-muted-foreground/70 italic">
                  {t('Unnamed tool')}
                </span>
              )}
            </div>

            <div className="w-full">
              <div className="w-full flex items-center gap-2 justify-between">
                <div className="flex items-start py-1 flex-1 min-w-0 overflow-hidden">
                  <PieceIconList
                    trigger={flow.version.trigger}
                    maxNumberOfIconsToShow={3}
                    size="md"
                  />
                </div>
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
                      {flow.status === FlowStatus.ENABLED
                        ? t('Enabled')
                        : t('Disabled')}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    {flow.status === FlowStatus.ENABLED
                      ? t('This flow is enabled')
                      : t('Enable this flow to make it available')}
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Trash2
                      className="h-4 w-4 text-destructive transition-colors duration-200 group-hover:text-destructive/90"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(true);
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>{t('Delete')}</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{`${t('Delete')} ${flow.version.displayName}`}</DialogTitle>
            <DialogDescription>
              <div>
                {t(
                  "Are you sure you want to delete this flow?",
                )}
              </div>
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
