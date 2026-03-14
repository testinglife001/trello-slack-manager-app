import { Outlet, Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  PlusCircle, 
  MessageSquare, 
  StickyNote, 
  Sparkles, 
  Bell, 
  Search as SearchIcon, 
  User, 
  Settings,
  Menu,
  X,
  CheckCircle2,
  Calendar,
  BarChart2,
  Inbox,
  LogOut
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import NotificationToasts from "../components/notifications/NotificationToasts";
import SearchModal from "../modules/search/SearchModal";

export default function RootLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/" },
    { label: "Inbox", icon: <Inbox size={20} />, path: "/inbox" },
    { label: "AI Editor", icon: <Sparkles size={20} />, path: "/ai-editor" },
    { label: "Tasks", icon: <CheckCircle2 size={20} />, path: "/tasks" },
    { label: "Notes", icon: <StickyNote size={20} />, path: "/notes" },
  ];

  const secondaryNav = [
    { label: "Calendar", icon: <Calendar size={18} />, path: "/calendar" },
    { label: "Analytics", icon: <BarChart2 size={18} />, path: "/analytics" },
    { label: "Messages", icon: <MessageSquare size={18} />, path: "/channels" },
  ];

  useEffect(() => {
    const k = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);

  const isActive = (path) => {
    if (path === "/" && location.pathname !== "/") return false;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Search Modal */}
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}

      {/* Mobile Sidebar Overlay */}
      {!sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(true)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 w-72 bg-white border-r border-gray-200 z-50 transition-transform duration-300 lg:relative lg:translate-x-0 flex flex-col shadow-2xl lg:shadow-none`}
      >
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Sparkles size={20} />
            </div>
            <span className="font-black text-xl tracking-tight text-gray-900 italic">TRELLOSLACK</span>
          </div>
        </div>

        <nav className="flex-1 p-5 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-200 group ${
                isActive(item.path)
                  ? "bg-blue-600 text-white font-bold shadow-xl shadow-blue-100"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-semibold"
              }`}
            >
              <span className={isActive(item.path) ? "text-white" : "text-gray-400 group-hover:text-blue-500 transition-colors"}>
                {item.icon}
              </span>
              <span className="text-sm tracking-tight">{item.label}</span>
              {item.label === "Inbox" && (
                <span className="ml-auto w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-black border-2 border-white shadow-sm">4</span>
              )}
            </Link>
          ))}

          <div className="pt-8 pb-3 px-4">
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Tools & Insights</span>
          </div>

          {secondaryNav.map((item) => (
             <Link
               key={item.path}
               to={item.path}
               className={`flex items-center gap-3.5 px-4 py-2.5 rounded-2xl transition-all duration-200 group ${
                 isActive(item.path)
                   ? "bg-gray-900 text-white font-bold shadow-xl shadow-gray-200"
                   : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-semibold"
               }`}
             >
               <span className={isActive(item.path) ? "text-white" : "text-gray-400 group-hover:text-gray-600"}>
                 {item.icon}
               </span>
               <span className="text-sm tracking-tight">{item.label}</span>
             </Link>
          ))}

          <div className="pt-8 pb-3 px-4">
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Workspace</span>
          </div>
          
          <Link
            to="/projects"
            className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-semibold transition-all group"
          >
            <PlusCircle size={20} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
            <span className="text-sm tracking-tight">Active Projects</span>
          </Link>
        </nav>

        <div className="p-5 border-t border-gray-100">
          <div className="bg-gray-50 rounded-[2rem] p-4 flex flex-col gap-4 border border-gray-100/50">
             <div className="flex items-center gap-4">
               <div className="w-11 h-11 rounded-full bg-white border border-gray-200 shadow-sm overflow-hidden flex-shrink-0 flex items-center justify-center">
                  <img src={user?.avatar || `https://i.pravatar.cc/150?u=${user?._id}`} alt="" className="w-full h-full object-cover" />
               </div>
               <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{user?.name || "User"}</p>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest truncate">{user?.username || "Member"}</p>
               </div>
               <Link to="/profile" className="p-2 bg-white rounded-xl shadow-sm border border-gray-200 text-gray-400 hover:text-gray-900 transition-colors">
                  <Settings size={18} />
               </Link>
             </div>
             <button 
               onClick={logout}
               className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 hover:border-red-100 transition-all shadow-sm"
             >
               <LogOut size={14} />
               Sign Out
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <NotificationToasts />
        
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-10 flex-shrink-0 z-30">
          <div className="flex items-center gap-5">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2.5 hover:bg-gray-100 rounded-xl lg:hidden text-gray-600 transition-colors"
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            
            <div 
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex items-center bg-gray-50 border border-gray-200/80 rounded-2xl px-4 py-2 w-72 lg:w-[450px] hover:border-blue-400/50 hover:bg-white transition-all cursor-pointer group shadow-sm shadow-gray-100/50"
            >
              <SearchIcon size={18} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
              <span className="text-sm ml-3 text-gray-400 font-medium">Search for tasks, projects or messages...</span>
              <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 text-[10px] font-black text-gray-400 bg-white border border-gray-200 rounded-lg ml-auto shadow-xs">
                 <span>⌘</span>
                 <span>K</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <button className="p-2.5 text-gray-500 hover:bg-gray-100 hover:text-blue-600 rounded-xl relative transition-all group">
              <Bell size={22} />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-[3px] border-white ring-2 ring-red-500/20 group-hover:scale-110 transition-transform"></span>
            </button>
            
            <div className="h-8 w-px bg-gray-200 mx-1"></div>
            
            <button className="flex items-center gap-4 hover:bg-gray-50 p-1.5 pr-3 rounded-2xl transition-all group">
               <div className="w-9 h-9 rounded-xl bg-blue-100 border-2 border-white flex items-center justify-center text-blue-600 font-black shadow-md group-hover:scale-105 transition-transform">
                  AR
               </div>
               <div className="hidden lg:block text-left">
                  <p className="text-[13px] font-black text-gray-900 tracking-tight">Alex Rivera</p>
                  <div className="flex items-center gap-1.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                     <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Active</p>
                  </div>
               </div>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50/50 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
