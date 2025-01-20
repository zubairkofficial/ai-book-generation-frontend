import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Header = () => {
  return (
    <header className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold">My Books</h1>
      <Button className="bg-amber-500 hover:bg-amber-600">
        <PlusCircle className="mr-2 h-4 w-4" />
        <NavLink to="/add">New Book</NavLink>
      </Button>
    </header>
  );
};

export default Header;
