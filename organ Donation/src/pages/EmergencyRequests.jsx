import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle, Phone, MapPin, Clock, RefreshCw,
  Droplet, Hospital, Plus, X, CheckCircle, Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchEmergencyRequests } from '../services/adminService';
import { createRecipientRequest } from '../services/profileService';
import ErrorBanner from '../components/common/ErrorBanner';
import { formatDate } from '../utils/formatDate';

// ── Constants ─────────────────────────────────────────────────────────────────

const EMERGENCY_CONTACTS = [
  { region: 'Delhi NCR',  phone: '011-2345-6789', available: true  },
  { region: 'Mumbai',     phone: '022-9876-5432', available: true  },
  { region: 'Bangalore',  phone: '080-1122-3344', available: false },
  { region: 'Chennai',    phone: '044-5566-7788', available: true  },
];

const URGENCY_CONFIG = {
  Critical:  { banner: 'bg-red-600',    badge: 'bg-red-100 text-red-700',      pulse: true  },
  Emergency: { banner: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700',pulse: true  },
  High:      { banner: null,            badge: 'bg-red-50 text-red-600',        pulse: false },
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  if (mins  < 1)  return 'just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

// ── New Request Form ──────────────────────────────────────────────────────────

const ORGAN_OPTIONS = ['Kidney', 'Liver', 'Heart', 'Lungs', 'Bone Marrow', 'Cornea', 'Pancreas'];
const BLOOD_OPTIONS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const NewRequestForm = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    organ_needed:  'Kidney',
    blood_type:    'O+',
    urgency:       'Emergency',
    hospital_name: '',
    notes:         '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(false);
  const [error,      setError]      = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { setError('You must be logged in to submit a request.'); return; }
    setSubmitting(true);
    setError(null);
    try {
      await createRecipientRequest(user.id, form);
      setDone(true);
      setTimeout(() => { onSuccess?.(); onClose(); }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to submit request.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose} role="dialog" aria-modal="true" aria-label="New emergency request">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        {done ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <CheckCircle size={48} className="text-emerald-500" />
            <p className="text-base font-semibold text-slate-700">Request Submitted!</p>
            <p className="text-sm text-slate-400 text-center">Your emergency request has been sent to regional coordinators.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-500" /> New Emergency Request
              </h3>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X size={16} /></button>
            </div>

            {error && (
              <div className="mb-4 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Organ Needed</label>
                  <select value={form.organ_needed} onChange={e => setForm(p => ({ ...p, organ_needed: e.target.value }))}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50">
                    {ORGAN_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Blood Type</label>
                  <select value={form.blood_type} onChange={e => setForm(p => ({ ...p, blood_type: e.target.value }))}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50">
                    {BLOOD_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Urgency Level</label>
                <div className="flex gap-2">
                  {['Emergency', 'Critical', 'High'].map(u => (
                    <button key={u} type="button"
                      onClick={() => setForm(p => ({ ...p, urgency: u }))}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        form.urgency === u
                          ? u === 'Emergency' ? 'bg-orange-500 border-orange-500 text-white'
                          : u === 'Critical'  ? 'bg-red-600 border-red-600 text-white'
                          : 'bg-red-50 border-red-200 text-red-600'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}>
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Hospital Name</label>
                <input type="text" value={form.hospital_name}
                  onChange={e => setForm(p => ({ ...p, hospital_name: e.target.value }))}
                  placeholder="e.g. AIIMS Delhi"
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Additional Notes</label>
                <textarea value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Patient condition, special requirements…"
                  rows={3}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2">
                  {submitting ? <><Loader2 size={14} className="animate-spin" /> Submitting…</> : 'Submit Request'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────

const EmergencyRequests = () => {
  const { user } = useAuth();
  const [requests,  setRequests]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [showForm,  setShowForm]  = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEmergencyRequests(20);
      setRequests(data);
    } catch (err) {
      setError(err.message || 'Failed to load emergency requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center">
            <AlertTriangle size={24} className="text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-red-700">Emergency Organ Requests</h1>
            <p className="text-sm text-slate-500 mt-0.5">Critical cases requiring immediate attention.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} disabled={loading}
            className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors" aria-label="Refresh">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          {user && (
            <button onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm">
              <Plus size={15} /> New Request
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && <ErrorBanner message={error} onRetry={load} />}

      {/* National helpline */}
      <div className="bg-red-600 text-white rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Phone size={24} className="shrink-0" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide opacity-80">National Emergency Helpline</p>
            <p className="text-2xl font-bold">1800-11-4770</p>
          </div>
        </div>
        <p className="text-sm opacity-80 sm:ml-auto">Available 24/7 — Free of charge</p>
      </div>

      {/* Live emergency requests */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
          </span>
          <h2 className="text-sm font-bold text-red-600 uppercase tracking-wide">
            Active Emergency Requests {requests.length > 0 && `(${requests.length})`}
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-3" />
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-slate-100 rounded w-2/3" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
                <div className="h-9 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-400">
            <CheckCircle size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No active emergency requests</p>
            <p className="text-xs mt-1">All critical cases have been addressed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {requests.map(req => {
              const config = URGENCY_CONFIG[req.urgency] || URGENCY_CONFIG.High;
              return (
                <article key={req.id}
                  className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                    config.pulse ? 'border-red-200 ring-1 ring-red-100' : 'border-slate-100'
                  }`}>
                  {config.banner && (
                    <div className={`${config.banner} text-white px-4 py-1.5 text-xs font-bold flex items-center gap-2`}>
                      <span className="relative flex h-2 w-2 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                      </span>
                      {req.urgency} — Immediate Response Required
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">{req.organ_needed} Needed</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Patient: <span className="font-semibold text-slate-600">{req.patient_name}</span></p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${config.badge}`}>{req.urgency}</span>
                    </div>
                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Droplet size={11} className="text-red-400" />
                        Blood Type: <span className="font-semibold text-slate-700 ml-0.5">{req.blood_type}</span>
                      </div>
                      {req.hospital_name && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Hospital size={11} className="text-blue-400" />{req.hospital_name}
                        </div>
                      )}
                      {req.created_at && (
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Clock size={11} />Posted {timeAgo(req.created_at)}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => alert(`Connecting to coordinator for ${req.patient_name}…`)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors">
                      <Phone size={13} /> Respond Now
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Regional coordinators */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Regional Coordinators</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {EMERGENCY_CONTACTS.map(contact => (
            <div key={contact.region} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <MapPin size={14} className="text-blue-400" />{contact.region}
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  contact.available ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'
                }`}>
                  {contact.available ? '● Online' : '○ Offline'}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-4">
                <Phone size={11} />{contact.phone}
              </p>
              <button
                disabled={!contact.available}
                onClick={() => alert(`Connecting to ${contact.region} coordinator…`)}
                className={`w-full py-2 rounded-xl text-xs font-semibold transition-colors ${
                  contact.available
                    ? 'bg-blue-700 hover:bg-blue-800 text-white'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}>
                {contact.available ? 'Contact Now' : 'Offline'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* New request form modal */}
      {showForm && (
        <NewRequestForm
          onClose={() => setShowForm(false)}
          onSuccess={load}
        />
      )}
    </div>
  );
};

export default EmergencyRequests;
