'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { PlusCircle, Trash2, Edit, Clock, BarChart, ChefHat, Search, X, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppContext } from '@/context/app-context';
import type { Recipe, RecipeIngredient, RecipeDifficulty, Ingredient } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { RECIPE_DIFFICULTIES } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


const IngredientCombobox = ({ value, onChange, ingredients }: { value: string, onChange: (value: string) => void, ingredients: Ingredient[] }) => {
    const selectedIngredient = ingredients.find(i => i.id === value);

    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Select ingredient...">
                    {selectedIngredient ? selectedIngredient.name : "Select ingredient..."}
                </SelectValue>
            </SelectTrigger>
            <SelectContent>
                {ingredients.map((ingredient) => (
                    <SelectItem key={ingredient.id} value={ingredient.id}>
                        <div className="flex items-center justify-between w-full">
                            <span>{ingredient.name}</span>
                            <div className="flex items-center gap-2 ml-2 text-xs text-gray-500">
                                <span>{ingredient.unit}</span>
                                <Badge variant="outline" className="text-xs py-0 px-1">
                                    {ingredient.market}
                                </Badge>
                            </div>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};


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
        <ScrollArea className="h-[70vh] pr-6">
            <div className="space-y-6 py-4">
                {/* Recipe Details Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <ChefHat className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Recipe Details</h3>
                    </div>
                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="recipe-name" className="text-sm font-medium">Recipe Name *</Label>
                            <Input
                                id="recipe-name"
                                value={recipeName}
                                onChange={e => setRecipeName(e.target.value)}
                                placeholder="e.g., Mediterranean Quinoa Salad"
                                className="transition-all focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cooking-time" className="text-sm font-medium">Cooking Time (minutes)</Label>
                            <Input
                                id="cooking-time"
                                type="number"
                                min="0"
                                max="999"
                                value={cookingTime || ''}
                                onChange={e => setCookingTime(Number(e.target.value))}
                                placeholder="30"
                                className="transition-all focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="difficulty" className="text-sm font-medium">Difficulty Level</Label>
                        <Select onValueChange={(val: RecipeDifficulty) => setDifficulty(val)} value={difficulty}>
                            <SelectTrigger className="transition-all focus:ring-2 focus:ring-blue-500">
                                <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                                {RECIPE_DIFFICULTIES.map(level => (
                                    <SelectItem key={level} value={level}>
                                        <div className="flex items-center gap-2">
                                            <span>{level}</span>
                                            {level === 'Easy' && <Badge variant="secondary" className="text-xs">Beginner</Badge>}
                                            {level === 'Medium' && <Badge variant="outline" className="text-xs">Intermediate</Badge>}
                                            {level === 'Hard' && <Badge variant="destructive" className="text-xs">Advanced</Badge>}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="A delicious and healthy recipe that's perfect for..."
                            className="min-h-[80px] transition-all focus:ring-2 focus:ring-blue-500"
                            maxLength={500}
                        />
                        <p className="text-xs text-gray-500">{description.length}/500 characters</p>
                    </div>
                </div>

                {/* Ingredients Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Plus className="h-5 w-5 text-green-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Ingredients</h3>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                            {recipeIngredients.length} ingredient{recipeIngredients.length !== 1 ? 's' : ''}
                        </Badge>
                    </div>
                    <Separator />

                    <div className="space-y-3">
                        {recipeIngredients.map((ing, index) => {
                            const ingredientDetails = getIngredientById(ing.ingredientId);
                            return (
                                <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4 transition-all hover:border-gray-300">
                                    <div className="grid grid-cols-1 md:grid-cols-[1fr_120px_auto] items-end gap-3">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Ingredient</Label>
                                            <IngredientCombobox
                                                ingredients={ingredients}
                                                value={ing.ingredientId}
                                                onChange={(val) => handleIngredientChange(index, 'ingredientId', val)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Quantity</Label>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.1"
                                                    value={ing.quantity || ''}
                                                    onChange={e => handleIngredientChange(index, 'quantity', Number(e.target.value))}
                                                    placeholder="0"
                                                    className="flex-1"
                                                />
                                                <span className="text-sm text-gray-600 min-w-[50px]">
                                                    {ingredientDetails?.unit || 'unit'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-end h-10">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveIngredient(index)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {recipeIngredients.length === 0 && (
                        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                            <p className="text-gray-500 mb-3">No ingredients added yet</p>
                        </div>
                    )}

                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddIngredient}
                        className="w-full border-dashed border-green-300 text-green-700 hover:border-green-400 hover:bg-green-50"
                    >
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Ingredient
                    </Button>
                </div>
            </div>
        </ScrollArea>

        <DialogFooter className="pt-6 border-t">
            <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!recipeName || recipeIngredients.length === 0 || recipeIngredients.some(ing => !ing.ingredientId || ing.quantity <= 0)}
            >
                {recipeToEdit ? 'Update Recipe' : 'Create Recipe'}
            </Button>
        </DialogFooter>
    </form>
  );
};


const RecipesPage = () => {
    const { recipes, getIngredientById, deleteRecipe, ingredients } = useAppContext();
    const [open, setOpen] = useState(false);
    const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
    const { toast } = useToast();

    const handleEdit = (recipe: Recipe) => {
        setEditingRecipe(recipe);
        setOpen(true);
    };

    const handleDelete = async (recipe: Recipe) => {
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
    };

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            setEditingRecipe(null);
        }
    }

    // Filter recipes based on search and difficulty
    const filteredRecipes = recipes.filter(recipe => {
        const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            recipe.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDifficulty = difficultyFilter === 'all' || recipe.difficulty === difficultyFilter;
        return matchesSearch && matchesDifficulty;
    });

    const difficultyColors = {
        'Easy': 'bg-green-100 text-green-800 border-green-200',
        'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        'Hard': 'bg-red-100 text-red-800 border-red-200'
    };

    return (
        <div className="container mx-auto space-y-6">
            <Dialog open={open} onOpenChange={handleOpenChange}>
                {/* Enhanced Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-headline text-gray-900">Your Recipes</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} total
                            {filteredRecipes.length !== recipes.length && (
                                <span> • {filteredRecipes.length} shown</span>
                            )}
                        </p>
                    </div>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            <PlusCircle className="mr-2 h-4 w-4" /> Create Recipe
                        </Button>
                    </DialogTrigger>
                </div>

                {/* Search and Filter Section */}
                {recipes.length > 0 && (
                    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search recipes by name or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                            {searchTerm && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                                    onClick={() => setSearchTerm('')}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="Filter by difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Difficulties</SelectItem>
                                {RECIPE_DIFFICULTIES.map(level => (
                                    <SelectItem key={level} value={level}>{level}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Recipes Grid */}
                {filteredRecipes.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredRecipes.map(recipe => (
                            <Card key={recipe.id} className="flex flex-col hover:shadow-lg transition-shadow group">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="text-lg truncate group-hover:text-blue-600 transition-colors">
                                                {recipe.name}
                                            </CardTitle>
                                            <CardDescription className="mt-1 line-clamp-2">
                                                {recipe.description || 'No description provided'}
                                            </CardDescription>
                                        </div>
                                        <div className="flex gap-1 ml-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEdit(recipe)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to delete "{recipe.name}"? This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(recipe)}
                                                            className="bg-red-600 hover:bg-red-700"
                                                        >
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="flex-grow space-y-4">
                                    {/* Recipe Info */}
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4" />
                                            <span>{recipe.cookingTime || '?'} min</span>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={`text-xs ${difficultyColors[recipe.difficulty as keyof typeof difficultyColors] || 'bg-gray-100 text-gray-800'}`}
                                        >
                                            {recipe.difficulty}
                                        </Badge>
                                    </div>

                                    {/* Ingredients Preview */}
                                    <div>
                                        <h4 className="font-medium text-sm mb-2 text-gray-900">
                                            Ingredients ({recipe.ingredients.length})
                                        </h4>
                                        <div className="space-y-1">
                                            {recipe.ingredients.slice(0, 3).map(ing => {
                                                const ingredientDetails = getIngredientById(ing.ingredientId);
                                                return (
                                                    <div key={ing.ingredientId} className="text-xs text-gray-600 flex items-center justify-between">
                                                        <span className="truncate">
                                                            {ingredientDetails?.name || 'Unknown Ingredient'}
                                                        </span>
                                                        <span className="text-gray-500 ml-2 flex-shrink-0">
                                                            {ing.quantity} {ingredientDetails?.unit}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                            {recipe.ingredients.length > 3 && (
                                                <p className="text-xs text-gray-500 italic">
                                                    +{recipe.ingredients.length - 3} more...
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : recipes.length === 0 ? (
                    <Card className="border-dashed border-gray-300">
                        <CardContent className="text-center py-12">
                            <div className="text-gray-500">
                                <ChefHat className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                <h3 className="font-medium text-gray-900 mb-2">No recipes yet</h3>
                                <p className="text-sm mb-4">Create your first recipe to get started with meal planning!</p>
                                <DialogTrigger asChild>
                                    <Button variant="outline">
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Create Your First Recipe
                                    </Button>
                                </DialogTrigger>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-dashed border-gray-300">
                        <CardContent className="text-center py-12">
                            <div className="text-gray-500">
                                <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <h3 className="font-medium text-gray-900 mb-2">No recipes found</h3>
                                <p className="text-sm">Try adjusting your search or filter criteria.</p>
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setDifficultyFilter('all');
                                    }}
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Enhanced Dialog */}
                <DialogContent className="sm:max-w-3xl max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ChefHat className="h-5 w-5 text-blue-600" />
                            {editingRecipe ? 'Edit Recipe' : 'Create a New Recipe'}
                        </DialogTitle>
                    </DialogHeader>
                    <RecipeForm setOpen={setOpen} recipeToEdit={editingRecipe} />
                </DialogContent>
            </Dialog>

            {/* Help section when no ingredients exist */}
            {ingredients.length === 0 && (
                <Card className="border-dashed border-yellow-300 bg-yellow-50">
                    <CardContent className="text-center py-8">
                        <div className="text-yellow-700">
                            <BarChart className="h-12 w-12 mx-auto mb-3 opacity-70" />
                            <h3 className="font-medium mb-2">No ingredients available</h3>
                            <p className="text-sm">You need to create some ingredients before you can create recipes.</p>
                            <Button variant="outline" className="mt-4" asChild>
                                <a href="/ingredients">Manage Ingredients</a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default RecipesPage;
