'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Ingredient, Recipe, WeeklySchedule, DaySchedule, DayOfWeek, Meal, RecipeIngredient, MealType } from '@/lib/types';
import { DAYS_OF_WEEK, MEAL_TYPES } from '@/lib/types';

// --- INITIAL MOCK DATA ---
const initialIngredients: Ingredient[] = [
  { id: '1', name: 'Chicken Breast', unit: 'g', market: 'SuperMart' },
  { id: '2', name: 'Broccoli', unit: 'g', market: 'Farmers Market' },
  { id: '3', name: 'Brown Rice', unit: 'g', market: 'SuperMart' },
  { id: '4', name: 'Olive Oil', unit: 'ml', market: 'SuperMart' },
  { id: '5', name: 'Greek Yogurt', unit: 'g', market: 'Dairy Land' },
  { id: '6', name: 'Berries', unit: 'g', market: 'Farmers Market' },
  { id: '7', name: 'Oats', unit: 'g', market: 'SuperMart' },
];

const initialRecipes: Recipe[] = [
  {
    id: 'r1',
    name: 'Grilled Chicken & Veggies',
    ingredients: [
      { ingredientId: '1', quantity: 200 },
      { ingredientId: '2', quantity: 150 },
      { ingredientId: '3', quantity: 100 },
      { ingredientId: '4', quantity: 10 },
    ],
  },
  {
    id: 'r2',
    name: 'Yogurt & Berry Bowl',
    ingredients: [
      { ingredientId: '5', quantity: 150 },
      { ingredientId: '6', quantity: 50 },
    ],
  },
  {
    id: 'r3',
    name: 'Morning Oatmeal',
    ingredients: [
      { ingredientId: '7', quantity: 50 },
      { ingredientId: '6', quantity: 30 },
    ],
  },
];

const createInitialSchedule = (): WeeklySchedule => {
  return DAYS_OF_WEEK.map(day => ({
    dayOfWeek: day,
    meals: MEAL_TYPES.map(mealType => ({
      mealType: mealType,
      recipeId: null,
    })),
  }));
};

const initialSchedule = createInitialSchedule();
// Pre-populate some meals for demonstration
initialSchedule[0].meals[0].recipeId = 'r3'; // Monday Breakfast
initialSchedule[0].meals[2].recipeId = 'r1'; // Monday Lunch
initialSchedule[1].meals[0].recipeId = 'r2'; // Tuesday Breakfast

// --- CONTEXT DEFINITION ---
interface AppContextType {
  ingredients: Ingredient[];
  recipes: Recipe[];
  schedule: WeeklySchedule;
  addIngredient: (ingredient: Omit<Ingredient, 'id'>) => void;
  updateIngredient: (ingredient: Ingredient) => void;
  deleteIngredient: (ingredientId: string) => void;
  addRecipe: (recipe: Omit<Recipe, 'id'>) => void;
  updateRecipe: (recipe: Recipe) => void;
  deleteRecipe: (recipeId: string) => void;
  updateSchedule: (day: DayOfWeek, mealType: MealType, recipeId: string | null) => void;
  getIngredientById: (id: string) => Ingredient | undefined;
  getRecipeById: (id: string) => Recipe | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// --- PROVIDER COMPONENT ---
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialIngredients);
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [schedule, setSchedule] = useState<WeeklySchedule>(initialSchedule);

  const addIngredient = (ingredient: Omit<Ingredient, 'id'>) => {
    setIngredients(prev => [...prev, { ...ingredient, id: new Date().toISOString() }]);
  };
  
  const updateIngredient = (ingredient: Ingredient) => {
    setIngredients(prev => prev.map(i => i.id === ingredient.id ? ingredient : i));
  }

  const deleteIngredient = (ingredientId: string) => {
    // Also remove this ingredient from any recipes that use it.
    const updatedRecipes = recipes.map(recipe => ({
        ...recipe,
        ingredients: recipe.ingredients.filter(ing => ing.ingredientId !== ingredientId),
    }));
    setRecipes(updatedRecipes);
    setIngredients(prev => prev.filter(i => i.id !== ingredientId));
  }

  const addRecipe = (recipe: Omit<Recipe, 'id'>) => {
    setRecipes(prev => [...prev, { ...recipe, id: new Date().toISOString() }]);
  };

  const updateRecipe = (recipe: Recipe) => {
    setRecipes(prev => prev.map(r => r.id === recipe.id ? recipe : r));
  }

  const deleteRecipe = (recipeId: string) => {
    setRecipes(prev => prev.filter(r => r.id !== recipeId));
    // Also remove this recipe from the schedule
    setSchedule(prevSchedule => prevSchedule.map(daySchedule => ({
      ...daySchedule,
      meals: daySchedule.meals.map(meal => meal.recipeId === recipeId ? { ...meal, recipeId: null } : meal)
    })));
  }

  const updateSchedule = (day: DayOfWeek, mealType: MealType, recipeId: string | null) => {
    setSchedule(prevSchedule =>
      prevSchedule.map(daySchedule =>
        daySchedule.dayOfWeek === day
          ? {
              ...daySchedule,
              meals: daySchedule.meals.map(meal =>
                meal.mealType === mealType ? { ...meal, recipeId } : meal
              ),
            }
          : daySchedule
      )
    );
  };
  
  const getIngredientById = (id: string) => ingredients.find(ing => ing.id === id);
  const getRecipeById = (id: string) => recipes.find(rec => rec.id === id);


  const value = {
    ingredients,
    recipes,
    schedule,
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
