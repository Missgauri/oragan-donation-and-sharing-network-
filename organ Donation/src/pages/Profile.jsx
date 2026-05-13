import React, { useState } from 'react';
import {
  User, Mail, Shield, LogOut, Edit2, Save, X,
  Heart, MapPin, Phone, Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes/routeConfig';
import { updateUserProfile } from '../services/profileService';
import { formatDate } from '../utils/formatDate';

const ROLE_CONFIG = {
  donor:    { label: 'Donor',    bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200'    },
  receiver: { label: 'Receiver', bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200'  },
  hospital: { label: 'Hospital', bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200'    },
  admin:    { label: 'Admin',    bg: 'bg-slate-100',  text: 'text-slate-700',   border: 'border-slate-200'   },
};

const Profile = () => {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  const [loggingOut, setLoggingOut] = useState(false);
  const [editing,    setEditing]    = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [saveError,  setSaveError]  = useState(null);

  // Editable fields from user_metadata
  const meta = user?.user_metadata || {};
  const [form, setForm] = useState({
    full_name: meta.full_name || '',
    phone:     meta.phone     || '',
    location:  meta.location  || '',
  });

  const handleSignOut = async () => {
    setLoggingOut(true);
    await signOut();
    navigate(ROUTES.HOME);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await updateUserProfile(form);
      setEditing(false);
    } catch (err) {
      setSaveError(err.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      full_name: meta.full_name || '',
      phone:     meta.phone     || '',
      location:  meta.location  || '',
    });
    setEditing(false);
    setSaveError(null);
  };

  const roleConfig = ROLE_CONFIG[role] || ROLE_CONFIG.donor;
  const initial    = (meta.full_name || user?.email || '?')[0].toUpperCase();

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shrink-0">
              {initial}
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-slate-800 truncate">
                {meta.full_name || user?.email?.split('@')[0] || 'My Profile'}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${roleConfig.bg} ${roleConfig.text} ${roleConfig.border}`}>
                  {roleConfig.label}
                </span>
                <span className="text-xs text-slate-400">
                  Joined {formatDate(user?.created_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Edit toggle */}
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="self-start flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl transition-colors shrink-0"
            >
              <Edit2 size={13} /> Edit
            </button>
          ) : (
            <div className="flex gap-2 self-start shrink-0">
              <button onClick={handleCancel}
                className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                <X size={13} /> Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-1 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 px-3 py-2 rounded-xl transition-colors disabled:opacity-60">
                <Save size={13} /> {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          )}
        </div>

        {/* Save error */}
        {saveError && (
          <div className="mb-4 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
            {saveError}
          </div>
        )}

        {/* Profile fields */}
        <div className="space-y-3">
          {/* Email — read only */}
          <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
            <Mail size={16} className="text-slate-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Email</p>
              <p className="text-sm font-medium text-slate-700 truncate">{user?.email}</p>
            </div>
            <span className="text-[10px] text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">Read only</span>
          </div>

          {/* Full name */}
          <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
            <User size={16} className="text-slate-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Full Name</p>
              {editing ? (
                <input
                  type="text"
                  value={form.full_name}
                  onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                  placeholder="Enter your full name"
                  className="w-full text-sm bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-sm font-medium text-slate-700">{meta.full_name || '—'}</p>
              )}
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
            <Phone size={16} className="text-slate-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Phone</p>
              {editing ? (
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="Enter your phone number"
                  className="w-full text-sm bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-sm font-medium text-slate-700">{meta.phone || '—'}</p>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
            <MapPin size={16} className="text-slate-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Location</p>
              {editing ? (
                <input
                  type="text"
                  value={form.location}
                  onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                  placeholder="City, State"
                  className="w-full text-sm bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-sm font-medium text-slate-700">{meta.location || '—'}</p>
              )}
            </div>
          </div>

          {/* Role — read only */}
          <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
            <Shield size={16} className="text-slate-400 shrink-0" />
            <div className="flex-1">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Role</p>
              <p className="text-sm font-medium text-slate-700 capitalize">{role || 'Not assigned'}</p>
            </div>
          </div>

          {/* Account created */}
          <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
            <Calendar size={16} className="text-slate-400 shrink-0" />
            <div className="flex-1">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Member Since</p>
              <p className="text-sm font-medium text-slate-700">{formatDate(user?.created_at)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sign out */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Account</h2>
        <button
          onClick={handleSignOut}
          disabled={loggingOut}
          className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-60"
        >
          <LogOut size={16} />
          {loggingOut ? 'Signing out…' : 'Sign Out'}
        </button>
      </div>
    </div>
  );
};

export default Profile;
