import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import {  useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate=useNavigate()
  return (
    <header className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold">My Books</h1>
      <Button onClick={()=>navigate("/books/add")} className="bg-amber-500 hover:bg-amber-600">
        <PlusCircle className="mr-2 h-4 w-4" />
        New Book
      </Button>
    </header>
  );
};

export default Header;
