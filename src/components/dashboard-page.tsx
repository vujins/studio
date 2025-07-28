'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Carrot, BookCopy, CalendarDays, ShoppingCart } from 'lucide-react';
import { useAppContext } from '@/context/app-context';

interface DashboardPageProps {
  setActivePage: (page: 'ingredients' | 'recipes' | 'schedule' | 'shopping-list') => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ setActivePage }) => {
    const { ingredients, recipes } = useAppContext();
  
    const quickLinks = [
    {
      title: 'Manage Ingredients',
      description: `You have ${ingredients.length} ingredients.`,
      icon: <Carrot className="w-8 h-8 text-primary" />,
      page: 'ingredients' as const,
    },
    {
      title: 'Create Recipes',
      description: `You have ${recipes.length} recipes.`,
      icon: <BookCopy className="w-8 h-8 text-primary" />,
      page: 'recipes' as const,
    },
    {
      title: 'Build Your Schedule',
      description: 'Plan your weekly meals.',
      icon: <CalendarDays className="w-8 h-8 text-primary" />,
      page: 'schedule' as const,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline text-gray-800">Welcome to MealPrep Master</h1>
        <p className="text-lg text-muted-foreground mt-1">Your personal assistant for meal planning and grocery shopping.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((link) => (
          <Card key={link.title} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">{link.title}</CardTitle>
              {link.icon}
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{link.description}</p>
              <Button variant="link" className="p-0 h-auto mt-4" onClick={() => setActivePage(link.page)}>
                Go to {link.page} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="bg-gradient-to-r from-primary/80 to-accent/80 text-primary-foreground border-0">
          <CardHeader>
              <CardTitle>Ready to shop?</CardTitle>
          </CardHeader>
          <CardContent>
              <p className="mb-4">Generate a shopping list based on your weekly meal schedule with one click.</p>
              <Button 
                variant="secondary" 
                className="bg-background text-foreground hover:bg-background/90"
                onClick={() => setActivePage('shopping-list')}
              >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Generate Shopping List
              </Button>
          </CardContent>
      </Card>

    </div>
  );
};

export default DashboardPage;
