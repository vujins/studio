'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/context/app-context';
import type { DayOfWeek, MealType, Recipe } from '@/lib/types';
import { useToast } from "@/hooks/use-toast"
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ChevronsUpDown, Check, PlusCircle } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { MEAL_TYPES, DAYS_OF_WEEK } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


const RecipeCombobox = ({ day, mealType, recipeId }: { day: DayOfWeek, mealType: MealType, recipeId: string | null }) => {
    const { recipes, updateSchedule, getRecipeById } = useAppContext();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);

    const handleRecipeChange = async (newRecipeId: string | null) => {
        setOpen(false);
        if (newRecipeId === recipeId) return;

        try {
            await updateSchedule(day, mealType, newRecipeId);
            toast({
                title: "Schedule Updated",
                description: `${mealType} on ${day} has been updated.`,
            });
        } catch(error) {
            toast({
                title: "Error",
                description: `Could not update schedule. Please try again.`,
                variant: "destructive",
            });
        }
    };

    const selectedRecipe = recipeId ? getRecipeById(recipeId) : null;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between text-left h-auto py-1 px-2"
                >
                    <span className="truncate">
                        {selectedRecipe ? selectedRecipe.name : "Select a recipe"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search recipe..." />
                    <CommandList>
                        <CommandEmpty>No recipe found.</CommandEmpty>
                        <CommandGroup>
                             <CommandItem
                                onSelect={() => handleRecipeChange(null)}
                                className="cursor-pointer"
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        !recipeId ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                <span className="text-muted-foreground">None</span>
                            </CommandItem>
                            {recipes.map((recipe) => (
                                <CommandItem
                                    key={recipe.id}
                                    value={recipe.name}
                                    onSelect={() => handleRecipeChange(recipe.id)}
                                     className="cursor-pointer"
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
            </PopoverContent>
        </Popover>
    );
};


const SchedulePage = () => {
  const { schedule } = useAppContext();

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-headline">Weekly Meal Schedule</h1>
      </div>
        {/* Desktop View */}
        <Card className="hidden md:block">
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                    <tr className="border-b">
                        <th className="p-4 text-left font-medium text-muted-foreground w-1/6"></th>
                        {DAYS_OF_WEEK.map(day => (
                        <th key={day} className="p-4 text-center font-medium text-muted-foreground">{day}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {MEAL_TYPES.map(mealType => (
                        <tr key={mealType} className="border-b">
                        <td className="p-4 font-medium text-muted-foreground align-top w-1/6">{mealType}</td>
                        {DAYS_OF_WEEK.map(day => {
                            const daySchedule = schedule.find(ds => ds.dayOfWeek === day);
                            const meal = daySchedule?.meals.find(m => m.mealType === mealType);
                            
                            return (
                            <td key={`${day}-${mealType}`} className="p-2 align-top">
                                <RecipeCombobox 
                                    day={day}
                                    mealType={mealType}
                                    recipeId={meal?.recipeId || null}
                                />
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
        {/* Mobile View */}
        <div className="md:hidden">
            <Accordion type="single" collapsible className="w-full" defaultValue={DAYS_OF_WEEK[0]}>
                {DAYS_OF_WEEK.map(day => {
                    const daySchedule = schedule.find(ds => ds.dayOfWeek === day);
                    return (
                    <AccordionItem value={day} key={day}>
                        <AccordionTrigger>{day}</AccordionTrigger>
                        <AccordionContent>
                           <div className="space-y-4">
                            {MEAL_TYPES.map(mealType => {
                                const meal = daySchedule?.meals.find(m => m.mealType === mealType);
                                return (
                                <div key={mealType} className="grid grid-cols-3 items-center gap-2">
                                    <Label className="text-muted-foreground text-right">{mealType}</Label>
                                    <div className="col-span-2">
                                        <RecipeCombobox 
                                            day={day}
                                            mealType={mealType}
                                            recipeId={meal?.recipeId || null}
                                        />
                                    </div>
                                </div>
                                )
                            })}
                           </div>
                        </AccordionContent>
                    </AccordionItem>
                    )
                })}
            </Accordion>
        </div>

    </div>
  );
};

export default SchedulePage;
