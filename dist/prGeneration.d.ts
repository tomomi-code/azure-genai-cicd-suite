import { getOctokit } from '@actions/github';
import { AzureOpenAI } from "openai";
export declare function generatePRDescription(client: AzureOpenAI, deployment: string, octokit: ReturnType<typeof getOctokit>): Promise<void>;
