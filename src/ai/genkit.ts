
import {genkit, type GenkitPlugin, type ModelReference} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {config} from 'dotenv';

config(); // Ensure .env variables are loaded

const plugins: GenkitPlugin[] = [];
let defaultModel: ModelReference | undefined = undefined;

if (process.env.AI_PROVIDER_API_KEY) {
  try {
    plugins.push(googleAI({apiKey: process.env.AI_PROVIDER_API_KEY}));
    defaultModel = 'googleai/gemini-2.0-flash'; // Set default model only if Google AI is configured
    console.log('Google AI plugin configured with AI_PROVIDER_API_KEY.');
  } catch (error) {
    console.error('Error initializing Google AI plugin. AI features may not be available.', error);
  }
} else {
  console.warn(
    'AI_PROVIDER_API_KEY not found in environment. AI features using Google AI will be unavailable. If you intend to use Google AI, please set this key in your .env file.'
  );
}

export const ai = genkit({
  plugins: plugins,
  model: defaultModel, // This can be undefined if no key, causing AI calls to fail as no model is configured
});
