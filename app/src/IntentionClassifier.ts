import { AzureOpenAI } from 'openai';
import { Inputs, Prompts } from '../../src/prompts';
import { invokeModel } from '../../src/utils';

export class IntentionClassifier {
  private client: AzureOpenAI;
  private deployment: string;

  constructor(client: AzureOpenAI, deployment: string) {
    this.client = client;
    this.deployment = deployment;
  }

  async classify(query: string, context: any): Promise<string> {
    const inputs = new Inputs();
    const prompts = new Prompts();

    inputs.userQuery = query;
    const prompt = prompts.renderIntentionClassificationPrompt(inputs);
    console.log('Intention classification prompt: ', prompt);

    const result = await invokeModel(this.client, this.deployment, prompt);
    return result;
  }
}
