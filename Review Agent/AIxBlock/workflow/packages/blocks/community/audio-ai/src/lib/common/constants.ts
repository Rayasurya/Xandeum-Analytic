export enum AiType {
    DEEPSEEK = 'deepseek',
    OPENAI = 'openai',
    GEMINI = 'gemini',
}

export const aiModelOptions: { label: string; value: string; type: AiType }[] = [
    {
        label: 'text-embedding-3-large',
        value: 'text-embedding-3-large',
        type: AiType.OPENAI,
    },
    {
        label: 'gpt-4o-audio-preview-2024-10-01',
        value: 'gpt-4o-audio-preview-2024-10-01',
        type: AiType.OPENAI,
    },
    {
        label: 'gpt-4.1-mini',
        value: 'gpt-4.1-mini',
        type: AiType.OPENAI,
    },
    {
        label: 'gpt-4.1-mini-2025-04-14',
        value: 'gpt-4.1-mini-2025-04-14',
        type: AiType.OPENAI,
    },
    {
        label: 'gpt-4.1-nano',
        value: 'gpt-4.1-nano',
        type: AiType.OPENAI,
    },
    {
        label: 'gpt-4.1-nano-2025-04-14',
        value: 'gpt-4.1-nano-2025-04-14',
        type: AiType.OPENAI,
    },
    {
        label: 'text-embedding-ada-002',
        value: 'text-embedding-ada-002',
        type: AiType.OPENAI,
    },
    {
        label: 'gpt-4o-mini-audio-preview',
        value: 'gpt-4o-mini-audio-preview',
        type: AiType.OPENAI,
    },
    {
        label: 'gpt-4o-audio-preview',
        value: 'gpt-4o-audio-preview',
        type: AiType.OPENAI,
    },
    {
        label: 'o1-preview-2024-09-12',
        value: 'o1-preview-2024-09-12',
        type: AiType.OPENAI,
    },
    {
        label: 'gpt-3.5-turbo-instruct-0914',
        value: 'gpt-3.5-turbo-instruct-0914',
        type: AiType.OPENAI,
    },
    {
        label: 'gpt-4o-mini-search-preview',
        value: 'gpt-4o-mini-search-preview',
        type: AiType.OPENAI,
    },
    {
        label: 'gpt-3.5-turbo-1106',
        value: 'gpt-3.5-turbo-1106',
        type: AiType.OPENAI,
    },
    {
        label: 'gpt-3.5-turbo-instruct',
        value: 'gpt-3.5-turbo-instruct',
        type: AiType.OPENAI,
    },
    {
        label: 'gpt-3.5-turbo',
        value: 'gpt-3.5-turbo',
        type: AiType.OPENAI,
    },
    {
        label: 'gpt-4o-mini-search-preview-2025-03-11',
        value: 'gpt-4o-mini-search-preview-2025-03-11',
        type: AiType.OPENAI,
    },
    {
        label: 'gpt-4o-2024-11-20',
        value: 'gpt-4o-2024-11-20',
        type: AiType.OPENAI,
    },
    {
        label: 'gpt-4.1',
        value: 'gpt-4.1',
        type: AiType.OPENAI,
    },
    {
        label: 'gpt-4.1-2025-04-14',
        value: 'gpt-4.1-2025-04-14',
        type: AiType.OPENAI,
    },
    {
        label: 'gpt-4o-2024-05-13',
        value: 'gpt-4o-2024-05-13',
        type: AiType.OPENAI,
    },
    {
        label: 'gpt-3.5-turbo-16k',
        value: 'gpt-3.5-turbo-16k',
        type: AiType.OPENAI,
    },
    {
        label: 'o1-preview',
        value: 'o1-preview',
        type: AiType.OPENAI,
    },
    {
        label: 'gpt-4o-search-preview',
        value: 'gpt-4o-search-preview',
        type: AiType.OPENAI,
    },
    {
        label: 'gpt-4.5-preview',
        value: 'gpt-4.5-preview',
        type: AiType.OPENAI,
    },
    {
        label: 'gpt-4.5-preview-2025-02-27',
        value: 'gpt-4.5-preview-2025-02-27',
        type: AiType.OPENAI,
    },
    {
        label: 'gpt-4o-search-preview-2025-03-11',
        value: 'gpt-4o-search-preview-2025-03-11',
        type: AiType.OPENAI,
    },
    {
        label: 'omni-moderation-2024-09-26',
        value: 'omni-moderation-2024-09-26',
        type: AiType.OPENAI,
    },
    {
        label: 'text-embedding-3-small',
        value: 'text-embedding-3-small',
        type: AiType.OPENAI,
    },
    {
        label: 'gpt-4o-mini-tts',
        value: 'gpt-4o-mini-tts',
        type: AiType.OPENAI,
    },
    {
        label: 'gpt-4o',
        value: 'gpt-4o',
        type: AiType.OPENAI,
    },
    {
        label: 'gpt-4o-mini',
        value: 'gpt-4o-mini',
        type: AiType.OPENAI,
    },
    {
        label: 'gpt-4o-2024-08-06',
        value: 'gpt-4o-2024-08-06',
        type: AiType.OPENAI,
    },
    {
        label: 'gpt-4o-transcribe',
        value: 'gpt-4o-transcribe',
        type: AiType.OPENAI,
    },
    {
        label: 'gpt-4o-mini-2024-07-18',
        value: 'gpt-4o-mini-2024-07-18',
        type: AiType.OPENAI,
    },
    {
        label: 'gpt-4o-mini-transcribe',
        value: 'gpt-4o-mini-transcribe',
        type: AiType.OPENAI,
    },
    {
        label: 'o1-mini',
        value: 'o1-mini',
        type: AiType.OPENAI,
    },
    {
        label: 'gpt-4o-mini-audio-preview-2024-12-17',
        value: 'gpt-4o-mini-audio-preview-2024-12-17',
        type: AiType.OPENAI,
    },
    {
        label: 'gpt-3.5-turbo-0125',
        value: 'gpt-3.5-turbo-0125',
        type: AiType.OPENAI,
    },
    {
        label: 'o1-mini-2024-09-12',
        value: 'o1-mini-2024-09-12',
        type: AiType.OPENAI,
    },
    {
        label: 'omni-moderation-latest',
        value: 'omni-moderation-latest',
        type: AiType.OPENAI,
    },
    {
        label: 'deepseek-chat',
        value: 'deepseek-chat',
        type: AiType.DEEPSEEK,
    },
    {
        label: 'deepseek-reasoner',
        value: 'deepseek-reasoner',
        type: AiType.DEEPSEEK,
    },
    {
        label: 'gemini-1.5-flash',
        value: 'gemini-1.5-flash',
        type: AiType.GEMINI,
    },
    {
        label: 'Gemini 1.5 Pro Latest',
        value: 'gemini-1.5-pro-latest',
        type: AiType.GEMINI,
    },
    {
        label: 'Gemini 1.5 Pro 001',
        value: 'gemini-1.5-pro-001',
        type: AiType.GEMINI,
    },
    {
        label: 'Gemini 1.5 Pro 002',
        value: 'gemini-1.5-pro-002',
        type: AiType.GEMINI,
    },
    {
        label: 'Gemini 1.5 Pro',
        value: 'gemini-1.5-pro',
        type: AiType.GEMINI,
    },
    {
        label: 'Gemini 1.5 Flash Latest',
        value: 'gemini-1.5-flash-latest',
        type: AiType.GEMINI,
    },
    {
        label: 'Gemini 1.5 Flash 001',
        value: 'gemini-1.5-flash-001',
        type: AiType.GEMINI,
    },
    {
        label: 'Gemini 1.5 Flash 001 Tuning',
        value: 'gemini-1.5-flash-001-tuning',
        type: AiType.GEMINI,
    },
    {
        label: 'Gemini 1.5 Flash',
        value: 'gemini-1.5-flash',
        type: AiType.GEMINI,
    },
    {
        label: 'Gemini 1.5 Flash 002',
        value: 'gemini-1.5-flash-002',
        type: AiType.GEMINI,
    },
    {
        label: 'Gemini 1.5 Flash-8B',
        value: 'gemini-1.5-flash-8b',
        type: AiType.GEMINI,
    },
    {
        label: 'Gemini 1.5 Flash-8B 001',
        value: 'gemini-1.5-flash-8b-001',
        type: AiType.GEMINI,
    },
    {
        label: 'Gemini 1.5 Flash-8B Latest',
        value: 'gemini-1.5-flash-8b-latest',
        type: AiType.GEMINI,
    },
    {
        label: 'Gemini 1.5 Flash 8B Experimental 0827',
        value: 'gemini-1.5-flash-8b-exp-0827',
        type: AiType.GEMINI,
    },
    {
        label: 'Gemini 1.5 Flash 8B Experimental 0924',
        value: 'gemini-1.5-flash-8b-exp-0924',
        type: AiType.GEMINI,
    },
    {
        label: 'Gemini 2.5 Flash Preview 04-17',
        value: 'gemini-2.5-flash-preview-04-17',
        type: AiType.GEMINI,
    },
    {
        label: 'Gemini 2.0 Flash Experimental',
        value: 'gemini-2.0-flash-exp',
        type: AiType.GEMINI,
    },
    {
        label: 'Gemini 2.0 Flash',
        value: 'gemini-2.0-flash',
        type: AiType.GEMINI,
    },
    {
        label: 'Gemini 2.0 Flash 001',
        value: 'gemini-2.0-flash-001',
        type: AiType.GEMINI,
    },
    {
        label: 'Gemini 2.0 Flash (Image Generation) Experimental',
        value: 'gemini-2.0-flash-exp-image-generation',
        type: AiType.GEMINI,
    },
    {
        label: 'Gemini 2.0 Flash-Lite 001',
        value: 'gemini-2.0-flash-lite-001',
        type: AiType.GEMINI,
    },
    {
        label: 'Gemini 2.0 Flash-Lite',
        value: 'gemini-2.0-flash-lite',
        type: AiType.GEMINI,
    },
    {
        label: 'Gemini 2.0 Flash-Lite Preview 02-05',
        value: 'gemini-2.0-flash-lite-preview-02-05',
        type: AiType.GEMINI,
    },
    {
        label: 'Gemini 2.0 Flash-Lite Preview',
        value: 'gemini-2.0-flash-lite-preview',
        type: AiType.GEMINI,
    },
    {
        label: 'Gemini 2.0 Flash Thinking Experimental 01-21',
        value: 'gemini-2.0-flash-thinking-exp-01-21',
        type: AiType.GEMINI,
    },
    {
        label: 'Gemini 2.0 Flash Thinking Experimental 01-21',
        value: 'gemini-2.0-flash-thinking-exp',
        type: AiType.GEMINI,
    },
    {
        label: 'Gemini 2.0 Flash Thinking Experimental',
        value: 'gemini-2.0-flash-thinking-exp-1219',
        type: AiType.GEMINI,
    },
    {
        label: 'Gemini 2.0 Flash 001',
        value: 'gemini-2.0-flash-live-001',
        type: AiType.GEMINI,
    },
];

