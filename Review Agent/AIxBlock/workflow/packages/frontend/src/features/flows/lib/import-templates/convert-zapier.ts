import axios from 'axios';
import levenshtein from 'fast-levenshtein';
import { BlockMetadataModelSummary } from 'workflow-blocks-framework';
import { ImportTemplateType, isNil } from 'workflow-shared';
import { normalize } from './convert-make';

interface IRouterPath {
    name: string;
    actions: IAction[];
    conditions: ICondition[];
}

interface ICondition {
    field: string;
    operator: string;
    value: string;
}

interface IAction {
    app: string;
    event: string;
}

let stepNumber = 1;

export async function convertZapier(template: any) {
    stepNumber = 1;
    let activepiecesMap: BlockMetadataModelSummary[];
    try {
        const response = await axios.get(`${window.location.origin}/api/v1/aixblock/mapping-pieces-metadata`, {
            params: {
                type: ImportTemplateType.ZAPIER,
            },
        });
        activepiecesMap = response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }

    function createTrigger() {
        const trigger = template.trigger;
        const defaultTrigger = {
            name: 'trigger',
            valid: true,
            displayName: 'Every X Minutes',
            type: 'PIECE_TRIGGER',
            settings: {
                blockName: '@activepieces/piece-schedule',
                pieceVersion: '~0.1.5',
                blockType: 'OFFICIAL',
                packageType: 'REGISTRY',
                input: { minutes: 1 },
                inputUiInfo: { customizedInputs: {} },
                triggerName: 'every_x_minutes',
            },
            nextAction: null,
        };
        if (isNil(trigger)) {
            return defaultTrigger;
        }

        let bestScore = Infinity;
        let matchedPiece;
        for (const value of activepiecesMap) {
            const apActionName = normalize(value.name.replace('@activepieces/piece-', ''));
            const normalizedAction = normalize(trigger.app);
            const levScore = levenshtein.get(apActionName, normalizedAction);
            if (levScore < bestScore) {
                bestScore = levScore;
                matchedPiece = value;
            }
        }

        if (isNil(matchedPiece?.rawTriggers)) {
            return defaultTrigger;
        }

        let matchedTrigger = { name: '' };
        let bestScoreTrigger = Infinity;
        for (const [key, value] of Object.entries(matchedPiece.rawTriggers)) {
            const apTriggerName = normalize(key);
            const normalizedEvent = normalize(trigger.event);
            const levScore = levenshtein.get(apTriggerName, normalizedEvent);
            if (levScore < bestScoreTrigger) {
                bestScoreTrigger = levScore;
                matchedTrigger = value;
            }
        }

        return {
            name: 'trigger',
            valid: true,
            displayName: trigger.app,
            type: 'PIECE_TRIGGER',
            settings: {
                blockName: matchedPiece.name,
                pieceVersion: `~${matchedPiece.version}`,
                blockType: matchedPiece.blockType,
                packageType: matchedPiece.packageType,
                input: {},
                inputUiInfo: {
                    customizedInputs: {},
                },
                triggerName: matchedTrigger.name,
            },
            nextAction: null,
        };
    }

    const trigger = createTrigger();
    const actions = template?.actions || [];

    const newTrigger = linkActions(trigger, actions, activepiecesMap);

    const activepiecesJson = {
        created: Date.now().toString(),
        updated: Date.now().toString(),
        name: template.name,
        description: template.description || [],
        tags: [],
        pieces: ['@activepieces/piece-schedule'],
        template: {
            displayName: template.name,
            trigger: newTrigger,
            valid: true,
            schemaVersion: '1',
        },
    };

    return activepiecesJson;
}

function linkActions(trigger: any, actions: any, activepiecesMap: BlockMetadataModelSummary[]) {
    let current = null;

    for (let i = actions.length - 1; i >= 0; i--) {
        const action = actions[i];
        let apAction;
        if (action.type?.toLowerCase() === 'router') {
            apAction = mappingRouter(action.paths, activepiecesMap);
        } else if (action.type?.toLowerCase() === 'loop') {
            apAction = mappingLooping(action.actions, activepiecesMap);
        } else if (action.type?.toLowerCase() === 'filter') {
            apAction = mappingFilter(action.conditions, action.actions, activepiecesMap);
        } else if (action.type?.toLowerCase() === 'delay') {
            apAction = findBestMatchPieceAction('delay', action.event, activepiecesMap);
        } else {
            apAction = findBestMatchPieceAction(action.app, action.event, activepiecesMap);
        }
        current = { ...apAction, nextAction: current };
    }

    return { ...trigger, nextAction: current };
}

