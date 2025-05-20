// use server'
'use server';
/**
 * @fileOverview An AI agent to suggest upsells and modifiers based on the current order.
 *
 * - getUpsellSuggestions - A function that handles the upsell suggestion process.
 * - GetUpsellSuggestionsInput - The input type for the getUpsellSuggestions function.
 * - GetUpsellSuggestionsOutput - The return type for the getUpsellSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetUpsellSuggestionsInputSchema = z.object({
  orderDescription: z
    .string()
    .describe('The description of the current order, including items and modifiers.'),
});
export type GetUpsellSuggestionsInput = z.infer<
  typeof GetUpsellSuggestionsInputSchema
>;

const GetUpsellSuggestionsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('An array of upsell and modifier suggestions.'),
});
export type GetUpsellSuggestionsOutput = z.infer<
  typeof GetUpsellSuggestionsOutputSchema
>;

export async function getUpsellSuggestions(
  input: GetUpsellSuggestionsInput
): Promise<GetUpsellSuggestionsOutput> {
  return getUpsellSuggestionsFlow(input);
}

const upsellSuggestionsPrompt = ai.definePrompt({
  name: 'upsellSuggestionsPrompt',
  input: {schema: GetUpsellSuggestionsInputSchema},
  output: {schema: GetUpsellSuggestionsOutputSchema},
  prompt: `You are a POS system designed to assist servers by suggesting relevant upsells and modifiers for the current order to increase the average transaction value and improve customer satisfaction.

  Based on the current order description, suggest relevant upsells and modifiers.

  Current order: {{{orderDescription}}}

  Return an array of suggestions.
  `,
});

const getUpsellSuggestionsFlow = ai.defineFlow(
  {
    name: 'getUpsellSuggestionsFlow',
    inputSchema: GetUpsellSuggestionsInputSchema,
    outputSchema: GetUpsellSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await upsellSuggestionsPrompt(input);
    return output!;
  }
);