export const llmModelOptions: { label: string; value: string }[] = [
    {
        label: 'bigscience/bloomz-1b7',
        value: 'bigscience/bloomz-1b7',
    },
    {
        label: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B',
        value: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B',
    },
    {
        label: 'tiiuae/Falcon3-1B-Instruct',
        value: 'tiiuae/Falcon3-1B-Instruct',
    },
    {
        label: 'meta-llama/Llama-3.2-1B-Instruct',
        value: 'meta-llama/Llama-3.2-1B-Instruct',
    },
    {
        label: 'meta-llama/Llama-4-Scout-17B-16E-Instruct',
        value: 'meta-llama/Llama-4-Scout-17B-16E-Instruct',
    },
    {
        label: 'mistralai/Mistral-7B-v0.1',
        value: 'mistralai/Mistral-7B-v0.1',
    },
    {
        label: 'Qwen/Qwen2.5-7B-Instruct-1M',
        value: 'Qwen/Qwen2.5-7B-Instruct-1M',
    },
    {
        label: 'Qwen/Qwen2-1.5B',
        value: 'Qwen/Qwen2-1.5B',
    },
    {
        label: 'Qwen/QwQ-32B',
        value: 'Qwen/QwQ-32B',
    },
    {
        label: 'google/flan-t5-small',
        value: 'google/flan-t5-small',
    },
];

export const deepSeekApiUrl = 'https://api.deepseek.com';
