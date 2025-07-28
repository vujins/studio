'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppContext } from '@/context/app-context';
import type { RecipeIngredient } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';


const AddRecipeForm = ({ setOpen }: { setOpen: (open: boolean) => void }) => {
  const { ingredients, addRecipe, getIngredientById } = useAppContext();
  const { toast } = useToast();
  const [recipeName, setRecipeName] = useState('');
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([]);

  const handleAddIngredient = () => {
    setRecipeIngredients([...recipeIngredients, { ingredientId: '', quantity: 0 }]);
  };
  
  const handleRemoveIngredient = (index: number) => {
    setRecipeIngredients(recipeIngredients.filter((_, i) => i !== index));
  };
  
  const handleIngredientChange = (index: number, field: keyof RecipeIngredient, value: string | number) => {
    const newIngredients = [...recipeIngredients];
    if (field === 'quantity' && typeof value === 'number') {
        newIngredients[index].quantity = value;
    } else if (field === 'ingredientId' && typeof value === 'string') {
        newIngredients[index].ingredientId = value;
    }
    setRecipeIngredients(newIngredients);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (recipeName && recipeIngredients.length > 0 && recipeIngredients.every(ing => ing.ingredientId && ing.quantity > 0)) {
      addRecipe({ name: recipeName, ingredients: recipeIngredients });
      toast({
        title: 'Recipe Added!',
        description: `"${recipeName}" has been created.`,
      });
      setOpen(false);
    } else {
        toast({
            title: 'Error',
            description: 'Please provide a recipe name and at least one valid ingredient with a quantity.',
            variant: 'destructive',
        });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="recipe-name" className="text-right">
            Name
          </Label>
          <Input id="recipe-name" value={recipeName} onChange={e => setRecipeName(e.target.value)} className="col-span-3" placeholder="e.g., Healthy Salad" />
        </div>
        
        <div className="col-span-4">
          <Label>Ingredients</Label>
          <div className="space-y-2 mt-2">
            {recipeIngredients.map((ing, index) => (
                <div key={index} className="flex items-center gap-2">
                    <Select onValueChange={(val) => handleIngredientChange(index, 'ingredientId', val)} value={ing.ingredientId}>
                        <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select ingredient" />
                        </SelectTrigger>
                        <SelectContent>
                            {ingredients.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Input 
                        type="number"
                        value={ing.quantity || ''}
                        onChange={e => handleIngredientChange(index, 'quantity', Number(e.target.value))}
                        className="w-24"
                        placeholder="Qty"
                    />
                    <span className="text-sm text-muted-foreground w-16">{getIngredientById(ing.ingredientId)?.unit || 'unit'}</span>
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveIngredient(index)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={handleAddIngredient}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Ingredient
            </Button>
          </div>
        </div>

      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="secondary">Cancel</Button>
        </DialogClose>
        <Button type="submit" style={{backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)'}}>Save Recipe</Button>
      </DialogFooter>
    </form>
  );
};


const RecipesPage = () => {
    const { recipes, getIngredientById } = useAppContext();
    const [open, setOpen] = useState(false);

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold font-headline">Your Recipes</h1>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button style={{backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)'}}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Create Recipe
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Create a New Recipe</DialogTitle>
                        </DialogHeader>
                        <AddRecipeForm setOpen={setOpen} />
                    </DialogContent>
                </Dialog>
            </div>
            
            {recipes.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {recipes.map(recipe => (
                        <Card key={recipe.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle>{recipe.name}</CardTitle>
                                <CardDescription>Ingredients</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <ul className="space-y-1 text-sm list-disc pl-5">
                                    {recipe.ingredients.map(ing => {
                                        const ingredientDetails = getIngredientById(ing.ingredientId);
                                        return (
                                            <li key={ing.ingredientId}>
                                                {ing.quantity} {ingredientDetails?.unit} {ingredientDetails?.name || 'Unknown Ingredient'}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="text-center py-12">
                    <CardContent>
                        <p className="text-muted-foreground">No recipes yet. Create one to get started!</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default RecipesPage;
