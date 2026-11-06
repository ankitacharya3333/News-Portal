import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { User, Bookmark, Clock, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatNewsTime } from '../utils/dateUtils';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.getCurrentUser()
      .then(res => setProfileData(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="py-12 text-center text-xs text-[#64748B]">Loading profile archives...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      {/* Profile Header */}
      <div className="bg-white p-6 border border-[#E2E8F0] rounded-xs shadow-xs flex flex-col sm:flex-row items-center gap-6">
        <img
          src={profileData?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
          alt={profileData?.name}
          className="w-20 h-20 rounded-full object-cover border-2 border-[#0B1B3D]"
        />
        <div className="text-center sm:text-left space-y-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h1 className="font-editorial text-2xl font-bold text-[#0B1B3D]">{profileData?.name}</h1>
            <span className="bg-[#0B1B3D] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
              {profileData?.role}
            </span>
          </div>
          <p className="text-xs text-[#64748B]">{profileData?.email}</p>
          <p className="text-xs text-[#475569]">{profileData?.jobTitle || 'Verified Digital Reader'}</p>
        </div>
      </div>

      {/* Bookmarks & Reading List */}
      <div className="space-y-4">
        <div className="border-b-2 border-[#0B1B3D] pb-2 flex items-center justify-between">
          <h2 className="font-editorial text-xl font-bold text-[#0B1B3D] flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-[#B83232]" />
            Saved Reading List & Bookmarks
          </h2>
          <span className="text-xs text-[#64748B]">{profileData?.bookmarks?.length || 0} Saved</span>
        </div>

        {(!profileData?.bookmarks || profileData.bookmarks.length === 0) ? (
          <div className="p-8 text-center bg-white border border-[#E2E8F0] rounded-xs text-xs text-[#64748B]">
            You have not bookmarked any investigative articles yet. Browse today's front page to save stories for offline reading.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profileData.bookmarks.map(b => (
              <Link key={b.id} to={`/news/${b.article.slug}`} className="bg-white p-4 border border-[#E2E8F0] rounded hover:border-[#0B1B3D] block">
                <img src={b.article.featuredImage} alt={b.article.title} className="w-full h-32 object-cover rounded mb-2" />
                <h4 className="font-editorial text-sm font-bold text-[#0B1B3D] line-clamp-2">{b.article.title}</h4>
                <span className="text-[10px] text-[#94A3B8] block mt-1">{formatNewsTime(b.article.publishedAt)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

