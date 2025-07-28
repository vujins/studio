'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, RefreshCw, Loader2 } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox"
import { useAppContext } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ShoppingList } from '@/lib/types';


const ShoppingListPage = () => {
    const { 
        schedule, 
        recipes, 
        getIngredientById, 
        shoppingList, 
        checkedItems, 
        setShoppingListData 
    } = useAppContext();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateList = async () => {
        setIsLoading(true);

        try {
            // Simulate a short delay for better UX
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const aggregatedIngredients: Record<string, { name: string; quantity: number; unit: string; market: string; }> = {};

            for (const day of schedule) {
                for (const meal of day.meals) {
                    if (meal.recipeId) {
                        const recipe = recipes.find(r => r.id === meal.recipeId);
                        if (recipe) {
                            for (const recipeIngredient of recipe.ingredients) {
                                const ingredientDetails = getIngredientById(recipeIngredient.ingredientId);
                                if (ingredientDetails) {
                                    const key = `${ingredientDetails.market}-${ingredientDetails.name}`;
                                    if (aggregatedIngredients[key]) {
                                        aggregatedIngredients[key].quantity += recipeIngredient.quantity;
                                    } else {
                                        aggregatedIngredients[key] = {
                                            name: ingredientDetails.name,
                                            quantity: recipeIngredient.quantity,
                                            unit: ingredientDetails.unit,
                                            market: ingredientDetails.market,
                                        };
                                    }
                                }
                            }
                        }
                    }
                }
            }

            const groupedByMarket: ShoppingList = {};
            for (const ingredient of Object.values(aggregatedIngredients)) {
                if (!groupedByMarket[ingredient.market]) {
                    groupedByMarket[ingredient.market] = [];
                }
                groupedByMarket[ingredient.market].push({
                    name: ingredient.name,
                    quantity: ingredient.quantity,
                    unit: ingredient.unit,
                });
            }
            
            await setShoppingListData(groupedByMarket, {});

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
    
    const handleCheckChange = async (id: string, isChecked: boolean) => {
        const newCheckedItems = { ...checkedItems, [id]: isChecked };
        await setShoppingListData(shoppingList, newCheckedItems);
    };


    return (
        <div className="container mx-auto">
            <div className="flex flex-col items-center text-center mb-8">
                <h1 className="text-3xl font-bold font-headline mb-2">Shopping List Generator</h1>
                <p className="text-muted-foreground max-w-2xl">
                    Automatically create a consolidated shopping list from your weekly meal schedule. All the necessary ingredients will be grouped by market for your convenience.
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
                        <RefreshCw className="mr-2 h-5 w-5" />
                    )}
                    {isLoading ? 'Generating...' : 'Generate New Shopping List'}
                </Button>
            </div>

            {shoppingList ? (
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {Object.keys(shoppingList).length > 0 ? Object.entries(shoppingList).map(([market, items]) => (
                        <Card key={market}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ShoppingCart className="h-5 w-5" />
                                    {market}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {items.map((item, index) => {
                                        const itemId = `${market}-${item.name}`;
                                        return (
                                        <li key={index} className="flex items-center space-x-3">
                                            <Checkbox 
                                                id={itemId} 
                                                checked={!!checkedItems[itemId]}
                                                onCheckedChange={(checked) => handleCheckChange(itemId, !!checked)}
                                            />
                                            <Label htmlFor={itemId} className={cn("flex justify-between items-center w-full transition-colors", checkedItems[itemId] && "text-muted-foreground line-through")}>
                                                <span>{item.name}</span>
                                                <span className="font-mono text-sm bg-muted px-2 py-1 rounded-md">{item.quantity} {item.unit}</span>
                                            </Label>
                                        </li>
                                    )})}
                                </ul>
                            </CardContent>
                        </Card>
                    )) : (
                        <Card className="md:col-span-2 lg:col-span-3 text-center py-12 border-dashed">
                            <CardContent>
                                <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">Your schedule is empty. Add some recipes to your meals to generate a shopping list.</p>
                            </CardContent>
                        </Card>
                    )}
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
