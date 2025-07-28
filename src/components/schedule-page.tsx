'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppContext } from '@/context/app-context';
import type { DayOfWeek, MealType, Recipe } from '@/lib/types';
import { useToast } from "@/hooks/use-toast"
import { MEAL_TYPES, DAYS_OF_WEEK } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2, Clock, Users, X, Plus } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';


const RecipeCombobox = ({ day, mealType }: { day: DayOfWeek, mealType: MealType }) => {
    const { schedule, recipes, updateSchedule } = useAppContext();
    const { toast } = useToast();

    const daySchedule = schedule.find(ds => ds.dayOfWeek === day);
    const meal = daySchedule?.meals.find(m => m.mealType === mealType);
    const recipeId = meal?.recipeId || 'none';
    const selectedRecipe = recipeId !== 'none' ? recipes.find(r => r.id === recipeId) : null;

    const handleRecipeChange = async (newRecipeId: string) => {
        try {
            const recipeIdToSet = newRecipeId === "none" ? null : newRecipeId;

            if (recipeId !== recipeIdToSet) {
                await updateSchedule(day, mealType, recipeIdToSet);
                toast({
                    title: "Schedule Updated",
                    description: `${mealType} on ${day} has been updated.`,
                });
            }
        } catch(error) {
            toast({
                title: "Error",
                description: `Could not update schedule. Please try again.`,
                variant: "destructive",
            });
        }
    };

    const handleClearRecipe = async () => {
        if (recipeId !== 'none') {
            await handleRecipeChange('none');
        }
    };

    return (
        <div className="space-y-2">
            {selectedRecipe ? (
                <div className="relative group">
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-3 transition-all hover:shadow-md">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 truncate mb-1">
                                    {selectedRecipe.name}
                                </h4>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    {selectedRecipe.cookingTime && (
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            <span>{selectedRecipe.cookingTime}min</span>
                                        </div>
                                    )}
                                    {selectedRecipe.difficulty && (
                                        <Badge variant="secondary" className="text-xs">
                                            {selectedRecipe.difficulty}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                                onClick={handleClearRecipe}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <Select value={recipeId} onValueChange={handleRecipeChange}>
                    <SelectTrigger className="w-full border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                        <div className="flex items-center gap-2 text-gray-500">
                            <Plus className="h-4 w-4" />
                            <SelectValue placeholder="Add a recipe" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">
                            <span className="text-muted-foreground">No recipe</span>
                        </SelectItem>
                        {recipes.map((recipe) => (
                            <SelectItem key={recipe.id} value={recipe.id}>
                                <div className="flex items-center justify-between w-full">
                                    <span>{recipe.name}</span>
                                    <div className="flex items-center gap-2 ml-2 text-xs text-gray-500">
                                        {recipe.cookingTime && (
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {recipe.cookingTime}min
                                            </span>
                                        )}
                                        {recipe.difficulty && (
                                            <Badge variant="outline" className="text-xs py-0 px-1">
                                                {recipe.difficulty}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        </div>
    );
};


const SchedulePage = () => {
  const { schedule, clearSchedule, recipes } = useAppContext();
  const { toast } = useToast();
  const [isClearing, setIsClearing] = useState(false);

  const handleClearSchedule = async () => {
    setIsClearing(true);
    try {
        await clearSchedule();
        toast({
            title: "Schedule Cleared",
            description: "Your weekly meal schedule has been reset.",
        })
    } catch(error) {
        toast({
            title: "Error",
            description: "Could not clear the schedule. Please try again.",
            variant: "destructive",
        })
    } finally {
        setIsClearing(false);
    }
  }

  // Calculate some stats for the header
  const totalMealsPlanned = schedule.reduce((total, day) => {
    return total + day.meals.filter(meal => meal.recipeId).length;
  }, 0);

  const totalPossibleMeals = schedule.length * MEAL_TYPES.length;

  return (
    <div className="container mx-auto space-y-6">
      {/* Header with improved stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-gray-900">Weekly Meal Schedule</h1>
          <p className="text-sm text-gray-600 mt-1">
            {totalMealsPlanned} of {totalPossibleMeals} meals planned
            {recipes.length > 0 && (
              <span className="ml-2">• {recipes.length} recipes available</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {totalMealsPlanned > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Schedule
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear your schedule?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove all {totalMealsPlanned} planned meals from your weekly schedule. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearSchedule} disabled={isClearing}>
                    {isClearing ? 'Clearing...' : 'Yes, clear schedule'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Enhanced Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {DAYS_OF_WEEK.map(day => {
          const daySchedule = schedule.find(ds => ds.dayOfWeek === day);
          const mealsPlannedForDay = daySchedule?.meals.filter(meal => meal.recipeId).length || 0;
          
          return (
            <Card key={day} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">{day}</CardTitle>
                  {mealsPlannedForDay > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {mealsPlannedForDay}/{MEAL_TYPES.length} planned
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {MEAL_TYPES.map((mealType, index) => {
                  return (
                    <div key={mealType} className="space-y-2">
                      {index > 0 && <Separator className="my-3" />}
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-gray-700">{mealType}</Label>
                        {/* Optional: Add quick action buttons here in the future */}
                      </div>
                      <RecipeCombobox day={day} mealType={mealType} />
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Help text when no recipes exist */}
      {recipes.length === 0 && (
        <Card className="border-dashed border-gray-300">
          <CardContent className="text-center py-8">
            <div className="text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <h3 className="font-medium text-gray-900 mb-2">No recipes yet</h3>
              <p className="text-sm">Create some recipes first to start planning your weekly meals.</p>
              <Button variant="outline" className="mt-4" asChild>
                <a href="/recipes">Create Recipes</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SchedulePage;
