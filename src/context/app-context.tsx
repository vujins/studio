'use client';
import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import type { Ingredient, Recipe, WeeklySchedule, DayOfWeek, MealType, DaySchedule, ShoppingList, ShoppingListData, RecipeDifficulty } from '@/lib/types';
import { useCollection } from '@/hooks/use-firestore';
import { db } from '@/lib/firebase';
import { collection, doc, writeBatch, getDocs, setDoc } from 'firebase/firestore';
import { DAYS_OF_WEEK, MEAL_TYPES } from '@/lib/types';

// --- CONTEXT DEFINITION ---
interface AppContextType {
  ingredients: Ingredient[];
  recipes: Recipe[];
  schedule: WeeklySchedule;
  shoppingList: ShoppingList | null;
  checkedItems: Record<string, boolean>;
  addIngredient: (ingredient: Omit<Ingredient, 'id'>) => Promise<string | undefined>;
  updateIngredient: (ingredient: Ingredient) => Promise<void>;
  deleteIngredient: (ingredientId: string) => Promise<void>;
  addRecipe: (recipe: Omit<Recipe, 'id'>) => Promise<string | undefined>;
  updateRecipe: (recipe: Recipe) => Promise<void>;
  deleteRecipe: (recipeId: string) => Promise<void>;
  updateSchedule: (day: DayOfWeek, mealType: MealType, recipeId: string | null) => Promise<void>;
  getIngredientById: (id: string) => Ingredient | undefined;
  getRecipeById: (id: string) => Recipe | undefined;
  setShoppingListData: (shoppingList: ShoppingList | null, checkedItems: Record<string, boolean>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// --- PROVIDER COMPONENT ---
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { data: ingredients, add: addIngredient, update: updateIngredientDoc, remove: removeIngredient } = useCollection<Ingredient>('ingredients');
  const { data: recipes, add: addRecipe, update: updateRecipeDoc, remove: removeRecipe } = useCollection<Recipe>('recipes');
  const { data: scheduleData, update: updateScheduleDoc, setData: setScheduleData, loading: scheduleLoading } = useCollection<DaySchedule>('schedule');
  const { data: shoppingListData, update: updateShoppingListDoc, loading: shoppingListLoading } = useCollection<ShoppingListData>('shopping-list');
  
  const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const initializeSchedule = async () => {
        // Only initialize if the fetch has completed and the schedule is empty.
        if (!scheduleLoading && scheduleData.length === 0) {
            console.log("Initializing schedule in Firestore...");
            const batch = writeBatch(db);
            const initialSchedule: DaySchedule[] = DAYS_OF_WEEK.map(day => {
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
            setScheduleData(initialSchedule); // Update local state after writing to Firestore
        }
    };
    initializeSchedule();
  }, [scheduleData, scheduleLoading, setScheduleData]);

  useEffect(() => {
    if (!shoppingListLoading) {
      const storedData = shoppingListData.find(item => item.id === 'current');
      if (storedData) {
        setShoppingList(storedData.list);
        setCheckedItems(storedData.checkedItems || {});
      }
    }
  }, [shoppingListData, shoppingListLoading]);


  const weeklySchedule: WeeklySchedule = DAYS_OF_WEEK.map(day => {
    const foundDay = scheduleData.find(s => s.dayOfWeek === day);
    if (foundDay) {
      return foundDay;
    }
    // Return a default structure if data is not yet loaded or found
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
    // Before deleting the ingredient, remove it from all recipes
    const batch = writeBatch(db);
    recipes.forEach(recipe => {
        const newIngredients = recipe.ingredients.filter(ing => ing.ingredientId !== ingredientId);
        if (newIngredients.length !== recipe.ingredients.length) {
            const recipeRef = doc(db, "recipes", recipe.id);
            batch.update(recipeRef, { ingredients: newIngredients });
        }
    });
    await batch.commit();

    // Now delete the ingredient itself
    await removeIngredient(ingredientId);
  }

  const updateRecipe = async (recipe: Recipe) => {
    await updateRecipeDoc(recipe.id, recipe);
  }

  const deleteRecipe = async (recipeId: string) => {
    // Before deleting the recipe, remove it from the schedule
    const batch = writeBatch(db);
    scheduleData.forEach(daySchedule => {
        const newMeals = daySchedule.meals.map(meal => meal.recipeId === recipeId ? { ...meal, recipeId: null } : meal);
        // Check if a change actually happened before adding to batch
        if (JSON.stringify(newMeals) !== JSON.stringify(daySchedule.meals)) {
            const scheduleRef = doc(db, "schedule", daySchedule.id);
            batch.update(scheduleRef, { meals: newMeals });
        }
    });
    await batch.commit();
    
    // Now delete the recipe itself
    await removeRecipe(recipeId);
  }

  const updateSchedule = async (day: DayOfWeek, mealType: MealType, recipeId: string | null) => {
    const daySchedule = scheduleData.find(ds => ds.dayOfWeek === day);
    if (daySchedule) {
        const newMeals = daySchedule.meals.map(meal =>
            meal.mealType === mealType ? { ...meal, recipeId } : meal
        );
        await updateScheduleDoc(daySchedule.id, { meals: newMeals });
    }
  };
  
  const getIngredientById = (id: string) => ingredients.find(ing => ing.id === id);
  const getRecipeById = (id: string) => recipes.find(rec => rec.id === id);

  const setShoppingListData = async (list: ShoppingList | null, checked: Record<string, boolean>) => {
    setShoppingList(list);
    setCheckedItems(checked);
    const docRef = doc(db, "shopping-list", "current");
    const dataToSet = {
        list: list || {},
        checkedItems: checked || {}
    };
    await setDoc(docRef, dataToSet, { merge: true });
  }


  const value: AppContextType = {
    ingredients,
    recipes,
    schedule: weeklySchedule,
    shoppingList,
    checkedItems,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    updateSchedule,
    getIngredientById,
    getRecipeById,
    setShoppingListData
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
