import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { request } from "../../api/client";
import { 
  User, 
  Mail, 
  MapPin, 
  Link as LinkIcon, 
  Calendar,
  Edit2,
  Github,
  Twitter,
  Linkedin,
  Loader2
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import "./UserProfilePage.css";

const UserProfilePage = () => {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, activityRes] = await Promise.all([
          request('/auth/profile'),
          request('/activity/user') // Assumes an endpoint to get user's activity
        ]);
        setProfile(profileRes);
        setActivity(activityRes);
      } catch (err) {
        console.error("Failed to load profile data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }
  
  if (!profile) {
    return <div className="p-8 text-center">Could not load user profile.</div>
  }

  const joinedDate = profile.createdAt ? format(new Date(profile.createdAt), "MMMM yyyy") : "N/A";
  const handle = profile.username || profile.name?.toLowerCase().replace(/\s+/g, '') || "username";

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="cover-photo"></div>
        <div className="profile-info-bar">
          <div className="profile-avatar-wrapper">
             <img src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.name}&size=150`} alt={profile.name} className="profile-avatar" />
             <button className="edit-avatar-btn"><Edit2 size={16} /></button>
          </div>
          <div className="profile-meta">
            <h1 className="profile-name">{profile.name}</h1>
            <p className="profile-handle">@{handle}</p>
          </div>
          <button className="edit-profile-btn">Edit Profile</button>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-left">
          <div className="card profile-about">
            <h3 className="card-title">About</h3>
            <p className="about-text">
              {profile.bio || "No bio provided."}
            </p>
            <div className="info-list">
              <div className="info-item">
                <Mail size={16} />
                <span>{profile.email}</span>
              </div>
              {profile.location && (
                <div className="info-item">
                  <MapPin size={16} />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.website && (
                <div className="info-item">
                  <LinkIcon size={16} />
                  <a href={profile.website} target="_blank" rel="noopener noreferrer">{profile.website.replace(/https?:\/\//, '')}</a>
                </div>
              )}
              <div className="info-item">
                <Calendar size={16} />
                <span>Joined {joinedDate}</span>
              </div>
            </div>
          </div>

          <div className="card profile-social">
            <h3 className="card-title">Social</h3>
            <div className="social-links">
               {profile.social?.github && <a href={`https://github.com/${profile.social.github}`} className="social-link"><Github size={20} /></a>}
               {profile.social?.twitter && <a href={`https://twitter.com/${profile.social.twitter}`} className="social-link"><Twitter size={20} /></a>}
               {profile.social?.linkedin && <a href={`https://linkedin.com/in/${profile.social.linkedin}`} className="social-link"><Linkedin size={20} /></a>}
               {!profile.social?.github && !profile.social?.twitter && !profile.social?.linkedin && (
                 <p className="text-xs text-gray-400">No social links provided.</p>
               )}
            </div>
          </div>
        </div>

        <div className="profile-right">
          <div className="profile-tabs">
            <button className="tab active">Activity</button>
            <button className="tab">Projects</button>
            <button className="tab">Settings</button>
          </div>

          <div className="activity-feed">
             {activity.length > 0 ? activity.map(item => (
               <div key={item._id} className="activity-card">
                  <div className="activity-icon bg-blue-100 text-blue-600"><Edit2 size={16} /></div>
                  <div className="activity-info">
                    <p><strong>You</strong> {item.action.replace("_", " ")} the {item.entityType} <strong>"{item.meta?.title}"</strong></p>
                    <span className="activity-time">{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
                  </div>
               </div>
             )) : (
               <div className="text-center py-10 text-gray-500">
                 <p>No recent activity.</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
