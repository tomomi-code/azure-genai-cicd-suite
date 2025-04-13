import * as core from '@actions/core';
import { getOctokit, context } from '@actions/github';
import { AzureOpenAI } from "openai";
import 'dotenv/config';

// current we support typescript and python, while the python library is not available yet, we will use typescript as the default language
// using abosolute path to import the functions from testGenerator.ts
import { generatePRDescription } from '@/src/prGeneration';
import { generateCodeReviewComment } from '@/src/codeReviewInline';
import { generateUnitTestsSuite } from '@/src/preview/testGenerator';
import { PullRequest } from '@/src/utils';

async function run(): Promise<void> {
  try {
    console.log('Starting the GitHub Action... version 0.1c');

    const githubToken = core.getInput('github-token');

    // TODO replace with token
    const apiKey = core.getInput('azure-openai-api-key');
    const endpoint = core.getInput('azure-openai-endpoint');
    const apiVersion: string = core.getInput('azure-openai-api-version') || '2024-04-01-preview'; // Replace with your Azure OpenAI API version
    const deployment: string = core.getInput('azure-openai-deployment') || 'gpt-35-turbo'; // Replace with your Azure OpenAI deployment name
    const temperature = core.getInput('azure-openai-temperature') || '0.8'; // TODO where is this used?

    const excludeFiles = core.getInput('generate-code-review-exclude-files');
    const excludePatterns = excludeFiles ? excludeFiles.split(',').map(p => p.trim()) : [];
    const reviewLevel = core.getInput('generate-code-review-level');
    const generateCodeReview = core.getInput('generate-code-review');
    const generatePrDescription = core.getInput('generate-pr-description');
    const generateUnitTest = core.getInput('generate-unit-test');
    const outputLanguage = core.getInput('output-language');
    const unitTestSourceFolder = core.getInput('generate-unit-test-source-folder');
    const unitTestExcludeFiles = core.getInput('generate-unit-test-exclude-files');
    const unitTestExcludePatterns = unitTestExcludeFiles ? unitTestExcludeFiles.split(',').map(p => p.trim()) : [];

    console.log(`GitHub Token: ${githubToken ? 'Token is set' : 'Token is not set'}`);

    // Azure configuration
    console.log(`apiKey: ${apiKey}`)
    console.log(`Endpoint: ${endpoint}`);
    console.log(`API Version: ${apiVersion}`);
    console.log(`Deployment: ${deployment}`);

    console.log(`Excluded files: ${excludeFiles}`);
    console.log(`Code review: ${generateCodeReview}`);
    console.log(`Output language: ${outputLanguage}`);
    console.log(`Review level: ${reviewLevel}`);
    console.log(`Generate PR description: ${generatePrDescription.toLowerCase() === 'true' ? 'true' : 'false'}`);
    console.log(`Generate unit test suite: ${generateUnitTest.toLowerCase() === 'true' ? 'true' : 'false'}`);
    console.log(`Generate unit test source folder: ${unitTestSourceFolder}`);
    console.log(`Generate unit test exclude files: ${unitTestExcludeFiles}`);

    if (!githubToken) {
      throw new Error('GitHub token is not set');
    }

    const azClient = new AzureOpenAI({ apiKey, endpoint, apiVersion });
    const octokit = getOctokit(githubToken);

    if (!context.payload.pull_request) {
      console.log('No pull request found in the context. This action should be run only on pull request events.');
      return;
    }

    const pullRequest = context.payload.pull_request as PullRequest;
    const repo = context.repo;

    console.log(`Reviewing PR #${pullRequest.number} in ${repo.owner}/${repo.repo}`);

    // branch to generate PR description
    if (generatePrDescription.toLowerCase() === 'true') {
      await generatePRDescription(azClient, deployment, octokit);
    }

    // branch to generate code review comments
    if (generateCodeReview.toLowerCase() === 'true') {
      await generateCodeReviewComment(azClient, deployment, octokit, excludePatterns, reviewLevel, outputLanguage);
    }

    // branch to generate unit tests suite
    if (generateUnitTest.toLowerCase() === 'true') {
      console.log('Start to generate unit test suite');
      if (!unitTestSourceFolder) {
        throw new Error('Test folder path is not specified');
      }
      /* 
      export async function generateUnitTestsSuite(
        client: BedrockRuntimeClient,
        modelId: string,
        octokit: ReturnType<typeof getOctokit>,
        excludePatterns: string[],
        repo: { owner: string, repo: string },
        unitTestSourceFolder: string
      )  
      */
      await generateUnitTestsSuite(azClient, deployment, octokit, repo, unitTestSourceFolder);
    }

  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(`Error: ${error.message}`);
      console.error('Stack trace:', error.stack);
    } else {
      core.setFailed('An unknown error occurred');
    }
  }
}

run();
