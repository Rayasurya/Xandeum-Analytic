import axios from 'axios';
import levenshtein from 'fast-levenshtein';

const API_URL =
  (typeof window !== 'undefined' && (window as any).API_URL)
    ? (window as any).API_URL
    : (typeof window !== 'undefined'
        ? window.location.origin + '/api/v1/aixblock/mapping-pieces-metadata'
        : 'http://127.0.0.1:4200/api/v1/aixblock/mapping-pieces-metadata');

// Hàm tìm kiếm hành động và module trong Activepieces
function normalize(str: string): string {
  return str.toLowerCase().replace(/[_\-\s]/g, '').replace(/[^a-z0-9]/g, '');
}

const function_mapping = async (
    inputs: {
      n8nNodeKey: string;
      activepiecesMap: Record<string, any>;
    }
  ): Promise<any | null> => {
  const { n8nNodeKey, activepiecesMap } = inputs;

  // Thêm cấu hình "builtin:BasicRouter"
  activepiecesMap['builtin:BasicRouter'] = {
    activepieces_module: "@activepieces/piece-router",
    activepieces_action: "basic_router",
    router_config: {
      fallback_branch_name: "Otherwise",
      execution_type: "EXECUTE_FIRST_MATCH"
    }
  };

  const [n8nAppName, n8nAction] = n8nNodeKey.split(":");
  const normalizedApp = normalize(n8nAppName);
  const normalizedAction = normalize(n8nAction);

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
  const shortApp = normalize(n8nAppName.split('-')[0]);
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

export const convertN8n = async (n8nJson: any) => {
    let activepiecesMap: Record<string, any>;
    try {
        const response = await axios.get(API_URL);
        activepiecesMap = response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }

    // Helper: build a map from node name to node object
    const nodeMap: Record<string, any> = {};
    for (const node of n8nJson.nodes) {
        nodeMap[node.name] = node;
    }

    // Helper: build a map from node id to node object
    const nodeIdMap: Record<string, any> = {};
    for (const node of n8nJson.nodes) {
        nodeIdMap[node.id] = node;
    }

    // Helper: get next nodes from connections
    function getNextNodes(nodeName: string): string[] {
        const conns = n8nJson.connections[nodeName]?.main || [];
        const result: string[] = [];
        for (const branch of conns as any[]) {
            for (const conn of (branch || []) as any[]) {
                result.push(conn.node);
            }
        }
        return result;
    }

    // Helper: get next nodes for router/if (returns array of arrays for branches)
    function getNextBranches(nodeName: string): string[][] {
        const conns = n8nJson.connections[nodeName]?.main || [];
        return (conns as any[]).map((branch: any) => (branch || []).map((conn: any) => conn.node));
    }

    // Helper: generate step name
    let stepCounter = 1;
    function genStepName() {
        return `step_${stepCounter++}`;
    }

    // Build step recursively
    async function buildStep(nodeName: string): Promise<any> {
        const node = nodeMap[nodeName];
        // console.log("node", node);
        if (!node) return null;
        const nodeType = node?.type?.split('.')?.[1] || 'unknown';
        let step: any = null;
        let stepName = genStepName();

        const nextNodes = getNextNodes(nodeName);

        // Nếu có nhiều nextNodes (không chỉ IF), sinh ROUTER tổng hợp
        if (nextNodes.length > 1 && nodeType !== 'if') {
            step = {
                name: stepName,
                type: "ROUTER",
                valid: false,
                children: [],
                settings: {
                    branches: [],
                    inputUiInfo: { customizedInputs: {} },
                    executionType: "EXECUTE_ALL_MATCH"
                },
                nextAction: null
            };
            for (let i = 0; i < nextNodes.length; ++i) {
                const branchNodeName = nodeMap[nextNodes[i]].name;
                const branchChild = await buildStep(branchNodeName);
                const branchName = `Branch ${i + 1}`;
                step.settings.branches.push({
                    branchName,
                    branchType: "CONDITION",
                    conditions: [],
                    nextAction: branchChild
                });
                if (branchChild) step.children.push(branchChild);
            }
            return step;
        }

        if (nodeType === 'code') {
            step = {
                name: stepName,
                skip: false,
                type: "CODE",
                valid: true,
                settings: {
                    input: {},
                    sourceCode: {
                        code: node.parameters?.jsCode || "export const code = async (inputs) => {\n  return true;\n};",
                        packageJson: "{}"
                    },
                    inputUiInfo: { customizedInputs: {} },
                    errorHandlingOptions: {
                        retryOnFailure: { value: false },
                        continueOnFailure: { value: false }
                    }
                },
                nextAction: null
            };
        } else if (nodeType === 'if') {
            // Router/IF node
            step = {
                name: stepName,
                type: "ROUTER",
                valid: false,
                children: [],
                settings: {
                    branches: [],
                    inputUiInfo: { customizedInputs: {} },
                    executionType: "EXECUTE_ALL_MATCH"
                },
                nextAction: null
            };
            // Build branches
            const branches = getNextBranches(nodeName);
            for (let i = 0; i < branches.length; ++i) {
                const branchNodes = branches[i];
                let branchName = i === branches.length - 1 ? "Otherwise" : `Branch ${i + 1}`;
                let branchType = i === branches.length - 1 ? "FALLBACK" : "CONDITION";
                let branchConditions: any[][] = [];
                if (branchType === "CONDITION" && node.parameters?.conditions?.conditions) {
                    branchConditions = [node.parameters.conditions.conditions.map((cond: any) => ({
                        operator: "TEXT_EQUALS", // TODO: mapping operator
                        firstValue: cond.leftValue,
                        secondValue: cond.rightValue,
                        caseSensitive: node.parameters.conditions.options?.caseSensitive || false
                    }))];
                }
                // Build branch nextAction/children
                let branchChild: any = null;
                if (branchNodes.length > 0) {
                    branchChild = await buildStep(nodeMap[branchNodes[0]].name);
                }
                step.settings.branches.push({
                    branchName,
                    branchType,
                    conditions: branchConditions,
                    nextAction: branchChild
                });
                if (branchChild) step.children.push(branchChild);
            }
        } else {
            // PIECE node
            let n8nNodeKey = `${nodeType}:default`;
            if (node.parameters?.resource) {
                n8nNodeKey = `${nodeType}:${node.parameters.resource}`;
            } else if (node.parameters?.operation) {
                n8nNodeKey = `${nodeType}:${node.parameters.operation}`;
            }
            // console.log("n8nNodeKey", n8nNodeKey);
            const mapping = await function_mapping({
                n8nNodeKey,
                activepiecesMap
            });
            let blockName = mapping?.activepiecesModule || "@activepieces/piece-http";
            let actionName = mapping?.activepiecesAction || "get_request";
            let pieceVersion = mapping?.pieceVersion || "~0.0.11";
            step = {
                name: stepName,
                skip: false,
                type: "PIECE",
                valid: true,
                settings: {
                    input: {},
                    blockName,
                    blockType: "OFFICIAL",
                    actionName,
                    inputUiInfo: { customizedInputs: {} },
                    packageType: "REGISTRY",
                    pieceVersion,
                    errorHandlingOptions: {
                        retryOnFailure: { value: false },
                        continueOnFailure: { value: false }
                    }
                },
                nextAction: null,
                displayName: actionName.toUpperCase()
            };
        }
        // Build nextAction (for linear flow)
        if (nextNodes.length === 1 && step.type !== "ROUTER") {
            step.nextAction = await buildStep(nodeMap[nextNodes[0]].name);
        }
        return step;
    }

    // Find all entry nodes (nodes that are not pointed to by any connection)
    const allNodeNames = n8nJson.nodes.map((n: any) => n.name);
    const pointedNodeNames = new Set<string>();
    for (const connKey in n8nJson.connections) {
        const conns = n8nJson.connections[connKey]?.main || [];
        for (const branch of conns as any[]) {
            for (const conn of (branch || []) as any[]) {
                pointedNodeNames.add(conn.node);
            }
        }
    }
    const entryNodeNames = allNodeNames.filter((name: string) => !pointedNodeNames.has(name));

    let triggerStep = null;
    if (entryNodeNames.length > 1) {
        // Tìm node trigger thực sự (nếu có)
        const triggerNode = n8nJson.nodes.find((n: any) => n.type.toLowerCase().includes('trigger'));
        if (triggerNode) {
            // Build trigger như cũ
            triggerStep = {
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
        } else {
            // Nếu không có trigger thực sự, tạo trigger dummy
            triggerStep = {
                name: "trigger",
                valid: true,
                displayName: "Start",
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
        // Build a router as the root, gán vào nextAction của trigger
        const routerStep = {
            name: genStepName(),
            type: "ROUTER",
            valid: false,
            children: [] as any[],
            settings: {
                branches: [] as any[],
                inputUiInfo: { customizedInputs: {} },
                executionType: "EXECUTE_ALL_MATCH"
            },
            nextAction: null
        };
        for (let i = 0; i < entryNodeNames.length; ++i) {
            const branchChild = await buildStep(entryNodeNames[i]);
            const branchName = `Branch ${i + 1}`;
            routerStep.settings.branches.push({
                branchName,
                branchType: "CONDITION",
                conditions: [],
                nextAction: branchChild
            });
            if (branchChild) routerStep.children.push(branchChild);
        }
        triggerStep.nextAction = routerStep as any;
    } else {
        // Find trigger node (node type includes 'trigger')
        const triggerNode = n8nJson.nodes.find((n: any) => n.type.toLowerCase().includes('trigger'));
        if (triggerNode) {
            // Build trigger
            triggerStep = {
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
            // Build nextAction from trigger
            const nextNodes = getNextNodes(triggerNode.name);
            if (nextNodes.length > 1) {
                // Build a router right after trigger
                const routerStep = {
                    name: genStepName(),
                    type: "ROUTER",
                    valid: false,
                    children: [] as any[],
                    settings: {
                        branches: [] as any[],
                        inputUiInfo: { customizedInputs: {} },
                        executionType: "EXECUTE_ALL_MATCH"
                    },
                    nextAction: null
                };
                for (let i = 0; i < nextNodes.length; ++i) {
                    const branchNodeName = nodeMap[nextNodes[i]].name;
                    const branchChild = await buildStep(branchNodeName);
                    const branchName = `Branch ${i + 1}`;
                    routerStep.settings.branches.push({
                        branchName,
                        branchType: "CONDITION",
                        conditions: [],
                        nextAction: branchChild
                    });
                    if (branchChild) routerStep.children.push(branchChild);
                }
                triggerStep.nextAction = routerStep as any;
            } else if (nextNodes.length === 1) {
                triggerStep.nextAction = await buildStep(nodeMap[nextNodes[0]].name);
            }
        }
    }

    // Build pieces array by traversing all steps
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

    const piecesSet = new Set<string>();
    if (triggerStep) {
        collectPieces(triggerStep, piecesSet);
    }
    // Always add schedule piece for trigger
    piecesSet.add('@activepieces/piece-schedule');
    const pieces = Array.from(piecesSet);

    const activepiecesJson = {
        created: Date.now().toString(),
        updated: Date.now().toString(),
        name: n8nJson.name || "Imported Workflow",
        description: n8nJson.description || [],
        tags: n8nJson.tags || [],
        pieces,
        template: {
            displayName: n8nJson.name || "Imported Workflow",
            trigger: triggerStep,
            valid: triggerStep ? triggerStep.valid : false,
            schemaVersion: "1"
        }
    };

    console.log("==========", activepiecesJson);

    return activepiecesJson;
};
