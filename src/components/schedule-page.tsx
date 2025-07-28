'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppContext } from '@/context/app-context';
import type { DayOfWeek, MealType } from '@/lib/types';
import { useToast } from "@/hooks/use-toast"
import { MEAL_TYPES, DAYS_OF_WEEK } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
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


const SchedulePage = () => {
  const { schedule, recipes, updateSchedule, clearSchedule } = useAppContext();
  const { toast } = useToast();
  const [isClearing, setIsClearing] = useState(false);

  const handleRecipeChange = async (day: DayOfWeek, mealType: MealType, newRecipeId: string) => {
    try {
      const daySchedule = schedule.find(ds => ds.dayOfWeek === day);
      const meal = daySchedule?.meals.find(m => m.mealType === mealType);
      const currentRecipeId = meal?.recipeId || null;
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

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold font-headline">Weekly Meal Schedule</h1>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Schedule
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will permanently clear your entire weekly schedule. You cannot undo this.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearSchedule} disabled={isClearing}>
                {isClearing ? 'Clearing...' : 'Yes, clear it'}
                </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {DAYS_OF_WEEK.map(day => {
                const daySchedule = schedule.find(ds => ds.dayOfWeek === day);
                return (
                    <Card key={day}>
                        <CardHeader>
                            <CardTitle>{day}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {MEAL_TYPES.map((mealType, index) => {
                                const meal = daySchedule?.meals.find(m => m.mealType === mealType);
                                const recipeId = meal?.recipeId || 'none';
                                return (
                                    <React.Fragment key={mealType}>
                                       {index > 0 && <Separator />}
                                       <div className="space-y-2">
                                            <Label className="text-muted-foreground">{mealType}</Label>
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
                                       </div>
                                    </React.Fragment>
                                )
                            })}
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    </div>
  );
};

export default SchedulePage;
