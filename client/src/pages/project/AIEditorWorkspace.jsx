import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { 
  Sparkles, 
  Wand2, 
  Type, 
  Image as ImageIcon, 
  Layout as LayoutIcon,
  Save,
  Play,
  Share2,
  ChevronRight,
  History,
  Settings,
  BrainCircuit
} from "lucide-react";
import "./AIEditorWorkspace.css";

const AIEditorWorkspace = () => {
  const { projectId } = useParams();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    <div className="ai-editor-container">
      {/* Sidebar - AI Tools */}
      <div className="ai-tools-sidebar">
        <div className="sidebar-header">
          <BrainCircuit className="text-purple-500" size={24} />
          <span className="font-bold text-gray-800">AI Assistant</span>
        </div>
        
        <div className="tool-section">
          <p className="section-label">Creation</p>
          <button className="tool-btn active">
            <Wand2 size={18} />
            <span>Generate UI</span>
          </button>
          <button className="tool-btn">
            <ImageIcon size={18} />
            <span>Asset Gen</span>
          </button>
          <button className="tool-btn">
            <Type size={18} />
            <span>Copywriter</span>
          </button>
        </div>

        <div className="tool-section">
          <p className="section-label">Analysis</p>
          <button className="tool-btn">
            <BarChart2 size={18} />
            <span>UX Audit</span>
          </button>
          <button className="tool-btn">
            <Users size={18} />
            <span>User Persona</span>
          </button>
        </div>

        <div className="sidebar-footer">
          <div className="usage-meter">
            <div className="flex justify-between text-[10px] mb-1">
              <span>Token Usage</span>
              <span>85%</span>
            </div>
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 w-[85%]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ai-main-workspace">
        <header className="workspace-header">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Projects</span>
            <ChevronRight size={14} />
            <span className="font-medium text-gray-900">AI Workspace</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="header-icon-btn"><History size={18} /></button>
            <button className="header-icon-btn"><Settings size={18} /></button>
            <div className="h-6 w-px bg-gray-200 mx-1"></div>
            <button className="btn-secondary"><Share2 size={16} /> Share</button>
            <button className="btn-primary"><Save size={16} /> Export</button>
          </div>
        </header>

        <div className="workspace-canvas">
          <div className="empty-state">
            <div className="empty-icon">
              <Sparkles size={48} className="text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mt-6">Design your vision with AI</h2>
            <p className="text-gray-500 mt-2 max-w-md mx-auto">
              Describe the UI component or marketing asset you want to create, and our AI will generate a functional prototype for you.
            </p>
          </div>
        </div>

        {/* Floating Input Bar */}
        <div className="ai-input-wrapper">
          <div className="ai-input-container">
            <Sparkles className="text-purple-500" size={20} />
            <input 
              type="text" 
              placeholder="Describe what you want to build (e.g., 'A modern login page for a SaaS app')" 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <button 
              className={`generate-btn ${isGenerating ? 'loading' : ''}`}
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <div className="spinner"></div>
              ) : (
                <>
                  <span>Generate</span>
                  <Play size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BarChart2 = ({ size, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const Users = ({ size, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export default AIEditorWorkspace;
