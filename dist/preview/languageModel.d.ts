import { AzureOpenAI } from 'openai';
export interface ICompletionModel {
    getCompletions(prompt: string, deployment: string, temperature: number): Promise<string[]>;
}
export declare class LanguageModel implements ICompletionModel {
    private client;
    private deployment;
    constructor(client: AzureOpenAI, deployment: string);
    getCompletions(prompt: string, deployment: string, temperature: number): Promise<string[]>;
}
