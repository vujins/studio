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
import { PlusCircle } from 'lucide-react';
import { useAppContext } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';

const AddIngredientForm = ({ setOpen }: { setOpen: (open: boolean) => void }) => {
  const { addIngredient } = useAppContext();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [market, setMarket] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && unit && market) {
      addIngredient({ name, unit, market });
      toast({
          title: 'Ingredient Added!',
          description: `${name} has been added to your list.`,
      })
      setOpen(false);
      setName('');
      setUnit('');
      setMarket('');
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
  const { ingredients } = useAppContext();
  const [open, setOpen] = useState(false);

  return (
    <div className="container mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Your Ingredients</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button style={{backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)'}}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Ingredient
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add a New Ingredient</DialogTitle>
              </DialogHeader>
              <AddIngredientForm setOpen={setOpen} />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Market</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ingredients.length > 0 ? (
                ingredients.map((ingredient) => (
                  <TableRow key={ingredient.id}>
                    <TableCell className="font-medium">{ingredient.name}</TableCell>
                    <TableCell>{ingredient.unit}</TableCell>
                    <TableCell>{ingredient.market}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-24">No ingredients yet. Add one to get started!</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default IngredientsPage;
