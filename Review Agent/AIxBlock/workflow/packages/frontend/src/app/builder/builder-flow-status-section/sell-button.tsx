import SellDialog from '@/app/builder/builder-flow-status-section/sell-dialog';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PopulatedFlow } from 'workflow-shared';
import { t } from 'i18next';
import { DollarSign } from 'lucide-react';
import { useCallback, useState } from 'react';

type SellButtonProps = {
  flow: PopulatedFlow;
  setFlow: (flow: PopulatedFlow) => void;
}

export default function SellButton({ flow, setFlow }: SellButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const onClick = useCallback(() => {
    setIsOpen(true);
  }, []);

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild className="disabled:pointer-events-auto">
            <Button
              size="sm"
              className="gap-2 px-2"
              onClick={onClick}
            >
              <DollarSign className="w-4 h-4" />
              {
                flow.listingStatus
                  ? t('Selling') + `: $` + ((flow.listingPrice ?? 0) / 100).toFixed(2)
                  : t('Sell')
              }
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{t('Sell my workflow')}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {isOpen && (
        <SellDialog
          open={isOpen}
          onOpenChange={setIsOpen}
          flow={flow}
          setFlow={setFlow}
          />
      )}
    </>
  );
}
