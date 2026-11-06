import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/api';
import {
  FileText,
  Calendar,
  Mail,
  RefreshCw,
  Eye,
  Users,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { formatNewsTime } from '../../utils/dateUtils';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [overview, setOverview] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncingNews, setSyncingNews] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

  // New Article Form state
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [newArticle, setNewArticle] = useState({
    title: '',
    summary: '',
    content: '',
    categoryId: '',
    featuredImage: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
    isBreaking: false,
    isFeatured: false,
    status: 'PUBLISHED'
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [overRes, apptRes, inqRes] = await Promise.all([
        adminService.getOverview(),
        adminService.getAppointments(),
        adminService.getInquiries()
      ]);
      setOverview(overRes.data.data);
      setAppointments(apptRes.data.data || []);
      setInquiries(inqRes.data.data || []);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncNews = async () => {
    try {
      setSyncingNews(true);
      setSyncStatus(null);
      const res = await adminService.triggerNewsSync();
      setSyncStatus({ success: true, message: res.data.message });
      loadDashboardData();
    } catch (err) {
      setSyncStatus({ success: false, message: err.message || 'News synchronization failed' });
    } finally {
      setSyncingNews(false);
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await adminService.updateAppointment(appointmentId, { status: newStatus });
      setAppointments(prev =>
        prev.map(a => a.id === appointmentId ? { ...a, status: newStatus } : a)
      );
    } catch (err) {
      alert('Failed to update booking status');
    }
  };

  const handleInquiryStatus = async (inquiryId, newStatus) => {
    try {
      await adminService.updateInquiry(inquiryId, { status: newStatus });
      setInquiries(prev =>
        prev.map(i => i.id === inquiryId ? { ...i, status: newStatus } : i)
      );
    } catch (err) {
      alert('Failed to update inquiry status');
    }
  };

  const handleDeleteArticle = async (id) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      await adminService.deleteArticle(id);
      loadDashboardData();
    } catch (err) {
      alert('Failed to delete article');
    }
  };

  return (
    <div className="py-4 space-y-8">
      {/* Top Admin Header */}
      <div className="bg-[#0B1B3D] text-white p-6 rounded-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#B83232] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
              Admin Portal
            </span>
            <span className="text-xs text-neutral-300">Singha Durbar Editorial Enclave</span>
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold mt-1">
            Publication Management & News Desk
          </h1>
          <p className="text-xs text-neutral-300">
            Welcome back, {user?.name} ({user?.email}) • Central Dispatch Control
          </p>
        </div>

        {/* Live News API & Feed Trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncNews}
            disabled={syncingNews}
            className="px-4 py-2.5 bg-[#C59B27] hover:bg-[#B38A20] text-[#0B1B3D] text-xs font-bold uppercase tracking-wider rounded flex items-center gap-2 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingNews ? 'animate-spin' : ''}`} />
            <span>{syncingNews ? 'Ingesting RSS...' : 'Sync Live Feeds'}</span>
          </button>
        </div>
      </div>

      {syncStatus && (
        <div className={`p-4 rounded text-xs flex items-center gap-2 ${syncStatus.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-rose-50 text-rose-800 border border-rose-300'}`}>
          {syncStatus.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          <span>{syncStatus.message}</span>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex border-b border-[#CBD5E1] space-x-2 text-xs font-bold uppercase tracking-wider overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-4 border-b-2 transition-colors ${activeTab === 'overview' ? 'border-[#0B1B3D] text-[#0B1B3D]' : 'border-transparent text-[#64748B] hover:text-[#0B1B3D]'}`}
        >
          Overview & Metrics
        </button>
        <button
          onClick={() => setActiveTab('articles')}
          className={`py-3 px-4 border-b-2 transition-colors ${activeTab === 'articles' ? 'border-[#0B1B3D] text-[#0B1B3D]' : 'border-transparent text-[#64748B] hover:text-[#0B1B3D]'}`}
        >
          Articles Management
        </button>
        <button
          onClick={() => setActiveTab('appointments')}
          className={`py-3 px-4 border-b-2 transition-colors ${activeTab === 'appointments' ? 'border-[#0B1B3D] text-[#0B1B3D]' : 'border-transparent text-[#64748B] hover:text-[#0B1B3D]'}`}
        >
          Consultations & Bookings ({appointments.filter(a => a.status === 'PENDING').length})
        </button>
        <button
          onClick={() => setActiveTab('inquiries')}
          className={`py-3 px-4 border-b-2 transition-colors ${activeTab === 'inquiries' ? 'border-[#0B1B3D] text-[#0B1B3D]' : 'border-transparent text-[#64748B] hover:text-[#0B1B3D]'}`}
        >
          Customer Inquiries ({inquiries.filter(i => i.status === 'UNREAD').length})
        </button>
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Real Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 border border-[#E2E8F0] rounded-xs shadow-xs">
              <span className="text-[11px] font-bold text-[#64748B] uppercase block">Total Articles</span>
              <span className="font-editorial text-3xl font-bold text-[#0B1B3D] mt-1 block">
                {overview?.stats?.totalPublished || 0}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">{overview?.stats?.totalDrafts || 0} In Draft</span>
            </div>

            <div className="bg-white p-5 border border-[#E2E8F0] rounded-xs shadow-xs">
              <span className="text-[11px] font-bold text-[#64748B] uppercase block">Total Article Reads</span>
              <span className="font-editorial text-3xl font-bold text-[#0B1B3D] mt-1 block">
                {(overview?.stats?.totalViews || 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-[#64748B]">Audited Views</span>
            </div>

            <div className="bg-white p-5 border border-[#E2E8F0] rounded-xs shadow-xs">
              <span className="text-[11px] font-bold text-[#64748B] uppercase block">Subscribers</span>
              <span className="font-editorial text-3xl font-bold text-[#0B1B3D] mt-1 block">
                {overview?.stats?.totalSubscribers || 0}
              </span>
              <span className="text-[10px] text-[#64748B]">Active Email Dispatches</span>
            </div>

            <div className="bg-white p-5 border border-[#E2E8F0] rounded-xs shadow-xs">
              <span className="text-[11px] font-bold text-[#64748B] uppercase block">Pending Bookings</span>
              <span className="font-editorial text-3xl font-bold text-[#B83232] mt-1 block">
                {overview?.stats?.pendingAppointments || 0}
              </span>
              <span className="text-[10px] text-amber-700 font-semibold">Requires Coordinator Action</span>
            </div>
          </div>

          {/* Recent Articles Table */}
          <div className="bg-white border border-[#E2E8F0] rounded-xs p-6 shadow-xs">
            <h3 className="font-editorial text-xl font-bold text-[#0B1B3D] mb-4">
              Recently Dispatched Publications
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase text-[10px] tracking-wider">
                    <th className="pb-3">Title</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Author</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Views</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {(overview?.recentArticles || []).map(art => (
                    <tr key={art.id} className="hover:bg-[#F8FAFC]">
                      <td className="py-3 font-semibold text-[#0B1B3D] max-w-xs truncate pr-4">
                        {art.title}
                      </td>
                      <td className="py-3 text-[#475569]">{art.category?.name}</td>
                      <td className="py-3 text-[#64748B]">{art.author?.name || 'Newsroom'}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${art.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {art.status}
                        </span>
                      </td>
                      <td className="py-3 text-[#64748B]">{art.views}</td>
                      <td className="py-3">
                        <button
                          onClick={() => handleDeleteArticle(art.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. ARTICLES TAB */}
      {activeTab === 'articles' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-editorial text-2xl font-bold text-[#0B1B3D]">All Newsroom Articles</h3>
            <span className="text-xs text-[#64748B]">Showing verified articles & syndicated wires</span>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-xs p-6 shadow-xs space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase text-[10px]">
                    <th className="pb-3">Article Title</th>
                    <th className="pb-3">Desk</th>
                    <th className="pb-3">Published At</th>
                    <th className="pb-3">Views</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {(overview?.recentArticles || []).map(art => (
                    <tr key={art.id} className="hover:bg-[#F8FAFC]">
                      <td className="py-3 font-semibold text-[#0B1B3D] max-w-sm truncate pr-4">
                        {art.title}
                      </td>
                      <td className="py-3 text-[#475569]">{art.category?.name}</td>
                      <td className="py-3 text-[#64748B]">{formatNewsTime(art.publishedAt)}</td>
                      <td className="py-3 text-[#64748B]">{art.views}</td>
                      <td className="py-3">
                        {art.isExternal ? (
                          <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">Wire</span>
                        ) : (
                          <span className="bg-purple-100 text-purple-800 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">Original</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleDeleteArticle(art.id)}
                          className="text-red-600 hover:text-red-800 text-xs font-semibold"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. APPOINTMENTS TAB */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-editorial text-2xl font-bold text-[#0B1B3D]">
              Consultation & Coverage Bookings
            </h3>
            <span className="text-xs text-[#64748B]">{appointments.length} Reservations Logged</span>
          </div>

          <div className="space-y-4">
            {appointments.length === 0 ? (
              <div className="bg-white p-8 text-center text-xs text-[#64748B] border border-[#E2E8F0] rounded">
                No appointment bookings recorded in the system.
              </div>
            ) : (
              appointments.map(appt => (
                <div key={appt.id} className="bg-white p-6 border border-[#E2E8F0] rounded-xs shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#F1F5F9] pb-3">
                    <div>
                      <span className="text-xs font-mono font-bold text-[#B83232] bg-[#FDF2F2] px-2 py-0.5 rounded">
                        {appt.bookingRef}
                      </span>
                      <h4 className="font-editorial text-lg font-bold text-[#0B1B3D] mt-1">
                        {appt.serviceType.replace(/_/g, ' ')}
                      </h4>
                      <p className="text-xs text-[#64748B]">Client: {appt.name} ({appt.email} • {appt.phone})</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded ${
                        appt.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                        appt.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {appt.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#475569] bg-[#F8FAFC] p-3 rounded">
                    <div>
                      <strong className="block text-[#0B1B3D]">Date:</strong>
                      {new Date(appt.preferredDate).toLocaleDateString()}
                    </div>
                    <div>
                      <strong className="block text-[#0B1B3D]">Slot:</strong>
                      {appt.preferredTimeSlot}
                    </div>
                    <div>
                      <strong className="block text-[#0B1B3D]">Organization:</strong>
                      {appt.organization || 'Individual'}
                    </div>
                  </div>

                  <p className="text-xs text-[#334155] leading-relaxed">
                    <strong>Agenda:</strong> {appt.details}
                  </p>

                  {/* Actions to update status */}
                  <div className="flex items-center gap-2 pt-2 border-t border-[#F1F5F9]">
                    <span className="text-xs font-bold text-[#0B1B3D] mr-2">Set Status:</span>
                    <button
                      onClick={() => handleStatusChange(appt.id, 'CONFIRMED')}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleStatusChange(appt.id, 'RESCHEDULED')}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded"
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => handleStatusChange(appt.id, 'CANCELLED')}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 4. INQUIRIES TAB */}
      {activeTab === 'inquiries' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-editorial text-2xl font-bold text-[#0B1B3D]">
              Customer & Editorial Inquiries
            </h3>
            <span className="text-xs text-[#64748B]">{inquiries.length} Inquiries Logged</span>
          </div>

          <div className="space-y-4">
            {inquiries.length === 0 ? (
              <div className="bg-white p-8 text-center text-xs text-[#64748B] border border-[#E2E8F0] rounded">
                No customer inquiries received yet.
              </div>
            ) : (
              inquiries.map(inq => (
                <div key={inq.id} className="bg-white p-6 border border-[#E2E8F0] rounded-xs shadow-xs space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#B83232]">
                        {inq.category}
                      </span>
                      <h4 className="font-editorial text-lg font-bold text-[#0B1B3D]">
                        {inq.subject}
                      </h4>
                      <p className="text-xs text-[#64748B]">From: {inq.name} ({inq.email})</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${inq.status === 'UNREAD' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {inq.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#334155] bg-[#F8FAFC] p-3 rounded leading-relaxed">
                    {inq.message}
                  </p>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-[#F1F5F9]">
                    <span className="text-[#94A3B8]">{formatNewsTime(inq.createdAt)}</span>
                    <div className="flex items-center gap-2">
                      <a
                        href={`mailto:${inq.email}?subject=Re: ${encodeURIComponent(inq.subject)}`}
                        className="px-3 py-1 bg-[#0B1B3D] text-white rounded font-semibold text-xs hover:bg-[#B83232]"
                      >
                        Reply via Email
                      </a>
                      {inq.status === 'UNREAD' && (
                        <button
                          onClick={() => handleInquiryStatus(inq.id, 'READ')}
                          className="px-3 py-1 border border-[#CBD5E1] text-[#475569] rounded hover:bg-neutral-50"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

