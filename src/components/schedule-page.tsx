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
import { Trash2, ChevronsUpDown, Check } from 'lucide-react';
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
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';


const RecipeCombobox = ({ day, mealType }: { day: DayOfWeek, mealType: MealType }) => {
    const { schedule, recipes, updateSchedule } = useAppContext();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);

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
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                >
                    <span className="truncate">
                        {selectedRecipe ? selectedRecipe.name : "Select a recipe"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </DialogTrigger>
            <DialogContent className="p-0">
                 <Command>
                    <CommandInput placeholder="Search recipes..." />
                    <CommandList>
                        <CommandEmpty>No recipe found.</CommandEmpty>
                        <CommandGroup>
                             <CommandItem
                                onSelect={() => handleRecipeChange('none')}
                             >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        recipeId === 'none' ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                <span className="text-muted-foreground">None</span>
                            </CommandItem>
                            {recipes.map((recipe) => (
                                <CommandItem
                                    key={recipe.id}
                                    value={recipe.name}
                                    onSelect={() => handleRecipeChange(recipe.id)}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            recipeId === recipe.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {recipe.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </DialogContent>
        </Dialog>
    );
};


const SchedulePage = () => {
  const { schedule, clearSchedule } = useAppContext();
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
                return (
                    <Card key={day}>
                        <CardHeader>
                            <CardTitle>{day}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {MEAL_TYPES.map((mealType, index) => {
                                return (
                                    <React.Fragment key={mealType}>
                                       {index > 0 && <Separator />}
                                       <div className="space-y-2">
                                            <Label className="text-muted-foreground">{mealType}</Label>
                                            <RecipeCombobox day={day} mealType={mealType} />
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
