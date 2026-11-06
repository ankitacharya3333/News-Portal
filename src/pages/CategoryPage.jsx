import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';
import { newsService } from '../services/api';
import { formatNewsTime } from '../utils/dateUtils';

export default function CategoryPage() {
  const { slug } = useParams();
  const [articles, setArticles] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    loadCategoryData(1);
  }, [slug]);

  const loadCategoryData = (pageNum = 1) => {
    // 1. Fetch articles by category slug with actual database records
    newsService.getArticles({ category: slug, page: pageNum, limit: 12 })
      .then(res => {
        setArticles(res.data?.data || []);
        setPagination(res.data?.pagination || null);
      })
      .catch(err => {
        console.error('Category articles fetch error:', err);
      })
      .finally(() => setLoading(false));

    // 2. Fetch category metadata
    newsService.getCategories()
      .then(res => {
        const found = (res.data?.data || []).find(c => c.slug === slug);
        if (found) {
          setCategory(found);
        } else {
          setCategory({
            name: slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'News Section',
            description: `Authoritative reporting, investigations, and continuous updates in ${slug}.`
          });
        }
      })
      .catch(() => {
        setCategory({
          name: slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'News Section',
          description: `Authoritative reporting, investigations, and continuous updates in ${slug}.`
        });
      });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    loadCategoryData(newPage);
  };

  if (loading) {
    return (
      <div className="py-12 space-y-6 animate-pulse">
        <div className="h-24 bg-neutral-200 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-neutral-200 rounded"></div>
          <div className="h-64 bg-neutral-200 rounded"></div>
          <div className="h-64 bg-neutral-200 rounded"></div>
        </div>
      </div>
    );
  }

  const featured = articles[0];
  const secondaryArticles = articles.slice(1);

  return (
    <div className="space-y-8 py-2">
      {/* Category Header Banner */}
      <div className="border-b-2 border-[#0B1B3D] pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#B83232] mb-1">
              <span>Editorial Desk</span>
              {category?.nepaliName && (
                <>
                  <span>•</span>
                  <span className="font-nepali text-sm font-semibold">{category.nepaliName}</span>
                </>
              )}
            </div>
            <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-[#0B1B3D]">
              {category?.name || slug}
            </h1>
            <p className="text-sm text-[#475569] mt-2 max-w-2xl leading-relaxed">
              {category?.description || `Authoritative reporting and dispatches in ${slug}.`}
            </p>
          </div>
          <div className="text-xs text-[#64748B] flex items-center gap-2">
            <span><strong>{pagination?.totalCount || articles.length}</strong> Published Dispatches</span>
          </div>
        </div>
      </div>

      {articles.length === 0 ? (
        <div className="py-16 text-center bg-white border border-[#E2E8F0] rounded-xs p-8 shadow-xs">
          <BookOpen className="w-10 h-10 text-[#64748B] mx-auto mb-3" />
          <h3 className="font-editorial text-xl font-bold text-[#0B1B3D]">No dispatches found in this section</h3>
          <p className="text-xs text-[#64748B] mt-2">New investigations for this desk are currently in development.</p>
          <Link to="/" className="inline-block mt-4 text-xs font-semibold text-[#B83232] hover:underline">
            Return to Front Page
          </Link>
        </div>
      ) : (
        <>
          {/* Featured Lead Story in Category */}
          {featured && (
            <div className="bg-white border border-[#E2E8F0] p-6 rounded-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-xs">
              <div className="lg:col-span-7 overflow-hidden rounded-xs">
                <img
                  src={featured.featuredImage}
                  alt={featured.title}
                  loading="lazy"
                  className="w-full h-72 sm:h-96 object-cover hover:scale-102 transition-transform duration-500"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80';
                  }}
                />
              </div>
              <div className="lg:col-span-5 space-y-4">
                <span className="text-[10px] font-bold text-[#B83232] uppercase tracking-wider block">
                  Featured Report
                </span>
                <Link to={`/news/${featured.slug}`} className="group block">
                  <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#0B1B3D] group-hover:text-[#9E2A2B] leading-tight">
                    {featured.title}
                  </h2>
                </Link>
                <p className="text-sm text-[#475569] leading-relaxed">
                  {featured.summary}
                </p>
                <div className="pt-2 text-xs text-[#64748B] flex items-center justify-between border-t border-[#F1F5F9]">
                  <span className="font-semibold text-[#0B1B3D]">{featured.author?.name || 'Newsroom Bureau'}</span>
                  <span>{formatNewsTime(featured.publishedAt)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Grid of Other Category Articles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {secondaryArticles.map((art) => (
              <article key={art.id} className="bg-white border border-[#E2E8F0] p-4 rounded-xs hover:border-[#0B1B3D] transition-colors flex flex-col justify-between shadow-xs">
                <div>
                  <div className="overflow-hidden rounded-xs mb-3">
                    <img
                      src={art.featuredImage}
                      alt={art.title}
                      loading="lazy"
                      className="w-full h-44 object-cover hover:scale-103 transition-transform duration-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                  </div>
                  <Link to={`/news/${art.slug}`} className="group block">
                    <h3 className="font-editorial text-lg font-bold text-[#0B1B3D] group-hover:text-[#9E2A2B] leading-snug">
                      {art.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-[#64748B] line-clamp-3 mt-2 leading-relaxed">
                    {art.summary}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-[11px] text-[#94A3B8]">
                  <span>{formatNewsTime(art.publishedAt)}</span>
                  <span>{art.author?.name || 'Staff Reporter'}</span>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="pt-8 border-t border-[#E2E8F0] flex justify-center items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
                className="px-4 py-2 border border-[#CBD5E1] rounded text-xs font-semibold text-[#0B1B3D] disabled:opacity-50 hover:bg-neutral-50"
              >
                Previous
              </button>
              <span className="text-xs text-[#64748B] px-3">
                Page {page} of {pagination.totalPages}
              </span>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => handlePageChange(page + 1)}
                className="px-4 py-2 border border-[#CBD5E1] rounded text-xs font-semibold text-[#0B1B3D] disabled:opacity-50 hover:bg-neutral-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
