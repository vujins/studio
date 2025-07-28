'use server';

/**
 * @fileOverview A shopping list generation AI agent.
 *
 * - generateShoppingList - A function that handles the shopping list generation process.
 * - GenerateShoppingListInput - The input type for the generateShoppingList function.
 * - GenerateShoppingListOutput - The return type for the generateShoppingList function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IngredientSchema = z.object({
  name: z.string().describe('The name of the ingredient.'),
  unit: z.string().describe('The unit of measurement for the ingredient (e.g., kg, lb, oz).'),
  market: z.string().describe('The market where the ingredient is purchased.'),
});

const RecipeSchema = z.object({
  name: z.string().describe('The name of the recipe.'),
  ingredients: z.array(z.object({
    ingredient: IngredientSchema,
    quantity: z.number().describe('The quantity of the ingredient required for the recipe.'),
  })).describe('The list of ingredients required for the recipe.'),
});

const MealSchema = z.object({
  mealType: z.string().describe('The type of meal (e.g., breakfast, lunch, dinner).'),
  recipe: RecipeSchema.describe('The recipe assigned to this meal.'),
});

const DailyScheduleSchema = z.object({
  dayOfWeek: z.string().describe('The day of the week (e.g., Monday, Tuesday).'),
  meals: z.array(MealSchema).describe('The list of meals for the day.'),
});

const GenerateShoppingListInputSchema = z.object({
  weeklySchedule: z.array(DailyScheduleSchema).describe('The weekly meal schedule.'),
});
export type GenerateShoppingListInput = z.infer<typeof GenerateShoppingListInputSchema>;

const ShoppingListSchema = z.record(z.string(), z.array(z.object({
    name: z.string(),
    quantity: z.number(),
    unit: z.string(),
})).describe('List of ingredients needed from this market')).describe('Shopping list grouped by market');

const GenerateShoppingListOutputSchema = ShoppingListSchema
export type GenerateShoppingListOutput = z.infer<typeof GenerateShoppingListOutputSchema>;


export async function generateShoppingList(input: GenerateShoppingListInput): Promise<GenerateShoppingListOutput> {
  return generateShoppingListFlow(input);
}

const generateShoppingListPrompt = ai.definePrompt({
  name: 'generateShoppingListPrompt',
  input: {schema: GenerateShoppingListInputSchema},
  output: {schema: GenerateShoppingListOutputSchema},
  prompt: `You are a helpful shopping list assistant.  You will take a weekly meal schedule and generate a shopping list grouped by market.

Weekly Schedule:
{{#each weeklySchedule}}
  {{dayOfWeek}}:
  {{#each meals}}
    {{mealType}}: {{recipe.name}}
    Ingredients:
    {{#each recipe.ingredients}}
      - {{quantity}} {{ingredient.unit}} of {{ingredient.name}} (from {{ingredient.market}})
    {{/each}}
  {{/each}}
{{/each}}


Generate a shopping list grouped by market, including the quantity and unit for each ingredient:

Output format:
{
  "Market Name": [
    {
      "name": "Ingredient Name",
      "quantity": Quantity,
      "unit": "Unit"
    },
    ...
  ],
  ...
}

Here is the shopping list:
`,
});

const generateShoppingListFlow = ai.defineFlow(
  {
    name: 'generateShoppingListFlow',
    inputSchema: GenerateShoppingListInputSchema,
    outputSchema: GenerateShoppingListOutputSchema,
  },
  async input => {
    const {output} = await generateShoppingListPrompt(input);
    return output!;
  }
);
