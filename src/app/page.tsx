'use client';

import * as React from 'react';
import {
  Carrot,
  BookCopy,
  CalendarDays,
  LayoutDashboard,
  ShoppingCart,
  Menu,
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

import DashboardPage from '@/components/dashboard-page';
import IngredientsPage from '@/components/ingredients-page';
import RecipesPage from '@/components/recipes-page';
import SchedulePage from '@/components/schedule-page';
import ShoppingListPage from '@/components/shopping-list-page';

type Page =
  | 'dashboard'
  | 'ingredients'
  | 'recipes'
  | 'schedule'
  | 'shopping-list';

function AppLogo() {
  return (
    <div className="flex items-center gap-2 px-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="h-6 w-6 text-primary"
        fill="currentColor"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-12h2v4h-2v-4zm0 6h2v2h-2v-2z" />
        <path d="M17.23,14.45,15.77,13,13,15.77,14.45,17.23a5.24,5.24,0,0,0,2.78-2.78ZM8.23,6.77,9.69,8.23,6.77,11.15,5.31,9.69A5.24,5.24,0,0,1,8.23,6.77Z" />
      </svg>
      <h1 className="text-lg font-bold font-headline">MealPrep Master</h1>
    </div>
  );
}

function MainContent({
  activePage,
  setActivePage,
}: {
  activePage: Page;
  setActivePage: (page: Page) => void;
}) {
  const { isMobile, setOpenMobile } = useSidebar();
  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between p-4 md:hidden border-b">
        <AppLogo />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpenMobile(true)}
        >
          <Menu />
        </Button>
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
        {activePage === 'dashboard' && <DashboardPage setActivePage={setActivePage}/>}
        {activePage === 'ingredients' && <IngredientsPage />}
        {activePage === 'recipes' && <RecipesPage />}
        {activePage === 'schedule' && <SchedulePage />}
        {activePage === 'shopping-list' && <ShoppingListPage />}
      </main>
    </div>
  );
}

export default function Home() {
  const [activePage, setActivePage] = React.useState<Page>('dashboard');

  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="icon" className="border-r">
        <SidebarContent>
          <SidebarHeader>
            <AppLogo />
          </SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActivePage('dashboard')}
                isActive={activePage === 'dashboard'}
                tooltip="Dashboard"
              >
                <LayoutDashboard />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActivePage('ingredients')}
                isActive={activePage === 'ingredients'}
                tooltip="Ingredients"
              >
                <Carrot />
                <span>Ingredients</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActivePage('recipes')}
                isActive={activePage === 'recipes'}
                tooltip="Recipes"
              >
                <BookCopy />
                <span>Recipes</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActivePage('schedule')}
                isActive={activePage === 'schedule'}
                tooltip="Schedule"
              >
                <CalendarDays />
                <span>Schedule</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActivePage('shopping-list')}
                isActive={activePage === 'shopping-list'}
                tooltip="Shopping List"
              >
                <ShoppingCart />
                <span>Shopping List</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <MainContent activePage={activePage} setActivePage={setActivePage} />
      </SidebarInset>
    </SidebarProvider>
  );
}
