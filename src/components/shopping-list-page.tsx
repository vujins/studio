'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Zap, Loader2 } from 'lucide-react';
import { useAppContext } from '@/context/app-context';
import { generateShoppingList, GenerateShoppingListInput, GenerateShoppingListOutput } from '@/ai/flows/generate-shopping-list';
import { useToast } from '@/hooks/use-toast';

const ShoppingListPage = () => {
    const { schedule, recipes, ingredients } = useAppContext();
    const { toast } = useToast();
    const [shoppingList, setShoppingList] = useState<GenerateShoppingListOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateList = async () => {
        setIsLoading(true);
        setShoppingList(null);

        try {
            const weeklyScheduleForAI: GenerateShoppingListInput['weeklySchedule'] = schedule.map(day => {
                return {
                    dayOfWeek: day.dayOfWeek,
                    meals: day.meals
                        .filter(meal => meal.recipeId)
                        .map(meal => {
                            const recipe = recipes.find(r => r.id === meal.recipeId);
                            if (!recipe) {
                                return null;
                            }
                            
                            return {
                                mealType: meal.mealType,
                                recipe: {
                                    name: recipe.name,
                                    ingredients: recipe.ingredients.map(recipeIngredient => {
                                        const ingredient = ingredients.find(i => i.id === recipeIngredient.ingredientId);
                                        return {
                                            ingredient: {
                                                name: ingredient?.name || 'Unknown',
                                                unit: ingredient?.unit || 'unit',
                                                market: ingredient?.market || 'Unknown Market'
                                            },
                                            quantity: recipeIngredient.quantity
                                        };
                                    }).filter(i => i.ingredient.name !== 'Unknown')
                                }
                            };
                        }).filter((meal): meal is NonNullable<typeof meal> => meal !== null)
                };
            });

            const input: GenerateShoppingListInput = { weeklySchedule: weeklyScheduleForAI };
            const result = await generateShoppingList(input);
            setShoppingList(result);
            toast({
                title: 'Shopping List Generated!',
                description: 'Your shopping list is ready.',
            });
        } catch (error) {
            console.error('Error generating shopping list:', error);
            toast({
                title: 'Generation Failed',
                description: 'Could not generate the shopping list. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="container mx-auto">
            <div className="flex flex-col items-center text-center mb-8">
                <h1 className="text-3xl font-bold font-headline mb-2">Shopping List Generator</h1>
                <p className="text-muted-foreground max-w-2xl">
                    Automatically create a consolidated shopping list from your weekly meal schedule. Our AI assistant will group all the necessary ingredients by market for your convenience.
                </p>
                <Button 
                    onClick={handleGenerateList} 
                    disabled={isLoading} 
                    className="mt-6"
                    style={{backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)'}}
                    size="lg"
                >
                    {isLoading ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                        <Zap className="mr-2 h-5 w-5" />
                    )}
                    {isLoading ? 'Generating...' : 'Generate with AI'}
                </Button>
            </div>

            {shoppingList ? (
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(shoppingList).map(([market, items]) => (
                        <Card key={market}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ShoppingCart className="h-5 w-5" />
                                    {market}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {items.map((item, index) => (
                                        <li key={index} className="flex justify-between items-center border-b pb-1">
                                            <span>{item.name}</span>
                                            <span className="font-mono text-sm bg-muted px-2 py-1 rounded-md">{item.quantity} {item.unit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                !isLoading && (
                    <Card className="text-center py-12 border-dashed">
                        <CardContent>
                            <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">Your generated shopping list will appear here.</p>
                        </CardContent>
                    </Card>
                )
            )}
        </div>
    );
};

export default ShoppingListPage;
