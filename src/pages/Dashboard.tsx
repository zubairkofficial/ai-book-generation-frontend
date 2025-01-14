import { Button } from '@/components/ui/button';
import {
  BookOpen,
  PlusCircle,
  Settings,
  LogOut,
  BookOpenCheck,
  BarChart,
  BookMarked,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useDispatch } from 'react-redux';
import { logout } from '@/features/auth/authSlice';

export default function Dashboard() {
  const dispatch = useDispatch();
  const handleLogout=() => {
    dispatch(logout())
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r p-4">
        <div className="flex items-center gap-2 mb-8">
          <BookOpenCheck className="h-6 w-6 text-amber-500" />
          <span className="text-xl font-bold">StoryForge</span>
        </div>
        
        <nav className="space-y-2">
          <Button variant="ghost" className="w-full justify-start">
            <BookOpen className="mr-2 h-4 w-4" />
            My Books
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Sparkles className="mr-2 h-4 w-4" />
            AI Assistant
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <BarChart className="mr-2 h-4 w-4" />
            Analytics
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </nav>

        <div className="absolute bottom-4 w-[calc(100%-2rem)]">
          <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">My Books</h1>
            <Button className="bg-amber-500 hover:bg-amber-600">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Book
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Book Cards */}
            <Card className="p-4 hover:shadow-lg transition-shadow">
              <div className="aspect-[3/4] bg-gray-100 rounded-md mb-4 flex items-center justify-center">
                <BookMarked className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="font-semibold mb-1">The Lost Chapter</h3>
              <p className="text-sm text-gray-500 mb-4">Last edited 2 hours ago</p>
              <div className="flex justify-between items-center">
                <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full">
                  In Progress
                </span>
                <Button variant="ghost" size="sm">
                  Open
                </Button>
              </div>
            </Card>

            {/* Add more book cards here */}
          </div>
        </div>
      </main>
    </div>
  );
}