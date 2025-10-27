import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../components/ui/dropdown-menu';
import { Home, Calendar, Plus, BarChart3, User, LogOut, Moon, Sun, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/sheet';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Events', path: '/events', icon: Calendar },
    { name: 'My Events', path: '/my-events', icon: Calendar },
    ...(user?.role === 'admin' || user?.role === 'organizer' ? [{ name: 'Create Event', path: '/events/create', icon: Plus }] : []),
    ...(user?.role === 'admin' || user?.role === 'organizer' ? [{ name: 'Analytics', path: '/analytics', icon: BarChart3 }] : []),
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const NavLinks = () => (
    <>
      {navItems.map((item) => (
        <Button
          key={item.path}
          data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
          onClick={() => navigate(item.path)}
          variant={location.pathname === item.path ? 'default' : 'ghost'}
          className={`justify-start gap-3 ${location.pathname === item.path ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' : ''}`}
        >
          <item.icon className="h-5 w-5" />
          {item.name}
        </Button>
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Top Navigation */}
      <nav className="glass-card border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" data-testid="mobile-menu-btn">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="flex flex-col gap-2 mt-8">
                  <NavLinks />
                </div>
              </SheetContent>
            </Sheet>

            <h1 data-testid="app-title" className="text-2xl font-bold gradient-text cursor-pointer" onClick={() => navigate('/dashboard')}>
              Campus Pulse
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Button
              data-testid="theme-toggle-btn"
              onClick={toggleTheme}
              variant="ghost"
              size="icon"
              className="rounded-full"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full" data-testid="user-menu-btn">
                  <Avatar>
                    <AvatarFallback className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <p className="text-xs font-semibold text-purple-600 capitalize">{user?.role}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem data-testid="profile-menu-item" onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem data-testid="logout-menu-item" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 min-h-[calc(100vh-73px)] glass-card border-r p-6 sticky top-[73px]">
          <div className="flex flex-col gap-2">
            <NavLinks />
          </div>
        </aside>

        {/* Page Content */}
        <main data-testid="main-content" className="flex-1 p-6 lg:p-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;