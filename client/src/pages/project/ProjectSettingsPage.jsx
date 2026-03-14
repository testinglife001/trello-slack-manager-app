import React, { useState, useEffect } from "react";
import { useProject } from "../../context/ProjectContext";
import { request } from "../../api/client";
import { 
  Settings, 
  Users, 
  Shield, 
  Bell, 
  Globe, 
  Trash2,
  Save,
  Check,
  Loader2
} from "lucide-react";
import "./ProjectSettingsPage.css";

const ProjectSettingsPage = () => {
  const { project, setProject } = useProject();
  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState({ name: '', description: '', visibility: 'private' });
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        visibility: project.visibility || 'private'
      });
    }
  }, [project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setSaved(false);
    try {
      const updatedProject = await request(`/projects/${project._id}`, {
        method: 'PUT',
        data: formData
      });
      setProject(updatedProject); // Update context
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save project settings:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  return (
    <div className="settings-container">
      <div className="settings-sidebar">
        <h2 className="settings-title">Project Settings</h2>
        <nav className="settings-nav">
          <button 
            className={`nav-item ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <Settings size={18} />
            <span>General</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'members' ? 'active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            <Users size={18} />
            <span>Members</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'permissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('permissions')}
          >
            <Shield size={18} />
            <span>Permissions</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={18} />
            <span>Notifications</span>
          </button>
        </nav>
      </div>

      <div className="settings-content">
        <div className="content-header">
           <h3 className="text-xl font-bold text-gray-900 capitalize">{activeTab} Settings</h3>
           <button className="save-btn" onClick={handleSave} disabled={isSaving}>
             {isSaving ? <Loader2 size={16} className="animate-spin" /> : (saved ? <Check size={16} /> : <Save size={16} />)}
             <span>{isSaving ? 'Saving...' : (saved ? 'Saved!' : 'Save Changes')}</span>
           </button>
        </div>

        <div className="content-body">
          {activeTab === 'general' && (
            <div className="settings-form">
              <div className="form-group">
                <label>Project Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Project Description</label>
                <textarea 
                  rows="4" 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>
              <div className="form-group">
                <label>Visibility</label>
                <div className="radio-group">
                  <label className="radio-item">
                    <input 
                      type="radio" 
                      name="visibility" 
                      value="private"
                      checked={formData.visibility === 'private'}
                      onChange={handleChange}
                    />
                    <div>
                      <span className="font-bold block">Private</span>
                      <span className="text-xs text-gray-500">Only members can see this project</span>
                    </div>
                  </label>
                  <label className="radio-item">
                    <input 
                      type="radio" 
                      name="visibility" 
                      value="public"
                      checked={formData.visibility === 'public'}
                      onChange={handleChange}
                    />
                    <div>
                      <span className="font-bold block">Public</span>
                      <span className="text-xs text-gray-500">Anyone in the workspace can view</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="danger-zone">
                <h4 className="text-red-600 font-bold mb-2">Danger Zone</h4>
                <div className="danger-card">
                  <div>
                    <p className="font-bold">Delete this project</p>
                    <p className="text-xs text-gray-500">Once you delete a project, there is no going back. Please be certain.</p>
                  </div>
                  <button className="delete-btn"><Trash2 size={16} /> Delete Project</button>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'general' && (
            <div className="placeholder-content">
               <Globe size={48} className="text-gray-200 mb-4" />
               <p className="text-gray-500">This settings module is coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectSettingsPage;
