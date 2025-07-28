'use client';
import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import type { Ingredient, Recipe, WeeklySchedule, DayOfWeek, MealType } from '@/lib/types';
import { useCollection } from '@/hooks/use-firestore';
import { db } from '@/lib/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { DAYS_OF_WEEK, MEAL_TYPES } from '@/lib/types';

// --- CONTEXT DEFINITION ---
interface AppContextType {
  ingredients: Ingredient[];
  recipes: Recipe[];
  schedule: WeeklySchedule;
  addIngredient: (ingredient: Omit<Ingredient, 'id'>) => Promise<void>;
  updateIngredient: (ingredient: Ingredient) => Promise<void>;
  deleteIngredient: (ingredientId: string) => Promise<void>;
  addRecipe: (recipe: Omit<Recipe, 'id'>) => Promise<void>;
  updateRecipe: (recipe: Recipe) => Promise<void>;
  deleteRecipe: (recipeId: string) => Promise<void>;
  updateSchedule: (day: DayOfWeek, mealType: MealType, recipeId: string | null) => Promise<void>;
  getIngredientById: (id: string) => Ingredient | undefined;
  getRecipeById: (id: string) => Recipe | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// --- PROVIDER COMPONENT ---
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { data: ingredients, add: addIngredient, update: updateIngredientDoc, remove: removeIngredient } = useCollection<Ingredient>('ingredients');
  const { data: recipes, add: addRecipe, update: updateRecipeDoc, remove: removeRecipe } = useCollection<Recipe>('recipes');
  const { data: schedule, update: updateScheduleDoc, setData: setSchedule } = useCollection<DaySchedule>('schedule');

  useEffect(() => {
    const initializeSchedule = async () => {
        if (schedule.length === 0) {
            const batch = writeBatch(db);
            const initialSchedule = DAYS_OF_WEEK.map(day => {
                const daySchedule: DaySchedule = {
                    id: day,
                    dayOfWeek: day,
                    meals: MEAL_TYPES.map(mealType => ({
                        mealType: mealType,
                        recipeId: null,
                    })),
                };
                const docRef = doc(db, "schedule", day);
                batch.set(docRef, daySchedule);
                return daySchedule;
            });
            await batch.commit();
            setSchedule(initialSchedule);
        }
    };
    initializeSchedule();
  }, [schedule, setSchedule]);


  const weeklySchedule = DAYS_OF_WEEK.map(day => {
    const daySchedule = schedule.find(s => s.id === day);
    if (daySchedule) {
      return daySchedule;
    }
    return {
      id: day,
      dayOfWeek: day,
      meals: MEAL_TYPES.map(mealType => ({
        mealType: mealType,
        recipeId: null,
      })),
    };
  });


  const updateIngredient = async (ingredient: Ingredient) => {
    await updateIngredientDoc(ingredient.id, ingredient);
  };

  const deleteIngredient = async (ingredientId: string) => {
    await removeIngredient(ingredientId);
    // Also remove this ingredient from any recipes that use it.
    const batch = writeBatch(db);
    recipes.forEach(recipe => {
        const newIngredients = recipe.ingredients.filter(ing => ing.ingredientId !== ingredientId);
        if (newIngredients.length !== recipe.ingredients.length) {
            const recipeRef = doc(db, "recipes", recipe.id);
            batch.update(recipeRef, { ingredients: newIngredients });
        }
    });
    await batch.commit();
  }

  const updateRecipe = async (recipe: Recipe) => {
    await updateRecipeDoc(recipe.id, recipe);
  }

  const deleteRecipe = async (recipeId: string) => {
    await removeRecipe(recipeId);
    // Also remove this recipe from the schedule
    const batch = writeBatch(db);
    schedule.forEach(daySchedule => {
        const newMeals = daySchedule.meals.map(meal => meal.recipeId === recipeId ? { ...meal, recipeId: null } : meal);
        if (JSON.stringify(newMeals) !== JSON.stringify(daySchedule.meals)) {
            const scheduleRef = doc(db, "schedule", daySchedule.id);
            batch.update(scheduleRef, { meals: newMeals });
        }
    });
    await batch.commit();
  }

  const updateSchedule = async (day: DayOfWeek, mealType: MealType, recipeId: string | null) => {
    const daySchedule = schedule.find(ds => ds.dayOfWeek === day);
    if (daySchedule) {
        const newMeals = daySchedule.meals.map(meal =>
            meal.mealType === mealType ? { ...meal, recipeId } : meal
        );
        await updateScheduleDoc(daySchedule.id, { ...daySchedule, meals: newMeals });
    }
  };
  
  const getIngredientById = (id: string) => ingredients.find(ing => ing.id === id);
  const getRecipeById = (id: string) => recipes.find(rec => rec.id === id);


  const value: AppContextType = {
    ingredients,
    recipes,
    schedule: weeklySchedule,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    updateSchedule,
    getIngredientById,
    getRecipeById,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// --- HOOK FOR CONSUMING CONTEXT ---
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
