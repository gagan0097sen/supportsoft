



import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { LogOut, Menu, X, Package, Layers } from 'lucide-react';
import { PlansModule } from './Modules/PlansModule';
import { SubscriptionModule } from './Modules/SubscriptionModule';
import AllUsers from "./AllUser"
import AdminRegisterModule from "./Modals/AdminRegisterModel";

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeModule, setActiveModule] = useState('plans'); // default to plans

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Sidebar menu items
  const menuItems = [
    {
      id: 'plans',
      label: 'Plans',
      icon: Package,
      component: 'plans',
    },
    {
      id: 'subscriptions',
      label: 'Subscriptions',
      icon: Layers,
      component: 'subscriptions',
    },
    {
      id: 'allUsers',
      label: 'All Users',
      icon: Layers,
      component: 'allUsers',
    },
    {
      id: 'adminRegister',
      label: 'Register Admin',
      icon: Layers,
      component: 'adminRegister',
    },
  ];

  // Render content based on active module
  const renderContent = () => {
    switch (activeModule) {
      case 'plans':
        return <PlansModule />;
      case 'subscriptions':
        return <SubscriptionModule />;
      case 'allUsers':
        return <AllUsers />;
      case 'adminRegister':
        return <AdminRegisterModule />;
      default:
        return <PlansModule />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center font-bold">
                S
              </div>
              <span className="font-bold text-lg">SupportSoft</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-slate-700 rounded transition"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.component)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  activeModule === item.component
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <Icon size={20} className="flex-shrink-0" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-slate-700 space-y-2">
          {/* {sidebarOpen && (
            <div className="px-4 py-2 bg-slate-700/30 rounded-lg">
              <p className="text-xs text-slate-400">Logged in as</p>
              <p className="text-sm font-semibold truncate">{user?.name || 'User'}</p>
            </div>
          )} */}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-red-600/20 hover:text-red-400 transition"
          >
            <LogOut size={20} className="flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {menuItems.find((item) => item.component === activeModule)?.label ||
              'Dashboard'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Welcome back!</p>
              <p className="font-semibold text-gray-900">{user?.name || 'User'}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8">{renderContent()}</main>
      </div>
    </div>
  );
}
