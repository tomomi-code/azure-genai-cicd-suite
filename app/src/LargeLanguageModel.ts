
import { AzureOpenAI } from 'openai';
import { invokeModel } from '../../src/utils';

export class LargeLanguageModel {
  private client: AzureOpenAI;
  private deployment: string;

  constructor(client: AzureOpenAI, deployment: string) {
    this.client = client;
    this.deployment = deployment;
  }

  async classify(prompt: string): Promise<string> {
    try {
      const result = await invokeModel(this.client, this.deployment, prompt);
      return result.trim();
    } catch (error) {
      console.error('Error occurred while classifying:', error);
      throw error;
    }
  }
}
