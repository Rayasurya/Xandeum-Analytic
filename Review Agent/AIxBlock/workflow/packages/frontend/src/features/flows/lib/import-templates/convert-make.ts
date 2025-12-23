import axios from 'axios';
import levenshtein from 'fast-levenshtein';

const API_URL =
  (typeof window !== 'undefined' && (window as any).API_URL)
    ? (window as any).API_URL
    : (typeof window !== 'undefined'
        ? window.location.origin + '/api/v1/aixblock/mapping-pieces-metadata'
        : 'http://127.0.0.1:4200/api/v1/aixblock/mapping-pieces-metadata');

// Hàm tìm kiếm hành động và module trong Activepieces
export function normalize(str: string): string {
  if (!str) return '';
  return str.toLowerCase().replace(/[_\-\s]/g, '').replace(/[^a-z0-9]/g, '');
}

const function_mapping = async (
    inputs: {
      makeModuleKey: string;
      activepiecesMap: Record<string, any>;
    }
  ): Promise<any | null> => {
  const { makeModuleKey, activepiecesMap } = inputs;

  // Thêm cấu hình "builtin:BasicRouter"
  activepiecesMap['builtin:BasicRouter'] = {
    activepieces_module: "@activepieces/piece-router",
    activepieces_action: "basic_router",
    router_config: {
      fallback_branch_name: "Otherwise",
      execution_type: "EXECUTE_FIRST_MATCH"
    }
  };

  const [makeAppName, makeAction] = makeModuleKey.split(":");
  const normalizedApp = normalize(makeAppName);
  const normalizedAction = normalize(makeAction);

  // Alias cho các action đặc biệt
  const actionAliases: Record<string, string[]> = {
    messageassistantadvanced: ['askassistant', 'ask_assistant', 'chat', 'assistant', 'message'],
    messageassistant: ['askassistant', 'ask_assistant', 'chat', 'assistant', 'message'],
    chat: ['askassistant', 'ask_assistant', 'chat', 'assistant', 'message'],
    // Thêm các alias khác nếu cần
  };

  // Tách từ khóa hành động (add, insert, create, find, get, ...)
  const actionKeywords = ['add', 'insert', 'create', 'find', 'get', 'update', 'delete'];
  const makeActionKeyword = actionKeywords.find(kw => normalizedAction.startsWith(kw)) || '';

  // 1. Ưu tiên alias đặc biệt
  for (const alias in actionAliases) {
    if (normalizedAction.includes(alias)) {
      for (const apKey in activepiecesMap) {
        const apData = activepiecesMap[apKey];
        const apModule = apData.activepiecesModule || '';
        const apAction = apData.activepiecesAction || apData.actionName || '';
        const moduleNameMatch = apModule.match(/piece-([a-z0-9-]+)/i);
        if (!moduleNameMatch) continue;
        const apAppName = normalize(moduleNameMatch[1]);
        const apActionName = normalize(apAction);

        if (
          (apAppName.includes(normalizedApp) || normalizedApp.includes(apAppName)) &&
          actionAliases[alias].some(aliasWord => apActionName.includes(normalize(aliasWord)))
        ) {
          return activepiecesMap[apKey];
        }
      }
    }
  }

  // 2. Ưu tiên tuyệt đối các actionName có từ khóa hành động gần nghĩa
  let strongCandidates = [];
  for (const apKey in activepiecesMap) {
    const apData = activepiecesMap[apKey];
    const apModule = apData.activepiecesModule || '';
    const apAction = apData.activepiecesAction || apData.actionName || '';

    const moduleNameMatch = apModule.match(/piece-([a-z0-9-]+)/i);
    if (!moduleNameMatch) continue;

    const apAppName = normalize(moduleNameMatch[1]);
    const apActionName = normalize(apAction);

    if (apAppName.includes(normalizedApp) || normalizedApp.includes(apAppName)) {
      const apActionKeyword = actionKeywords.find(kw => apActionName.startsWith(kw)) || '';
      if (
        (makeActionKeyword === 'add' && ['add', 'insert', 'create'].includes(apActionKeyword)) ||
        (makeActionKeyword === 'insert' && ['add', 'insert', 'create'].includes(apActionKeyword)) ||
        (makeActionKeyword === 'create' && ['add', 'insert', 'create'].includes(apActionKeyword))
      ) {
        strongCandidates.push({ apKey, apActionName });
      }
    }
  }

  if (strongCandidates.length > 0) {
    let best = strongCandidates[0];
    let bestScore = levenshtein.get(best.apActionName, normalizedAction);
    for (const cand of strongCandidates) {
      const score = levenshtein.get(cand.apActionName, normalizedAction);
      if (score < bestScore) {
        best = cand;
        bestScore = score;
      }
    }
    return activepiecesMap[best.apKey];
  }

  // 3. Nếu không có strongCandidates, fallback như cũ
  let bestMatchKey = null;
  let bestScore = Infinity;
  for (const apKey in activepiecesMap) {
    const apData = activepiecesMap[apKey];
    const apModule = apData.activepiecesModule || '';
    const apAction = apData.activepiecesAction || apData.actionName || '';

    const moduleNameMatch = apModule.match(/piece-([a-z0-9-]+)/i);
    if (!moduleNameMatch) continue;

    const apAppName = normalize(moduleNameMatch[1]);
    const apActionName = normalize(apAction);

    if (apAppName.includes(normalizedApp) || normalizedApp.includes(apAppName)) {
      const levScore = levenshtein.get(apActionName, normalizedAction);
      if (levScore < bestScore && levScore <= 6) {
        bestScore = levScore;
        bestMatchKey = apKey;
      }
    }
  }
  if (bestMatchKey) return activepiecesMap[bestMatchKey];

  // 4. Nếu vẫn không tìm thấy, thử rút gọn app name
  const shortApp = normalize(makeAppName.split('-')[0]);
  let fallbackCandidates: { apKey: string, apActionName: string }[] = [];
  for (const apKey in activepiecesMap) {
    const apData = activepiecesMap[apKey];
    const apModule = apData.activepiecesModule || '';
    const apAction = apData.activepiecesAction || apData.actionName || '';
    const moduleNameMatch = apModule.match(/piece-([a-z0-9-]+)/i);
    if (!moduleNameMatch) continue;
    const apAppName = normalize(moduleNameMatch[1]);
    const apActionName = normalize(apAction);

    if (apAppName.includes(shortApp) || shortApp.includes(apAppName)) {
      fallbackCandidates.push({ apKey, apActionName });
    }
  }
  if (fallbackCandidates.length > 0) {
    let best = fallbackCandidates[0];
    let bestScore = levenshtein.get(best.apActionName, normalizedAction);
    for (const cand of fallbackCandidates) {
      const score = levenshtein.get(cand.apActionName, normalizedAction);
      if (score < bestScore) {
        best = cand;
        bestScore = score;
      }
    }
    return activepiecesMap[best.apKey];
  }

  // 5. Nếu vẫn không có, thử match actionName gần nhất trong toàn bộ map
  let globalBestKey = null;
  let globalBestScore = Infinity;
  for (const apKey in activepiecesMap) {
    const apData = activepiecesMap[apKey];
    const apAction = apData.activepiecesAction || apData.actionName || '';
    const apActionName = normalize(apAction);
    const levScore = levenshtein.get(apActionName, normalizedAction);
    if (levScore < globalBestScore) {
      globalBestScore = levScore;
      globalBestKey = apKey;
    }
  }
  return globalBestKey ? activepiecesMap[globalBestKey] : null;
};  