function mappingFilter(conditions: ICondition[], actions: IAction[], activepiecesMap: BlockMetadataModelSummary[]) {
    const filter = mappingRouter(
        [
            {
                name: 'Filter',
                actions: actions,
                conditions: conditions,
            },
        ],
        activepiecesMap
    );
    return filter;
}

function mappingLooping(actions: IAction[], activepiecesMap: BlockMetadataModelSummary[]) {
    const newActions: any = linkActions({}, actions, activepiecesMap);
    stepNumber += 1;
    return {
        name: `step_${stepNumber}`,
        skip: false,
        type: 'LOOP_ON_ITEMS',
        valid: true,
        settings: {
            items: '',
            inputUiInfo: {
                customizedInputs: {},
            },
        },
        displayName: 'Loop on Items',
        firstLoopAction: newActions.nextAction,
    };
}

function mappingRouter(paths: IRouterPath[], activepiecesMap: BlockMetadataModelSummary[]) {
    let conditions = paths.map((path, idx) => {
        if (idx === paths.length - 1) {
            return {
                branchName: 'Otherwise',
                branchType: 'FALLBACK',
            };
        }
        return {
            branchName: `Branch ${idx + 1}`,
            branchType: 'CONDITION',
            conditions: path.conditions.map((condition) => {
                return {
                    operator: 'TEXT_EXACTLY_MATCHES',
                    firstValue: '',
                    secondValue: '',
                    caseSensitive: false,
                };
            }),
        };
    });

    // handle for filter
    if (paths.length === 1) {
        conditions = [
            {
                branchName: `Branch 1`,
                branchType: 'CONDITION',
                conditions: paths[0].conditions.map((condition) => {
                    return {
                        operator: 'TEXT_EXACTLY_MATCHES',
                        firstValue: '',
                        secondValue: '',
                        caseSensitive: false,
                    };
                }),
            },
            {
                branchName: 'Otherwise',
                branchType: 'FALLBACK',
            },
        ];
    }

    const newActions: any = paths.map((path) => {
        const resp = linkActions({}, path.actions, activepiecesMap);
        return resp.nextAction;
    });
    stepNumber += 1;
    return {
        name: `step_${stepNumber}`,
        skip: false,
        type: 'ROUTER',
        valid: false,
        children: newActions,
        settings: {
            branches: conditions,
            inputUiInfo: {
                customizedInputs: {},
            },
            executionType: 'EXECUTE_FIRST_MATCH',
        },
        displayName: 'Router',
    };
}

function findBestMatchPieceAction(zapierActionApp: string, zapierActionEvent: string, activepiecesMap: BlockMetadataModelSummary[]) {
    let bestScoreApp = Infinity;
    let matchedPiece;
    for (const value of activepiecesMap) {
        const zapierActionAppNormalize = normalize(zapierActionApp);
        const levScoreApp = levenshtein.get(value.name.replace('@activepieces/piece-', ''), zapierActionAppNormalize);
        if (levScoreApp < bestScoreApp) {
            bestScoreApp = levScoreApp;
            matchedPiece = value;
        }
    }

    if (isNil(matchedPiece?.rawActions)) {
        stepNumber += 1;
        return {
            name: `step_${stepNumber}`,
            skip: false,
            type: 'PIECE',
            valid: false,
            settings: {
                input: {},
                inputUiInfo: {
                    customizedInputs: {},
                },
                errorHandlingOptions: {
                    retryOnFailure: {
                        value: false,
                    },
                    continueOnFailure: {
                        value: false,
                    },
                },
            },
            displayName: '',
        }
    }

    let matchedAction = { name: '' };
    let bestScoreAction = Infinity;
    for (const [key, value] of Object.entries(matchedPiece.rawActions)) {
        const apTriggerName = normalize(key);
        const normalizedEvent = normalize(zapierActionEvent);
        const levScore = levenshtein.get(apTriggerName, normalizedEvent);
        if (levScore < bestScoreAction) {
            bestScoreAction = levScore;
            matchedAction = value;
        }
    }

    stepNumber += 1;
    return {
        name: `step_${stepNumber}`,
        skip: false,
        type: 'PIECE',
        valid: false,
        settings: {
            input: {},
            blockName: matchedPiece.name,
            pieceVersion: `~${matchedPiece.version}`,
            blockType: matchedPiece.blockType,
            packageType: matchedPiece.packageType,
            actionName: matchedAction.name,
            inputUiInfo: {
                customizedInputs: {},
            },
            errorHandlingOptions: {
                retryOnFailure: {
                    value: false,
                },
                continueOnFailure: {
                    value: false,
                },
            },
        },
        displayName: matchedAction.name,
    };
}
