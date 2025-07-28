'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppContext } from '@/context/app-context';
import type { DayOfWeek, MealType } from '@/lib/types';
import { useToast } from "@/hooks/use-toast"

const SchedulePage = () => {
  const { schedule, recipes, updateSchedule, getRecipeById } = useAppContext();
  const { toast } = useToast();

  const handleRecipeChange = (day: DayOfWeek, mealType: MealType, recipeId: string) => {
    const newRecipeId = recipeId === 'none' ? null : recipeId;
    updateSchedule(day, mealType, newRecipeId);
    toast({
      title: "Schedule Updated",
      description: `${mealType} on ${day} has been updated.`,
    })
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-headline">Weekly Meal Schedule</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {schedule.map((daySchedule) => (
          <Card key={daySchedule.dayOfWeek} className="w-full">
            <CardHeader>
              <CardTitle>{daySchedule.dayOfWeek}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {daySchedule.meals.map((meal) => (
                  <div key={meal.mealType} className="space-y-1">
                    <p className="font-medium text-sm text-muted-foreground">{meal.mealType}</p>
                    <Select
                      value={meal.recipeId || 'none'}
                      onValueChange={(value) => handleRecipeChange(daySchedule.dayOfWeek, meal.mealType, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a recipe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                            <span className="text-muted-foreground">None</span>
                        </SelectItem>
                        {recipes.map((recipe) => (
                          <SelectItem key={recipe.id} value={recipe.id}>
                            {recipe.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SchedulePage;
