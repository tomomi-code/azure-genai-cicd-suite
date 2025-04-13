import { invokeModel } from './utils';
import { AzureOpenAI } from "openai";
import 'dotenv/config';

async function testInvokeModel() {
  try {
    // Set up environment variables for testing
    const apiKey = process.env['AZURE_OPENAI_API_KEY'];
    const endpoint = process.env['AZURE_OPENAI_ENDPOINT'];
    const apiVersion: string = process.env['AZURE_OPENAI_API_VERSION'] || '2023-05-15'; // Replace with your Azure OpenAI API version
    const deployment: string = process.env['AZURE_OPENAI_DEPLOYMENT'] || 'gpt-35-turbo'; // Replace with your Azure OpenAI deployment name

    if (!apiKey || !endpoint) {
      throw new Error('Missing required environment variables: AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT');
    }

    // create a client
    const azClient = new AzureOpenAI({ apiKey, endpoint, apiVersion });

    // Define test parameters
    const payloadInput = 'Write a function to calculate the factorial of a number.';
    const temperature: number = 0.7;

    // Call the invokeModel function
    const result = await invokeModel(azClient, deployment, payloadInput, temperature);

    // Log the result
    console.log('Generated Text:', result);
  } catch (error) {
    console.error('Error during invokeModel test:', error);
  }
}

// Run the test
testInvokeModel();