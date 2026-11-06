import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, Clock } from 'lucide-react';
import { newsService } from '../services/api';
import { formatNewsTime } from '../utils/dateUtils';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [inputVal, setInputVal] = useState(queryParam);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (queryParam) {
      setLoading(true);
      newsService.getArticles({ search: queryParam, limit: 20 })
        .then(res => {
          setResults(res.data.data || []);
          setSearched(true);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [queryParam]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setSearchParams({ q: inputVal.trim() });
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8">
      {/* Search Header */}
      <div className="border-b-2 border-[#0B1B3D] pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-[#B83232] block mb-1">
          Editorial Archives & Search
        </span>
        <h1 className="font-editorial text-4xl font-bold text-[#0B1B3D]">
          Search Publications
        </h1>
        <p className="text-sm text-[#475569] mt-1">
          Explore past investigative pieces, government decrees, and national reporting.
        </p>

        {/* Large Search Input */}
        <form onSubmit={handleSearch} className="mt-6 flex gap-3">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Search keywords, ministries, politicians, places..."
            className="flex-1 text-sm p-3 bg-white border-2 border-[#CBD5E1] rounded focus:outline-none focus:border-[#0B1B3D]"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-[#0B1B3D] hover:bg-[#B83232] text-white text-xs font-bold uppercase tracking-wider rounded transition-colors flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </form>
      </div>

      {/* Results Section */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-24 bg-neutral-200 rounded"></div>
          <div className="h-24 bg-neutral-200 rounded"></div>
          <div className="h-24 bg-neutral-200 rounded"></div>
        </div>
      ) : searched ? (
        <div>
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-6">
            <span>Found <strong>{results.length}</strong> dispatches matching "{queryParam}"</span>
          </div>

          {results.length === 0 ? (
            <div className="py-16 text-center bg-white border border-[#E2E8F0] rounded-xs p-8">
              <h3 className="font-editorial text-xl font-bold text-[#0B1B3D]">No matches found</h3>
              <p className="text-xs text-[#64748B] mt-2">Try broader terms or verify the spelling of proper nouns.</p>
            </div>
          ) : (
            <div className="space-y-6 divide-y divide-[#E2E8F0]">
              {results.map(item => (
                <article key={item.id} className="pt-6 first:pt-0 flex flex-col sm:flex-row gap-6">
                  {item.featuredImage && (
                    <img
                      src={item.featuredImage}
                      alt={item.title}
                      className="w-full sm:w-48 h-32 object-cover rounded-xs flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <span className="text-[10px] font-bold text-[#B83232] uppercase tracking-wider block mb-1">
                      {item.category?.name || 'Archive'}
                    </span>
                    <Link to={`/news/${item.slug}`} className="group">
                      <h3 className="font-editorial text-xl font-bold text-[#0B1B3D] group-hover:text-[#9E2A2B] leading-snug">
                        {item.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-[#475569] mt-2 line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                    <div className="mt-3 text-[11px] text-[#94A3B8] flex items-center gap-2">
                      <span>{item.author?.name || 'Newsroom'}</span>
                      <span>•</span>
                      <span>{formatNewsTime(item.publishedAt)}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-xs text-[#64748B]">
          Enter your search term above to search our national database.
        </div>
      )}
    </div>
  );
}

