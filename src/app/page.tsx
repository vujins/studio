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
        <path d="M21.2,10.79,19.33,12.2A4.2,4.2,0,0,1,19.33,15a4.34,4.34,0,0,1-3.41.93L12.2,12.2l3.72-3.73A4.2,4.2,0,0,1,21.2,10.79Z" />
        <path d="M12.2,12.2,6.5,17.9a4.21,4.21,0,0,1-6-6L6.17,6.17a4.2,4.2,0,0,1,2.32-.67,4.33,4.33,0,0,1,3.41.93Z" />
      </svg>
      <h1 className="text-lg font-bold font-headline">Badger's Shopping List</h1>
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
