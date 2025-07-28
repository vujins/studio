'use client';
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useAppContext } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import type { Ingredient } from '@/lib/types';

const IngredientForm = ({ setOpen, ingredientToEdit }: { setOpen: (open: boolean) => void; ingredientToEdit?: Ingredient | null; }) => {
  const { addIngredient, updateIngredient } = useAppContext();
  const { toast } = useToast();
  const [name, setName] = useState(ingredientToEdit?.name || '');
  const [unit, setUnit] = useState(ingredientToEdit?.unit || '');
  const [market, setMarket] = useState(ingredientToEdit?.market || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && unit && market) {
      try {
        if (ingredientToEdit) {
          await updateIngredient({ ...ingredientToEdit, name, unit, market });
          toast({
              title: 'Ingredient Updated!',
              description: `${name} has been updated.`,
          })
        } else {
          await addIngredient({ name, unit, market });
          toast({
              title: 'Ingredient Added!',
              description: `${name} has been added to your list.`,
          })
        }
        setOpen(false);
      } catch (error) {
        toast({
            title: 'Error',
            description: 'Could not save ingredient. Please try again.',
            variant: 'destructive',
        })
      }
    } else {
        toast({
            title: 'Error',
            description: 'Please fill out all fields.',
            variant: 'destructive',
        })
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Name
          </Label>
          <Input id="name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" placeholder="e.g., Chicken Breast" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="unit" className="text-right">
            Unit
          </Label>
          <Input id="unit" value={unit} onChange={e => setUnit(e.target.value)} className="col-span-3" placeholder="e.g., g, ml, pcs"/>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="market" className="text-right">
            Market
          </Label>
          <Input id="market" value={market} onChange={e => setMarket(e.target.value)} className="col-span-3" placeholder="e.g., SuperMart" />
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="secondary">Cancel</Button>
        </DialogClose>
        <Button type="submit" style={{backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)'}}>Save Ingredient</Button>
      </DialogFooter>
    </form>
  );
};


const IngredientsPage = () => {
  const { ingredients, deleteIngredient } = useAppContext();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);

  const handleEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setOpen(true);
  }

  const handleDelete = async (ingredient: Ingredient) => {
    if (window.confirm(`Are you sure you want to delete ${ingredient.name}?`)) {
      try {
        await deleteIngredient(ingredient.id);
        toast({
          title: 'Ingredient Deleted',
          description: `${ingredient.name} has been removed.`,
        })
      } catch (error) {
        toast({
            title: 'Error',
            description: `Could not delete ${ingredient.name}. Please try again.`,
            variant: 'destructive',
        })
      }
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setEditingIngredient(null);
    }
  }

  return (
    <div className="container mx-auto">
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Ingredients</CardTitle>
            <DialogTrigger asChild>
              <Button style={{backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)'}}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Ingredient
              </Button>
            </DialogTrigger>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Market</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ingredients.length > 0 ? (
                  ingredients.map((ingredient) => (
                    <TableRow key={ingredient.id}>
                      <TableCell className="font-medium">{ingredient.name}</TableCell>
                      <TableCell>{ingredient.unit}</TableCell>
                      <TableCell>{ingredient.market}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(ingredient)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(ingredient)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">No ingredients yet. Add one to get started!</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingIngredient ? 'Edit Ingredient' : 'Add a New Ingredient'}</DialogTitle>
          </DialogHeader>
          <IngredientForm setOpen={setOpen} ingredientToEdit={editingIngredient} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IngredientsPage;
