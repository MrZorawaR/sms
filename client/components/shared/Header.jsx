'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { LogOut, User, GraduationCap, Menu } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function Header({ title, navigation = [] }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'teacher':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'student':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px] p-0">
              <SheetHeader className="p-6 border-b">
                <SheetTitle className="flex items-center space-x-2">
                  <div className="rounded-lg bg-blue-600 p-2">
                    <GraduationCap className="h-5 w-5 text-white" />
                  </div>
                  <span>{title}</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col space-y-1 p-4">
                {navigation && navigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <SheetClose asChild key={item.name}>
                      <Link href={item.href}>
                        <Button
                          variant={isActive ? 'default' : 'ghost'}
                          className={cn(
                            'w-full justify-start',
                            isActive
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          )}
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          {item.name}
                        </Button>
                      </Link>
                    </SheetClose>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>

          <div className="hidden md:flex rounded-lg bg-blue-600 p-2">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div className="hidden md:block">
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-500">Student Management System</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {user && (
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </div>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-100 text-blue-700">
                    {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.username}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.profile?.name || user?.profile?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}