import { ImportTemplateType } from 'workflow-shared';

export const checkTemplateType = (template: any) => {
    try {
        if (
            'nodes' in template &&
            'connections' in template &&
            // 'pinData' in template &&
            Array.isArray(template.nodes) &&
            template.nodes.every((item: any) => item.name.includes('n8n') || item.name.includes('n9n') || item.type.includes('n8n'))
        ) {
            return ImportTemplateType.N8N;
        }

        if (
            'flow' in template &&
            Array.isArray(template.flow) &&
            template.flow.every((item: any) => 'module' in item) &&
            'scenario' in template.metadata
        ) {
            return ImportTemplateType.MAKE;
        }

        if ('triggers' in template || 'actions' in template || 'searches' in template || 'platformVersion' in template) {
            return ImportTemplateType.ZAPIER;
        }

        return ImportTemplateType.LOCAL;
    } catch (error) {
        console.error('Error when check template type', error);
    }
};
