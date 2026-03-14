import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { request } from "../../api/client";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Calendar,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import "./ProjectAnalyticsPage.css";

const ProjectAnalyticsPage = () => {
  const { projectId } = useParams();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await request(`/projects/${projectId}/analytics`);
        setStats(data);
      } catch (err) {
        console.error("Analytics load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [projectId]);

  if (loading) return <div className="p-8">Loading Analytics...</div>;

  return (
    <div className="analytics-container">
      <header className="analytics-header">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Analytics</h1>
          <p className="text-gray-500">Track your team's performance and project progress</p>
        </div>
        <div className="flex gap-3">
          <button className="date-picker-btn">
            <Calendar size={16} />
            <span>Last 30 days</span>
            <ChevronDown size={14} />
          </button>
        </div>
      </header>

      <div className="stats-grid">
        <StatCard 
          title="Active Tasks" 
          value={stats?.activeTasks || 0} 
          change="+12%" 
          isPositive={true}
          icon={<BarChart3 className="text-blue-600" size={20} />}
        />
        <StatCard 
          title="Completed" 
          value={stats?.completedTasks || 0} 
          change="+5%" 
          isPositive={true}
          icon={<TrendingUp className="text-green-600" size={20} />}
        />
        <StatCard 
          title="Team Members" 
          value={stats?.teamSize || 0} 
          change="0%" 
          isPositive={true}
          icon={<Users className="text-purple-600" size={20} />}
        />
        <StatCard 
          title="Avg. Time" 
          value="4.2d" 
          change="-1.5d" 
          isPositive={true}
          icon={<Clock className="text-orange-600" size={20} />}
        />
      </div>

      <div className="charts-section">
        <div className="chart-card main-chart">
           <div className="chart-header">
             <h3 className="font-bold text-gray-800">Task Velocity</h3>
             <p className="text-xs text-gray-500">Tasks completed per week</p>
           </div>
           <div className="chart-placeholder">
              {/* Visual representation of a chart */}
              <div className="flex items-end gap-4 h-48 px-4">
                 {[40, 65, 30, 85, 55, 95, 70].map((h, i) => (
                   <div key={i} className="flex-1 bg-blue-100 rounded-t-lg relative group transition-all hover:bg-blue-500">
                      <div className="h-full w-full bg-blue-500 rounded-t-lg origin-bottom transition-transform" style={{ height: `${h}%` }}></div>
                   </div>
                 ))}
              </div>
              <div className="flex justify-between px-4 mt-2 text-[10px] text-gray-400 font-bold">
                 <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
              </div>
           </div>
        </div>

        <div className="chart-card side-list">
           <h3 className="font-bold text-gray-800 mb-4">Top Contributors</h3>
           <div className="contributor-list">
              {stats?.contributors?.map((c, i) => (
                <div key={i} className="contributor-item">
                   <img src={c.avatar || `https://ui-avatars.com/api/?name=${c.name}`} alt="" />
                   <div className="flex-1">
                      <p className="text-sm font-bold text-gray-800">{c.name}</p>
                      <p className="text-xs text-gray-500">{c.taskCount} tasks completed</p>
                   </div>
                   <div className="text-xs font-bold text-blue-600">Top {i+1}</div>
                </div>
              )) || <p className="text-sm text-gray-400">No data available</p>}
           </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, change, isPositive, icon }) => (
  <div className="stat-card">
    <div className="flex justify-between items-start mb-4">
      <div className="icon-wrapper">{icon}</div>
      <div className={`change-tag ${isPositive ? 'positive' : 'negative'}`}>
        {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        <span>{change}</span>
      </div>
    </div>
    <p className="stat-label">{title}</p>
    <h2 className="stat-value">{value}</h2>
  </div>
);

export default ProjectAnalyticsPage;
