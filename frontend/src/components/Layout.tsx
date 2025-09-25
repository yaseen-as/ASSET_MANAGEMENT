import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { logout } from '../store/slices/authSlice';
import { 
  LayoutDashboard, 
  PieChart, 
  TrendingUp, 
  Bell, 
  User, 
  LogOut,
  Menu,
  X,
  BarChart3,
  Activity,
  AlertTriangle
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Portfolio', href: '/portfolio', icon: PieChart },
    { name: 'Market Data', href: '/market-data', icon: TrendingUp },
    { name: 'Transactions', href: '/transactions', icon: Activity },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Alerts', href: '/alerts', icon: AlertTriangle },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth');
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-900">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/80" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gray-800 border-r-2 border-gray-700">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full text-gray-400 hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <SidebarContent navigation={navigation} location={location} handleLogout={handleLogout} user={user} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <SidebarContent navigation={navigation} location={location} handleLogout={handleLogout} user={user} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-800 border-b-2 border-gray-700">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-400 hover:text-gray-100 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
};

interface SidebarContentProps {
  navigation: Array<{
    name: string;
    href: string;
    icon: React.ElementType;
  }>;
  location: { pathname: string };
  handleLogout: () => void;
  user: any;
}

const SidebarContent: React.FC<SidebarContentProps> = ({ navigation, location, handleLogout, user }) => {
  return (
    <div className="flex-1 flex flex-col min-h-0 border-r-2 border-gray-700 bg-gray-800">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        {/* Logo/Brand */}
        <div className="flex items-center flex-shrink-0 px-4 mb-8">
          <div className="flex items-center">
            <div className="bg-gray-700 border-2 border-gray-600 rounded-lg p-2">
              <PieChart className="h-8 w-8 text-gray-100" />
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold text-gray-100">Asset Manager</h1>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Portfolio Hub</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-2 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`${
                  isActive
                    ? 'bg-gray-700 text-gray-100 border-l-4 border-gray-300'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-gray-100 border-l-4 border-transparent hover:border-gray-500'
                } group flex items-center px-4 py-3 text-sm font-medium transition-all duration-200`}
              >
                <Icon
                  className={`${
                    isActive ? 'text-gray-100' : 'text-gray-400 group-hover:text-gray-100'
                  } mr-3 h-5 w-5 transition-colors duration-200`}
                />
                {item.name}
                {isActive && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      
      {/* User Profile Section */}
      <div className="flex-shrink-0 border-t-2 border-gray-700 bg-gray-750">
        <div className="p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 bg-gray-700 border-2 border-gray-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-gray-100">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-100 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-2 p-2 text-gray-400 hover:text-gray-100 hover:bg-gray-700 rounded-lg border-2 border-transparent hover:border-gray-600 transition-all duration-200"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
