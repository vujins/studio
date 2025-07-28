'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppContext } from '@/context/app-context';
import type { DayOfWeek, MealType, Recipe } from '@/lib/types';
import { useToast } from "@/hooks/use-toast"
import { MEAL_TYPES, DAYS_OF_WEEK } from '@/lib/types';

const SchedulePage = () => {
  const { schedule, recipes, updateSchedule } = useAppContext();
  const { toast } = useToast();

  const handleRecipeChange = async (day: DayOfWeek, mealType: MealType, newRecipeId: string) => {
    try {
      // Find the current recipeId to avoid unnecessary updates
      const daySchedule = schedule.find(ds => ds.dayOfWeek === day);
      const meal = daySchedule?.meals.find(m => m.mealType === mealType);
      const currentRecipeId = meal?.recipeId || null;

      // Firestore treats an empty string and null differently, so we ensure consistency.
      const recipeIdToSet = newRecipeId === "none" ? null : newRecipeId;

      if (currentRecipeId !== recipeIdToSet) {
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

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-headline">Weekly Meal Schedule</h1>
      </div>
        <Card>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                    <tr className="border-b">
                        <th className="p-4 text-left font-medium text-muted-foreground w-1/12"></th>
                        {DAYS_OF_WEEK.map(day => (
                        <th key={day} className="p-4 text-center font-medium text-muted-foreground">{day}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {MEAL_TYPES.map(mealType => (
                        <tr key={mealType} className="border-b last:border-b-0">
                        <td className="p-4 font-medium text-muted-foreground align-top w-1/12">{mealType}</td>
                        {DAYS_OF_WEEK.map(day => {
                            const daySchedule = schedule.find(ds => ds.dayOfWeek === day);
                            const meal = daySchedule?.meals.find(m => m.mealType === mealType);
                            const recipeId = meal?.recipeId || 'none';
                            
                            return (
                            <td key={`${day}-${mealType}`} className="p-2 align-top">
                                <Select
                                    value={recipeId}
                                    onValueChange={(newRecipeId) => handleRecipeChange(day, mealType, newRecipeId)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a recipe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            <span className="text-muted-foreground">None</span>
                                        </SelectItem>
                                        {recipes.map(recipe => (
                                            <SelectItem key={recipe.id} value={recipe.id}>{recipe.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </td>
                            )
                        })}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            </CardContent>
        </Card>
    </div>
  );
};

export default SchedulePage;
