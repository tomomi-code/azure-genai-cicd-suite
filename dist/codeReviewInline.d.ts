import { getOctokit } from '@actions/github';
import { AzureOpenAI } from "openai";
export declare function generateCodeReviewComment(azClient: AzureOpenAI, deployment: string, octokit: ReturnType<typeof getOctokit>, excludePatterns: string[], reviewLevel: string, outputLanguage: string): Promise<void>;
