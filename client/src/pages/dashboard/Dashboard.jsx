import { useEffect, useState } from "react";
import { request } from "../../services/api";
import ProjectCard from "../../modules/dashboard/ProjectCard";
import CreateProjectModal from "../../modules/dashboard/CreateProjectModal";
import SearchModal from "../../modules/search/SearchModal";
import UserActivityFeed from "../../modules/activity/UserActivityFeed";
import { Link } from "react-router-dom";
import { 
  Megaphone, 
  Plus, 
  Search as SearchIcon, 
  Sparkles, 
  Layout, 
  StickyNote, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle2,
  Pin,
  ChevronRight
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await request("/projects");
      setProjects(data || []);
    } catch (err) {
      console.error("Failed to load projects", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const k = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearch(true);
      }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);

  const stats = [
    { label: "Total Projects", value: projects.length, icon: <Layout size={18} />, color: "bg-blue-50 text-blue-600" },
    { label: "Active Team", value: "12", icon: <Users size={18} />, color: "bg-purple-50 text-purple-600" },
    { label: "Growth", value: "+24%", icon: <TrendingUp size={18} />, color: "bg-green-50 text-green-600" },
    { label: "Avg. Time", value: "4.2h", icon: <Clock size={18} />, color: "bg-orange-50 text-orange-600" },
  ];

  const upcomingTasks = [
    { id: 1, title: "Design campaign banners", project: "Social Media Ads", due: "Today", color: "bg-pink-100 text-pink-600" },
    { id: 2, title: "Review Q1 strategy", project: "Marketing", due: "Tomorrow", color: "bg-blue-100 text-blue-600" },
    { id: 3, title: "Client onboarding", project: "Ops", due: "12 Mar", color: "bg-orange-100 text-orange-600" },
  ];

  return (
    <div className="dashboard-v2 p-4 lg:p-10 max-w-[1600px] mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      
      {/* Welcome Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] mb-2">
             <div className="w-4 h-px bg-blue-600"></div>
             <span>System Status: Optimal</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Welcome back, <span className="text-blue-600">{user?.name || "Alex"}</span>!
          </h1>
          <p className="text-gray-500 mt-2 font-medium text-lg">You have <span className="text-gray-900 font-bold">4 new messages</span> and <span className="text-gray-900 font-bold">2 urgent tasks</span>.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSearch(true)}
            className="flex items-center gap-3 bg-white border border-gray-200 hover:border-blue-200 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-2xl font-bold transition-all shadow-sm active:scale-95 group"
          >
            <SearchIcon size={20} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
            <span>Quick Search</span>
            <kbd className="hidden sm:inline-block ml-4 px-2 py-0.5 text-[10px] font-black text-gray-400 bg-gray-50 border border-gray-200 rounded-lg shadow-xs">⌘K</kbd>
          </button>
          
          <button 
            onClick={() => setOpen(true)}
            className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black transition-all shadow-xl shadow-blue-100 active:scale-95"
          >
            <Plus size={20} strokeWidth={3} />
            <span>Create Project</span>
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all group">
            <div className={`w-12 h-12 ${s.color} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
              {s.icon}
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{s.label}</p>
            <p className="text-3xl font-black text-gray-900 mt-1 tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        
        {/* Left Column: Projects & Workspaces (8 cols) */}
        <div className="xl:col-span-8 space-y-12">
          
          {/* AI Spotlight Section */}
          <section>
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                  <Sparkles className="text-blue-600" size={24} />
                  Intelligent Workspaces
               </h2>
               <div className="h-px flex-1 bg-gray-100 mx-6 hidden sm:block"></div>
               <button className="text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-1">
                  Manage AI Tools <ChevronRight size={16} />
               </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <Link 
                to="/ai-editor"
                className="group relative bg-gray-900 p-10 rounded-[3rem] overflow-hidden shadow-2xl transition-all hover:-translate-y-2"
              >
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/30 blur-[120px] -mr-40 -mt-40 rounded-full group-hover:bg-blue-600/40 transition-colors" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-8">
                    <div className="p-5 bg-blue-600 rounded-[1.5rem] text-white shadow-2xl shadow-blue-600/40 group-hover:scale-110 transition-transform">
                      <Sparkles size={32} />
                    </div>
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] bg-blue-400/10 px-4 py-2 rounded-full border border-blue-400/20 backdrop-blur-md">EXPERIMENTAL</span>
                  </div>
                  <h3 className="text-3xl font-black text-white mb-4 tracking-tight">Modern AI Editor</h3>
                  <p className="text-gray-400 leading-relaxed font-medium text-lg">
                    Production-grade UI generation and smart image effects powered by Gemini 2.5 Flash.
                  </p>
                  <div className="mt-10 flex items-center gap-4 text-blue-400 font-black text-sm group-hover:gap-6 transition-all uppercase tracking-widest">
                     <span>Launch Neural Editor</span>
                     <span className="text-xl">→</span>
                  </div>
                </div>
              </Link>

              <Link 
                to="/task-management-social-media-manager"
                className="group bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl transition-all hover:-translate-y-2 relative overflow-hidden"
              >
                <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                <div className="flex items-start justify-between mb-8">
                  <div className="p-5 bg-indigo-50 rounded-[1.5rem] text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all group-hover:scale-110">
                    <Megaphone size={32} />
                  </div>
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Social Ad Manager</h3>
                <p className="text-gray-500 leading-relaxed font-medium text-lg">
                  Unified command for campaign planning, multi-platform ad management, and team sync.
                </p>
                <div className="mt-10 flex items-center gap-4 text-indigo-600 font-black text-sm group-hover:gap-6 transition-all uppercase tracking-widest">
                   <span>Open Workspace</span>
                   <span className="text-xl">→</span>
                </div>
              </Link>

            </div>
          </section>

          {/* Projects Grid */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                <Layout className="text-blue-600" size={24} />
                Recent Projects
              </h2>
              <div className="h-px flex-1 bg-gray-100 mx-6 hidden sm:block"></div>
              <button className="text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors">View All Directory</button>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1,2,3].map(i => (
                  <div key={i} className="h-56 bg-white border border-gray-100 rounded-[2.5rem] animate-pulse" />
                ))}
              </div>
            ) : projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map(p => (
                  <ProjectCard key={p._id} project={p} />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-[3rem] p-20 text-center shadow-sm">
                 <div className="w-24 h-24 bg-blue-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner text-blue-200">
                    <Plus size={48} strokeWidth={3} />
                 </div>
                 <h3 className="font-black text-gray-900 text-2xl tracking-tight">No projects yet</h3>
                 <p className="text-gray-500 mt-2 mb-10 text-lg font-medium">Create your first architectural project to begin.</p>
                 <button 
                  onClick={() => setOpen(true)}
                  className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
                 >
                   Start New Project
                 </button>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Sidebar features (4 cols) */}
        <div className="xl:col-span-4 space-y-10">
           
           {/* Quick Action Widget */}
           <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <h3 className="font-black text-gray-900 mb-8 text-xl tracking-tight">Quick Actions</h3>
              <div className="space-y-4">
                 <Link to="/notes/new" className="flex items-center gap-4 w-full p-5 rounded-2xl bg-gray-50 hover:bg-blue-600 hover:text-white transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-blue-600 group-hover:border-white shadow-sm transition-all group-hover:scale-110">
                       <StickyNote size={20} />
                    </div>
                    <span className="font-bold">Draft New Note</span>
                    <ChevronRight size={18} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                 </Link>
                 <Link to="/tasks" className="flex items-center gap-4 w-full p-5 rounded-2xl bg-gray-50 hover:bg-green-600 hover:text-white transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-green-600 group-hover:border-white shadow-sm transition-all group-hover:scale-110">
                       <CheckCircle2 size={20} />
                    </div>
                    <span className="font-bold">Global Task List</span>
                    <ChevronRight size={18} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                 </Link>
                 <Link to="/ai-editor" className="flex items-center gap-4 w-full p-5 rounded-2xl bg-gray-50 hover:bg-purple-600 hover:text-white transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-purple-600 group-hover:border-white shadow-sm transition-all group-hover:scale-110">
                       <Sparkles size={20} />
                    </div>
                    <span className="font-bold">Neural Image Editor</span>
                    <ChevronRight size={18} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                 </Link>
              </div>
           </div>

           {/* Upcoming Tasks Widget */}
           <div className="bg-gray-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full"></div>
              <div className="flex items-center justify-between mb-8 relative z-10">
                 <h3 className="font-black text-white text-xl tracking-tight">Priority Tasks</h3>
                 <Link to="/tasks" className="text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-colors">View All</Link>
              </div>
              <div className="space-y-4 relative z-10">
                 {upcomingTasks.map(t => (
                   <div key={t.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 cursor-pointer group">
                      <div className={`w-10 h-10 rounded-xl ${t.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                         <CheckCircle2 size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="text-white text-sm font-bold truncate">{t.title}</p>
                         <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-0.5">{t.project}</p>
                      </div>
                      <span className="text-white/60 text-[10px] font-black">{t.due}</span>
                   </div>
                 ))}
              </div>
           </div>

           {/* Pinned / Favorites */}
           <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="font-black text-gray-900 text-xl tracking-tight flex items-center gap-2">
                    <Pin size={20} className="rotate-45 text-blue-600" />
                    Pinned
                 </h3>
                 <button className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Edit</button>
              </div>
              <div className="space-y-2">
                 <div className="p-4 rounded-2xl bg-gray-50 flex items-center gap-4 hover:bg-blue-50 transition-colors cursor-pointer group">
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-blue-600 font-black shadow-sm group-hover:scale-110 transition-transform">#</div>
                    <span className="text-sm font-bold text-gray-700">Product Roadmap 2024</span>
                 </div>
                 <div className="p-4 rounded-2xl bg-gray-50 flex items-center gap-4 hover:bg-blue-50 transition-colors cursor-pointer group">
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-blue-600 font-black shadow-sm group-hover:scale-110 transition-transform">#</div>
                    <span className="text-sm font-bold text-gray-700">Design System v2.1</span>
                 </div>
              </div>
           </div>

           {/* Activity Feed */}
           <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="font-black text-gray-900 text-xl tracking-tight">Timeline</h3>
                 <button className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-full transition-colors">Mark All Read</button>
              </div>
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                 <UserActivityFeed />
              </div>
          </div>

        </div>

      </div>

      {open && (
        <CreateProjectModal
          onClose={() => setOpen(false)}
          onCreated={(p) => setProjects(prev => [...prev, p])}
        />
      )}

      {search && <SearchModal onClose={() => setSearch(false)} />}
    </div>
  );
}
