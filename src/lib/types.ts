export type Ingredient = {
  id: string;
  name: string;
  unit: string;
  market: string;
};

export type RecipeIngredient = {
  ingredientId: string;
  quantity: number;
};

export type Recipe = {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
};

export type MealType = 'Breakfast' | 'Snack 1' | 'Lunch' | 'Snack 2' | 'Dinner';

export type Meal = {
  mealType: MealType;
  recipeId: string | null;
};

export const MEAL_TYPES: MealType[] = ['Breakfast', 'Snack 1', 'Lunch', 'Snack 2', 'Dinner'];

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export type DaySchedule = {
  dayOfWeek: DayOfWeek;
  meals: Meal[];
};

export const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export type WeeklySchedule = DaySchedule[];
