import { AzureOpenAI } from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat";

// Define the LanguageCode type
export type LanguageCode = 'en' | 'zh' | 'ja' | 'es' | 'fr' | 'de' | 'it';

// Full definition of PullRequest from GitHub API can be found at https://gist.github.com/GuillaumeFalourd/e53ec9b6bc783cce184bd1eec263799d
export interface PullRequest {
  title: string;
  number: number;
  body: string;
  head: {
    sha: string;
    ref: string;
  };
  base: {
    sha: string;
  };
}

export interface PullFile {
  filename: string;
  status: string;
  patch?: string;
}

// Update the languageCodeToName object with the correct type
export const languageCodeToName: Record<LanguageCode, string> = {
  'en': 'English',
  'zh': 'Chinese',
  'ja': 'Japanese',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
};

// This function splits the content into chunks of maxChunkSize
export function splitContentIntoChunks_deprecated(content: string, maxChunkSize: number): string[] {
  const chunks: string[] = [];
  let currentChunk = '';

  content.split('\n').forEach(line => {
    if (currentChunk.length + line.length > maxChunkSize) {
      chunks.push(currentChunk);
      currentChunk = '';
    }
    currentChunk += line + '\n';
  });

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

export function shouldExcludeFile(filename: string, excludePatterns: string[]): boolean {
  return excludePatterns.some(pattern => {
    const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
    return regex.test(filename);
  });
}

export function splitIntoSoloFile(combinedCode: string): Record<string, string> {
  // split the whole combinedCode content into individual files (index.ts, index_test.ts, index.js) by recognize the character like: "// File: ./index.ts", filter the content with suffix ".tx" and not contain "test" in file name (index.ts),
  const fileChunks: Record<string, string> = {};
  const filePattern = /\/\/ File: \.\/(.+)/;
  let currentFile = '';
  let currentContent = '';

  combinedCode.split('\n').forEach(line => {
    const match = line.match(filePattern);
    if (match) {
      if (currentFile) {
        fileChunks[currentFile] = currentContent.trim();
      }
      currentFile = match[1] as string;
      currentContent = '';
    } else {
      currentContent += line + '\n';
    }
  });

  if (currentFile) {
    fileChunks[currentFile] = currentContent.trim();
  }
  return fileChunks;
}

export async function extractFunctions(content: string): Promise<string[]> {
  // const functionPattern = /(?:export\s+)?(?:async\s+)?function\s+\w+\s*\([^)]*\)(?:\s*:\s*[^{]*?)?\s*{(?:[^{}]*|\{(?:[^{}]*|\{[^{}]*\})*\})*}/gs;
  // const matches = content.match(functionPattern);
  // return matches ? matches.map(match => match.trim()) : [];

  // Dummy response for debugging purposes
  return [
    'export async function generateUnitTests(client: BedrockRuntimeClient, modelId: string, sourceCode: string): Promise<TestCase[]> { ... }',
    'async function runUnitTests(testCases: TestCase[], sourceCode: string): Promise<void> { ... }',
    'function generateTestReport(testCases: TestCase[]): Promise<void> { ... }',
  ];
}

export async function exponentialBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  initialDelay: number,
  functionName: string
): Promise<T> {
  let retries = 0;
  while (true) {
    try {
      const result = await fn();
      console.log(`Function '${functionName}' executed successfully on attempt ${retries + 1}`);
      return result;
    } catch (error) {
      if (retries >= maxRetries) {
        console.error(`Max retries (${maxRetries}) reached for function '${functionName}'. Throwing error.`);
        throw error;
      }
      const delay = initialDelay * Math.pow(2, retries);
      console.log(`Attempt ${retries + 1} for function '${functionName}' failed. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      retries++;
    }
  }
}

export async function invokeModel(client: AzureOpenAI, deployment: string, payloadInput: string, temperature: number = 0.6): Promise<string> {
  const maxRetries = 3;
  const initialDelay = 5000; // 5 seconds

  const invokeWithRetry = async (): Promise<string> => {
    try {
      const messages: ChatCompletionMessageParam[]  = [
        {
          role: "system",
          content: "You are a helpful assistant.",
        },
        {
          role: "user",
          content: payloadInput,
        },
      ];

      // Call the chat completions API using the deployment name
      const response = await client.chat.completions.create({ 
        messages, 
        model: deployment, 
        max_tokens: 4096,
        temperature: temperature
      });

      // Extract the generated text from the response
      const finalResult = response.choices?.[0]?.message?.content?.trim() ?? '';
      return finalResult;
    } catch (error) {
      console.error('Error occurred while invoking the model:', error);
      throw error;
    }
  };
  return exponentialBackoff(invokeWithRetry, maxRetries, initialDelay, invokeModel.name);
}