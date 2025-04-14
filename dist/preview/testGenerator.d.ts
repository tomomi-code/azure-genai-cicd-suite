import { AzureOpenAI } from "openai";
import { getOctokit } from "@actions/github";
import { ICompletionModel } from "./languageModel";
import { TestValidator } from "./testValidator";
import { ITestResultCollector } from "./resultCollector";
import { SnippetMap } from "./snippetMap";
import { ICoverageSummary } from './testValidator';
import { ITestInfo } from "./resultCollector";
export declare class TestGenerator {
    private temperatures;
    private snippetMap;
    private model;
    private validator;
    private collector;
    private worklist;
    constructor(temperatures: number[], snippetMap: SnippetMap, model: ICompletionModel, validator: TestValidator, collector: ITestResultCollector);
    generateAndValidateTests(fileMeta: {
        fileName: string;
        filePath: string;
        fileContent: string;
        rootDir: string;
    }, snippets: string[]): Promise<{
        generatedTests: string[];
        coverageSummary: ICoverageSummary;
        testResults: Array<ITestInfo & {
            outcome: {
                status: string;
                error?: string;
            };
        }>;
    }>;
    private validateCompletion;
    private parseExecutableCode;
    private extractFunctions;
}
export declare function generateUnitTestsSuite(client: AzureOpenAI, deployment: string, octokit: ReturnType<typeof getOctokit>, repo: {
    owner: string;
    repo: string;
}, unitTestSourceFolder: string): Promise<void>;
export declare function generateTestCasesForFile(client: AzureOpenAI, modelId: string, fileMeta: {
    fileName: string;
    filePath: string;
    fileContent: string;
    rootDir: string;
}): Promise<{
    generatedTests: string[];
    coverageSummary: ICoverageSummary;
    testResults: Array<ITestInfo & {
        outcome: {
            status: string;
            error?: string;
        };
    }>;
}>;
