import { AzureOpenAI } from 'openai';
import { invokeModel } from "../utils";

export interface ICompletionModel {
    getCompletions(prompt: string, deployment: string, temperature: number): Promise<string[]>;
}

export class LanguageModel implements ICompletionModel {
    constructor(
        private client: AzureOpenAI,
        private deployment: string
    ) {}

    async getCompletions(prompt: string, deployment: string, temperature: number): Promise<string[]> {
        try {
            const completion = await invokeModel(this.client, this.deployment, prompt, temperature);
            // return the array of completions, only one completion for now
            return [completion];
        } catch (error) {
            console.error("Error getting completions:", error);
            return [];
        }
    }
}