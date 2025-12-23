import {
  ActionBase,
  BlockMetadataModelSummary,
  PieceAuthProperty,
  TriggerBase,
} from 'workflow-blocks-framework';
import {
  ActionType,
  BlockType,
  FlowOperationType,
  PackageType,
  StepLocationRelativeToParent,
  TriggerType,
} from 'workflow-shared';

type BaseStepMetadata = {
  displayName: string;
  logoUrl: string;
  description: string;
};

export type PieceStepMetadata = BaseStepMetadata & {
  type: ActionType.PIECE | TriggerType.PIECE;
  blockName: string;
  pieceVersion: string;
  categories: string[];
  packageType: PackageType;
  blockType: BlockType;
  auth: PieceAuthProperty | undefined;
};

type PrimitiveStepMetadata = BaseStepMetadata & {
  type:
    | ActionType.CODE
    | ActionType.LOOP_ON_ITEMS
    | ActionType.ROUTER
    | TriggerType.EMPTY;
};

export type PieceStepMetadataWithSuggestions = PieceStepMetadata &
  Pick<BlockMetadataModelSummary, 'suggestedActions' | 'suggestedTriggers'>;

export type StepMetadataWithSuggestions =
  | PieceStepMetadataWithSuggestions
  | PrimitiveStepMetadata;

export type StepMetadata = PieceStepMetadata | PrimitiveStepMetadata;

export type PieceSelectorOperation =
  | {
      type: FlowOperationType.ADD_ACTION;
      actionLocation: {
        branchIndex: number;
        parentStep: string;
        stepLocationRelativeToParent: StepLocationRelativeToParent.INSIDE_BRANCH;
      };
    }
  | {
      type: FlowOperationType.ADD_ACTION;
      actionLocation: {
        parentStep: string;
        stepLocationRelativeToParent: Exclude<
          StepLocationRelativeToParent,
          StepLocationRelativeToParent.INSIDE_BRANCH
        >;
      };
    }
  | { type: FlowOperationType.UPDATE_TRIGGER }
  | {
      type: FlowOperationType.UPDATE_ACTION;
      stepName: string;
    };

export type AskAiButtonOperations = Exclude<
  PieceSelectorOperation,
  { type: FlowOperationType.UPDATE_TRIGGER }
>;
export type PieceSelectorItem =
  | ActionBase
  | TriggerBase
  | {
      displayName: string;
      name: string;
      type: ActionType.LOOP_ON_ITEMS | ActionType.ROUTER | ActionType.CODE;
      description: string;
    };

export type HandleSelectCallback = (
  piece: StepMetadata,
  item: PieceSelectorItem,
  type?: string,
) => void;
