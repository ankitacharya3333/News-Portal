import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ChevronRight, ArrowUpRight, Flame, Globe, Cpu, Trophy, CloudRain, Landmark } from 'lucide-react';
import { newsService } from '../services/api';
import { formatNewsTime } from '../utils/dateUtils';

export default function HomePage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    newsService.getArticles({ limit: 40 })
      .then(res => {
        setArticles(res.data?.data || []);
      })
      .catch(err => {
        console.error('Error fetching homepage articles:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse py-6">
        <div className="h-96 bg-neutral-200 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-neutral-200 rounded"></div>
          <div className="h-64 bg-neutral-200 rounded"></div>
          <div className="h-64 bg-neutral-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Exact Section Segmentations based on database category slugs
  const leadStory = articles.find(a => a.isFeatured) || articles[0];
  const secondaryHeadlines = articles.filter(a => a.id !== leadStory?.id).slice(0, 3);
  
  const nationalArticles = articles.filter(a => a.category?.slug === 'national').slice(0, 4);
  const politicsArticles = articles.filter(a => a.category?.slug === 'politics').slice(0, 3);
  const economyArticles = articles.filter(a => a.category?.slug === 'business').slice(0, 4);
  const kathmanduArticles = articles.filter(a => a.category?.slug === 'kathmandu').slice(0, 3);
  const techArticles = articles.filter(a => a.category?.slug === 'technology').slice(0, 3);
  const internationalArticles = articles.filter(a => a.category?.slug === 'international').slice(0, 3);
  const climateArticles = articles.filter(a => a.category?.slug === 'climate' || a.category?.slug === 'science').slice(0, 3);
  const sportsArticles = articles.filter(a => a.category?.slug === 'sports').slice(0, 3);
  const opinionArticles = articles.filter(a => a.category?.slug === 'opinion').slice(0, 3);

  // Curated photo dispatch items
  const photoGallery = articles.filter(a => Boolean(a.featuredImage)).slice(4, 8);

  return (
    <div className="space-y-12 py-2">
      {/* 1. MAIN FEATURED BROADSHEET & SECONDARY HEADLINES */}
      <section className="border-b border-[#CBD5E1] pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Lead Feature (7 cols) */}
          {leadStory && (
            <div className="lg:col-span-7 news-border-r pr-0 lg:pr-8">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#B83232]">
                  {leadStory.category?.name || 'Top Story'}
                </span>
                <span className="text-neutral-300">•</span>
                <span className="text-xs text-[#64748B] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatNewsTime(leadStory.publishedAt)}
                </span>
                {leadStory.isBreaking && (
                  <span className="bg-[#B83232] text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase flex items-center gap-1">
                    <Flame className="w-3 h-3" /> Breaking
                  </span>
                )}
              </div>

              <Link to={`/news/${leadStory.slug}`} className="group block">
                <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0B1B3D] group-hover:text-[#9E2A2B] transition-colors leading-[1.12]">
                  {leadStory.title}
                </h1>
              </Link>

              <div className="mt-4 overflow-hidden rounded-xs relative">
                <img
                  src={leadStory.featuredImage}
                  alt={leadStory.title}
                  loading="eager"
                  className="w-full h-80 sm:h-96 object-cover hover:scale-102 transition-transform duration-500"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80';
                  }}
                />
                {leadStory.imageCaption && (
                  <p className="text-[11px] text-[#64748B] italic mt-1.5 border-l-2 border-[#CBD5E1] pl-2">
                    {leadStory.imageCaption}
                  </p>
                )}
              </div>

              <p className="mt-4 text-base text-[#334155] leading-relaxed font-normal">
                {leadStory.summary}
              </p>

              <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#0B1B3D]">By {leadStory.author?.name || 'Newsroom Bureau'}</span>
                  <span>•</span>
                  <span>{leadStory.readingTimeMin || 4} min read</span>
                </div>
                <Link
                  to={`/news/${leadStory.slug}`}
                  className="inline-flex items-center gap-1 font-semibold text-[#B83232] hover:text-[#9E2A2B]"
                >
                  Read Investigation <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* Secondary Headlines Column (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="border-b-2 border-[#0B1B3D] pb-1.5 mb-2 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#0B1B3D]">
                National Wire & Key Stories
              </h2>
              <span className="text-[11px] text-[#64748B]">Updated Today</span>
            </div>

            <div className="space-y-6 divide-y divide-[#E2E8F0]">
              {secondaryHeadlines.map((story) => (
                <article key={story.id} className="pt-4 first:pt-0">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#B83232] block mb-1">
                        {story.category?.name}
                      </span>
                      <Link to={`/news/${story.slug}`} className="group">
                        <h3 className="font-editorial text-lg sm:text-xl font-bold text-[#0B1B3D] group-hover:text-[#9E2A2B] leading-snug">
                          {story.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-[#64748B] line-clamp-2 mt-1.5 leading-relaxed">
                        {story.summary}
                      </p>
                      <span className="text-[11px] text-[#94A3B8] block mt-2">
                        {formatNewsTime(story.publishedAt)} • {story.author?.name || 'Staff Reporter'}
                      </span>
                    </div>

                    {story.featuredImage && (
                      <img
                        src={story.featuredImage}
                        alt={story.title}
                        loading="lazy"
                        className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xs flex-shrink-0"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                    )}
                  </div>
                </article>
              ))}
            </div>

            {/* Editorial Commitment Box */}
            <div className="p-4 bg-[#F4EFE6] border-l-4 border-[#C59B27] rounded-xs mt-4">
              <h4 className="font-editorial text-sm font-bold text-[#0B1B3D]">
                Independent Sourcing Commitment
              </h4>
              <p className="text-xs text-[#475569] mt-1 leading-relaxed">
                The Nepal Chronicle cross-verifies government gazette notices, parliamentary committee transcripts, and economic balances with primary sources before dissemination.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. POLITICS & NATIONAL DESK */}
      <section>
        <div className="border-b-2 border-[#0B1B3D] pb-2 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-[#B83232]" />
            <h2 className="font-editorial text-2xl font-bold text-[#0B1B3D]">
              Singha Durbar & Politics Desk
            </h2>
          </div>
          <Link to="/category/politics" className="text-xs font-semibold text-[#0B1B3D] hover:text-[#B83232] flex items-center gap-1">
            View All Politics <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(politicsArticles.length > 0 ? politicsArticles : nationalArticles.slice(0, 3)).map((art) => (
            <article key={art.id} className="bg-white border border-[#E2E8F0] p-4 rounded-xs hover:border-[#0B1B3D] transition-colors flex flex-col justify-between shadow-xs">
              <div>
                <img
                  src={art.featuredImage}
                  alt={art.title}
                  loading="lazy"
                  className="w-full h-44 object-cover rounded-xs mb-3"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <span className="text-[10px] font-bold text-[#B83232] uppercase tracking-wider block mb-1">
                  {art.category?.name || 'Politics'}
                </span>
                <Link to={`/news/${art.slug}`} className="group">
                  <h4 className="font-editorial text-lg font-bold text-[#0B1B3D] group-hover:text-[#9E2A2B] leading-snug">
                    {art.title}
                  </h4>
                </Link>
                <p className="text-xs text-[#64748B] line-clamp-2 mt-2 leading-relaxed">
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
      </section>

      {/* 3. ECONOMY, NEPSE & BUSINESS SECTION */}
      <section className="bg-white border border-[#E2E8F0] p-6 shadow-xs rounded-xs">
        <div className="border-b border-[#E2E8F0] pb-3 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-600 rounded-full animate-pulse"></span>
              <h2 className="font-editorial text-2xl font-bold text-[#0B1B3D]">
                Economy, NEPSE & Macro Trends
              </h2>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">Macroeconomic reserves, inflation indices, and market intelligence</p>
          </div>
          <Link to="/category/business" className="text-xs font-semibold text-[#0B1B3D] hover:text-[#B83232] flex items-center gap-1">
            View All Markets <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(economyArticles.length > 0 ? economyArticles : articles.slice(0, 4)).map((art) => (
            <article key={art.id} className="flex flex-col justify-between">
              <div>
                <img
                  src={art.featuredImage}
                  alt={art.title}
                  loading="lazy"
                  className="w-full h-36 object-cover rounded-xs mb-3"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                  Macro & Trade
                </span>
                <Link to={`/news/${art.slug}`} className="group">
                  <h4 className="font-editorial text-base font-bold text-[#0B1B3D] group-hover:text-[#9E2A2B] leading-tight">
                    {art.title}
                  </h4>
                </Link>
                <p className="text-xs text-[#64748B] line-clamp-2 mt-2 leading-relaxed">
                  {art.summary}
                </p>
              </div>
              <span className="text-[11px] text-[#94A3B8] mt-3 pt-2 border-t border-[#F1F5F9]">
                {formatNewsTime(art.publishedAt)}
              </span>
            </article>
          ))}
        </div>
      </section>

      {/* 4. KATHMANDU VALLEY & URBAN PULSE */}
      <section>
        <div className="border-b-2 border-[#0B1B3D] pb-2 mb-6 flex items-center justify-between">
          <h2 className="font-editorial text-2xl font-bold text-[#0B1B3D]">
            Kathmandu Valley Affairs
          </h2>
          <Link to="/category/kathmandu" className="text-xs font-semibold text-[#0B1B3D] hover:text-[#B83232] flex items-center gap-1">
            View Valley News <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(kathmanduArticles.length > 0 ? kathmanduArticles : nationalArticles.slice(1, 4)).map((art) => (
            <article key={art.id} className="bg-white border border-[#E2E8F0] p-4 rounded-xs hover:border-[#0B1B3D] transition-colors flex flex-col justify-between shadow-xs">
              <div>
                <img
                  src={art.featuredImage}
                  alt={art.title}
                  loading="lazy"
                  className="w-full h-44 object-cover rounded-xs mb-3"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <span className="text-[10px] font-bold text-[#C59B27] uppercase tracking-wider block mb-1">
                  Valley Civic
                </span>
                <Link to={`/news/${art.slug}`} className="group">
                  <h4 className="font-editorial text-lg font-bold text-[#0B1B3D] group-hover:text-[#9E2A2B] leading-snug">
                    {art.title}
                  </h4>
                </Link>
                <p className="text-xs text-[#64748B] line-clamp-2 mt-2 leading-relaxed">
                  {art.summary}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-[11px] text-[#94A3B8]">
                <span>{formatNewsTime(art.publishedAt)}</span>
                <span>{art.author?.name || 'Metropolitan Bureau'}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 5. CLIMATE, HIMALAYAS & ENVIRONMENT (Parchment Blue/Slate Tint) */}
      <section className="bg-[#F0F5FA] border border-[#CBD5E1] p-6 rounded-xs">
        <div className="border-b border-[#CBD5E1] pb-3 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CloudRain className="w-5 h-5 text-sky-700" />
            <h2 className="font-editorial text-2xl font-bold text-[#0B1B3D]">
              Himalayan Climate & Cryosphere
            </h2>
          </div>
          <Link to="/category/climate" className="text-xs font-semibold text-sky-900 hover:underline">
            Alpine Investigations →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(climateArticles.length > 0 ? climateArticles : articles.slice(0, 3)).map((art) => (
            <article key={art.id} className="bg-white p-4 border border-[#CBD5E1] rounded-xs shadow-xs flex flex-col justify-between">
              <div>
                <img
                  src={art.featuredImage}
                  alt={art.title}
                  loading="lazy"
                  className="w-full h-40 object-cover rounded-xs mb-3"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider block mb-1">
                  Cryosphere & Glaciers
                </span>
                <Link to={`/news/${art.slug}`} className="group">
                  <h4 className="font-editorial text-base font-bold text-[#0B1B3D] group-hover:text-[#9E2A2B] leading-snug">
                    {art.title}
                  </h4>
                </Link>
                <p className="text-xs text-[#64748B] line-clamp-2 mt-2 leading-relaxed">
                  {art.summary}
                </p>
              </div>
              <span className="text-[11px] text-[#94A3B8] mt-3 pt-2 border-t border-[#F1F5F9]">
                {formatNewsTime(art.publishedAt)}
              </span>
            </article>
          ))}
        </div>
      </section>

      {/* 6. TECHNOLOGY & DIGITAL NEPAL */}
      <section>
        <div className="border-b-2 border-[#0B1B3D] pb-2 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-600" />
            <h2 className="font-editorial text-2xl font-bold text-[#0B1B3D]">
              Technology & Innovation
            </h2>
          </div>
          <Link to="/category/technology" className="text-xs font-semibold text-[#0B1B3D] hover:text-[#B83232] flex items-center gap-1">
            View All Tech <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(techArticles.length > 0 ? techArticles : articles.slice(2, 5)).map((art) => (
            <article key={art.id} className="bg-white border border-[#E2E8F0] p-4 rounded-xs hover:border-[#0B1B3D] transition-colors flex flex-col justify-between shadow-xs">
              <div>
                <img
                  src={art.featuredImage}
                  alt={art.title}
                  loading="lazy"
                  className="w-full h-44 object-cover rounded-xs mb-3"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block mb-1">
                  Digital Frontier
                </span>
                <Link to={`/news/${art.slug}`} className="group">
                  <h4 className="font-editorial text-lg font-bold text-[#0B1B3D] group-hover:text-[#9E2A2B] leading-snug">
                    {art.title}
                  </h4>
                </Link>
                <p className="text-xs text-[#64748B] line-clamp-2 mt-2 leading-relaxed">
                  {art.summary}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-[11px] text-[#94A3B8]">
                <span>{formatNewsTime(art.publishedAt)}</span>
                <span>{art.author?.name || 'Tech Bureau'}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 7. SPORTS & ATHLETICS */}
      <section>
        <div className="border-b-2 border-[#0B1B3D] pb-2 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-red-600" />
            <h2 className="font-editorial text-2xl font-bold text-[#0B1B3D]">
              Sports & Athletic Glory
            </h2>
          </div>
          <Link to="/category/sports" className="text-xs font-semibold text-[#0B1B3D] hover:text-[#B83232] flex items-center gap-1">
            View All Sports <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(sportsArticles.length > 0 ? sportsArticles : articles.slice(3, 6)).map((art) => (
            <article key={art.id} className="bg-white border border-[#E2E8F0] p-4 rounded-xs hover:border-[#0B1B3D] transition-colors flex flex-col justify-between shadow-xs">
              <div>
                <img
                  src={art.featuredImage}
                  alt={art.title}
                  loading="lazy"
                  className="w-full h-44 object-cover rounded-xs mb-3"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1531415074868-036b1c575351?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block mb-1">
                  National Sports
                </span>
                <Link to={`/news/${art.slug}`} className="group">
                  <h4 className="font-editorial text-lg font-bold text-[#0B1B3D] group-hover:text-[#9E2A2B] leading-snug">
                    {art.title}
                  </h4>
                </Link>
                <p className="text-xs text-[#64748B] line-clamp-2 mt-2 leading-relaxed">
                  {art.summary}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-[11px] text-[#94A3B8]">
                <span>{formatNewsTime(art.publishedAt)}</span>
                <span>{art.author?.name || 'Sports Desk'}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 8. OPINION, EDITORIAL & COLUMNS (Warm parchment background) */}
      <section className="bg-[#F5F2EB] border-t-2 border-b-2 border-[#D6CEBF] p-8 rounded-xs">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-[#78350F]">
              Civic Discourse & Perspectives
            </span>
            <h2 className="font-editorial text-3xl font-bold text-[#0B1B3D] mt-1">
              Opinion & Editorial Columns
            </h2>
            <div className="w-16 h-0.5 bg-[#B83232] mx-auto mt-2"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(opinionArticles.length > 0 ? opinionArticles : articles.slice(0, 3)).map((col) => (
              <article key={col.id} className="bg-white p-6 border border-[#E5DFD5] rounded-xs flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                      alt={col.author?.name || 'Columnist'}
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#C59B27]"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-[#0B1B3D]">{col.author?.name || 'Senior Analyst'}</h4>
                      <p className="text-[11px] text-[#64748B]">Contributing Columnist</p>
                    </div>
                  </div>

                  <Link to={`/news/${col.slug}`} className="group">
                    <h3 className="font-editorial text-lg font-bold text-[#0B1B3D] group-hover:text-[#9E2A2B] leading-snug">
                      "{col.title}"
                    </h3>
                  </Link>

                  <p className="text-xs text-[#475569] mt-3 line-clamp-3 leading-relaxed italic">
                    {col.summary}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-[11px] text-[#94A3B8]">
                  <span>{formatNewsTime(col.publishedAt)}</span>
                  <Link to={`/news/${col.slug}`} className="font-semibold text-[#78350F] hover:underline">
                    Read Essay →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 9. PHOTO DISPATCHES & EDITORIAL GALLERY */}
      <section className="bg-[#12161F] text-white p-8 rounded-xs">
        <div className="flex items-center justify-between border-b border-[#242C3F] pb-3 mb-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#C59B27] block">
              Visual Journalism
            </span>
            <h2 className="font-editorial text-2xl font-bold text-white mt-0.5">
              Photo Dispatches Across Nepal
            </h2>
          </div>
          <span className="text-xs text-[#94A3B8]">Curated Field Photography</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {photoGallery.map(item => (
            <Link key={item.id} to={`/news/${item.slug}`} className="group relative block overflow-hidden rounded-xs">
              <img
                src={item.featuredImage}
                alt={item.title}
                loading="lazy"
                className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                <p className="font-editorial text-xs font-semibold text-white line-clamp-2 leading-tight">
                  {item.title}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