const moduleMapping = {
    "make_conditions": {
        "text:equal": {
            "activepieces_condition": "TEXT_EQUALS",
            "params_mapping": {
                "first_value": {
                    "field": "firstValue",
                    "default": "{{previous_step_output}}"
                },
                "second_value": "secondValue",
                "case_sensitive": "caseSensitive"
            }
        },
        "number:greater_than": {
            "activepieces_condition": "NUMBER_GREATER_THAN",
            "params_mapping": {
                "first_value": "firstValue",
                "second_value": "secondValue"
            }
        },
        "number:less_than": {
            "activepieces_condition": "NUMBER_LESS_THAN",
            "params_mapping": {
                "first_value": "firstValue",
                "second_value": "secondValue"
            }
        },
        "boolean:is_true": {
            "activepieces_condition": "BOOLEAN_IS_TRUE",
            "params_mapping": {
                "value": "value"
            }
        },
        "boolean:is_false": {
            "activepieces_condition": "BOOLEAN_IS_FALSE",
            "params_mapping": {
                "value": "value"
            }
        }
    }
};

export const convertMake = async (makeJson: any) => {
    let activepiecesMap: Record<string, any>;
    try {
        const response = await axios.get(API_URL);
        activepiecesMap = response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }

    if (!makeJson.name) {
        console.log(makeJson);
        throw new Error('makeJson hoặc makeJson.name không hợp lệ');
    }
    let stepCounter = 1;

    const activepiecesJson = {
        created: Date.now().toString(),
        updated: Date.now().toString(),
        name: makeJson.name,
        description: makeJson.metadata?.notes || [],
        tags: [],
        pieces: ["@activepieces/piece-schedule"],
        template: {
        displayName: makeJson.name,
        trigger: createTrigger(),
        valid: true,
        schemaVersion: "1"
        }
    };

    function createTrigger() {
        return {
        name: "trigger",
        valid: true,
        displayName: "Every X Minutes",
        type: "PIECE_TRIGGER",
        settings: {
            blockName: "@activepieces/piece-schedule",
            pieceVersion: "~0.1.5",
            blockType: "OFFICIAL",
            packageType: "REGISTRY",
            input: { minutes: 1 },
            inputUiInfo: { customizedInputs: {} },
            triggerName: "every_x_minutes"
        },
        nextAction: null
        };
    }

    async function createPieceAction(module: any) {
        const mapping = await function_mapping({ makeModuleKey: module.module, activepiecesMap });
        
        if (!mapping) return null;
        console.log(mapping);

        const action = {
        name: `step_${stepCounter++}`,
        skip: false,
        type: "PIECE",
        valid: true,
        displayName: mapping.activepiecesAction.toUpperCase(),
        settings: {
            input: {},
            blockName: mapping.activepiecesModule,
            blockType: "OFFICIAL",
            actionName: mapping.activepiecesAction,
            inputUiInfo: { customizedInputs: {} },
            packageType: "REGISTRY",
            pieceVersion: mapping.pieceVersion || "~0.0.11",
            errorHandlingOptions: { retryOnFailure: { value: false }, continueOnFailure: { value: false } }
        },
        nextAction: null
        };
        return action;
    }

    async function createRouterAction(routerModule: any) {
        const router: any = {
        name: `step_${stepCounter++}`,
        type: "ROUTER",
        valid: false,
        displayName: "Condition Router",
        settings: {
            branches: [],
            executionType: "EXECUTE_ALL_MATCH",
            inputUiInfo: { customizedInputs: {} }
        },
        children: [],
        nextAction: null
        };
    
        const totalRoutes = routerModule.routes.length;
        const branchEnds = [];
    
        // Use for...of loop instead of forEach to support async/await
        for (const [idx, route] of routerModule.routes.entries()) {
        const isLast = idx === totalRoutes - 1;
        const branchType = isLast ? 'FALLBACK' : 'CONDITION';
        const branchName = isLast ? 'Otherwise' : `Branch ${idx + 1}`;
    
        // Điều kiện cho branch
        let conditions = [];
        if (!isLast && route.flow[0]?.filter?.conditions?.length) {
            conditions = route.flow[0].filter.conditions.map((group: any) =>
            group.map((cond: any) => ({
                operator: moduleMapping.make_conditions[cond.o as keyof typeof moduleMapping.make_conditions]?.activepieces_condition || 'TEXT_EQUALS',
                firstValue: cond.a,
                secondValue: cond.b,
                caseSensitive: false
            }))
            );
        }
    
        // Tạo linked list cho flow của route
        let firstAction: any = null;
        let lastAction: any = null;

        for (const mod of route.flow) {
            const action = await createPieceAction(mod);  // Await the asynchronous action creation
            if (!action) continue;
            if (!firstAction) {
            firstAction = action;
            } else {
            lastAction.nextAction = action;
            }
            lastAction = action;
        }
    
        if (firstAction) {
            router.children.push(firstAction);
            router.settings.branches.push({
            branchName,
            branchType,
            conditions,
            nextAction: firstAction
            });
            if (lastAction) branchEnds.push(lastAction);
        }
        }
    
        return { action: router, ends: branchEnds };
    }

    // Main flow
    let currentEnds = [];

    for (const module of makeJson.flow) {
        let result = null;

        if (module.module === 'builtin:BasicRouter') {
        result = await createRouterAction(module); // Await the async createRouterAction
        } else {
        const action = await createPieceAction(module); // Await the async createPieceAction
        if (action) {
            result = { action, ends: [action] };
        }
        }

        if (!result) continue;

        if (!currentEnds.length) {
        activepiecesJson.template.trigger.nextAction = result.action;
        } else {
        currentEnds.forEach(end => end.nextAction = result.action);
        }
        currentEnds = result.ends;
    }
    console.log("==========", activepiecesJson);

    // After building the flow, collect all used pieces
    function collectPieces(step: any, set: Set<string>) {
        if (!step || typeof step !== 'object') return;
        if (step.settings && step.settings.blockName) {
            set.add(step.settings.blockName);
        }
        if (Array.isArray(step.children)) {
            for (const child of step.children) {
                collectPieces(child, set);
            }
        }
        if (step.nextAction) {
            collectPieces(step.nextAction, set);
        }
        // For router, also check branches' nextAction
        if (step.settings && Array.isArray(step.settings.branches)) {
            for (const branch of step.settings.branches) {
                if (branch.nextAction) {
                    collectPieces(branch.nextAction, set);
                }
            }
        }
    }

    // Build pieces array
    const piecesSet = new Set<string>();
    if (activepiecesJson.template.trigger) {
        collectPieces(activepiecesJson.template.trigger, piecesSet);
    }
    // Always add schedule piece for trigger
    piecesSet.add('@activepieces/piece-schedule');
    activepiecesJson.pieces = Array.from(piecesSet);

    return activepiecesJson;
};
