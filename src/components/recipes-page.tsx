'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { PlusCircle, Trash2, Edit, Clock, BarChart } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppContext } from '@/context/app-context';
import type { Recipe, RecipeIngredient, RecipeDifficulty } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { RECIPE_DIFFICULTIES } from '@/lib/types';


const RecipeForm = ({ setOpen, recipeToEdit }: { setOpen: (open: boolean) => void, recipeToEdit?: Recipe | null }) => {
  const { ingredients, addRecipe, updateRecipe, getIngredientById } = useAppContext();
  const { toast } = useToast();
  const [recipeName, setRecipeName] = useState('');
  const [description, setDescription] = useState('');
  const [cookingTime, setCookingTime] = useState(0);
  const [difficulty, setDifficulty] = useState<RecipeDifficulty>('Easy');
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([]);

  useEffect(() => {
    if (recipeToEdit) {
      setRecipeName(recipeToEdit.name);
      setDescription(recipeToEdit.description || '');
      setCookingTime(recipeToEdit.cookingTime || 0);
      setDifficulty(recipeToEdit.difficulty || 'Easy');
      setRecipeIngredients(recipeToEdit.ingredients);
    } else {
      setRecipeName('');
      setDescription('');
      setCookingTime(0);
      setDifficulty('Easy');
      setRecipeIngredients([]);
    }
  }, [recipeToEdit])


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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (recipeName && recipeIngredients.length > 0 && recipeIngredients.every(ing => ing.ingredientId && ing.quantity > 0)) {
      const recipeData = { 
        name: recipeName, 
        description,
        cookingTime,
        difficulty,
        ingredients: recipeIngredients,
      };
      try {
        if (recipeToEdit) {
            await updateRecipe({ ...recipeToEdit, ...recipeData });
            toast({
            title: 'Recipe Updated!',
            description: `"${recipeName}" has been updated.`,
            });
        } else {
            await addRecipe(recipeData);
            toast({
            title: 'Recipe Added!',
            description: `"${recipeName}" has been created.`,
            });
        }
        setOpen(false);
      } catch(error) {
        toast({
            title: 'Error',
            description: 'Could not save recipe. Please try again.',
            variant: 'destructive',
        });
      }
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
        <div className="grid grid-cols-1 gap-2">
          <Label htmlFor="description">
            Description
          </Label>
          <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="A short description of the recipe" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="cooking-time" className="text-right">
            Time (mins)
          </Label>
          <Input id="cooking-time" type="number" value={cookingTime || ''} onChange={e => setCookingTime(Number(e.target.value))} className="col-span-3" placeholder="e.g., 30" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="difficulty" className="text-right">
            Difficulty
          </Label>
          <Select onValueChange={(val: RecipeDifficulty) => setDifficulty(val)} value={difficulty}>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              {RECIPE_DIFFICULTIES.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        
        <div className="col-span-4">
          <Label>Ingredients</Label>
          <div className="space-y-2 mt-2 max-h-60 overflow-y-auto pr-2">
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
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleAddIngredient} className="mt-2">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Ingredient
            </Button>
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
    const { recipes, getIngredientById, deleteRecipe } = useAppContext();
    const [open, setOpen] = useState(false);
    const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
    const { toast } = useToast();

    const handleEdit = (recipe: Recipe) => {
        setEditingRecipe(recipe);
        setOpen(true);
    };

    const handleDelete = async (recipe: Recipe) => {
        if (window.confirm(`Are you sure you want to delete ${recipe.name}?`)) {
            try {
                await deleteRecipe(recipe.id);
                toast({
                    title: 'Recipe Deleted',
                    description: `${recipe.name} has been removed.`,
                })
            } catch (error) {
                toast({
                    title: 'Error',
                    description: `Could not delete ${recipe.name}. Please try again.`,
                    variant: 'destructive',
                })
            }
        }
    };
    
    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            setEditingRecipe(null);
        }
    }


    return (
        <div className="container mx-auto">
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold font-headline">Your Recipes</h1>
                    <DialogTrigger asChild>
                        <Button style={{backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)'}}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Create Recipe
                        </Button>
                    </DialogTrigger>
                </div>
                
                {recipes.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {recipes.map(recipe => (
                            <Card key={recipe.id} className="flex flex-col">
                                <CardHeader>
                                    <CardTitle>{recipe.name}</CardTitle>
                                    <CardDescription>{recipe.description || 'No description'}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-sm mb-2">Details</h4>
                                        <div className="flex items-center text-sm text-muted-foreground gap-4">
                                            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {recipe.cookingTime || '?'} min</span>
                                            <span className="flex items-center gap-1.5"><BarChart className="w-4 h-4" /> {recipe.difficulty}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm mb-2">Ingredients</h4>
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
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(recipe)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(recipe)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </CardFooter>
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
                 <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingRecipe ? 'Edit Recipe' : 'Create a New Recipe'}</DialogTitle>
                    </DialogHeader>
                    <RecipeForm setOpen={setOpen} recipeToEdit={editingRecipe} />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default RecipesPage;
