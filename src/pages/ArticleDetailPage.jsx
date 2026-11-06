import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, Eye, Share2, Check, ArrowLeft, ArrowRight, MessageSquare, Send } from 'lucide-react';
import { newsService } from '../services/api';
import { formatNewsTime } from '../utils/dateUtils';
import { useAuth } from '../context/AuthContext';

export default function ArticleDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);

  useEffect(() => {
    setLoading(true);
    window.scrollTo(0, 0);
    newsService.getArticleBySlug(slug)
      .then(res => {
        setArticle(res.data?.data);
      })
      .catch(err => {
        console.error('Failed to load article:', err);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      const res = await newsService.postComment(slug, {
        content: commentText.trim(),
        guestName: user ? user.name : (commentAuthor.trim() || 'Civic Reader')
      });
      if (article) {
        setArticle({
          ...article,
          comments: [res.data?.data, ...(article.comments || [])]
        });
      }
      setCommentText('');
      setCommentAuthor('');
      setCommentSuccess(true);
      setTimeout(() => setCommentSuccess(false), 4000);
    } catch (err) {
      alert(err.message || 'Comment submission failed');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-6 animate-pulse">
        <div className="h-10 bg-neutral-200 rounded w-3/4"></div>
        <div className="h-6 bg-neutral-200 rounded w-1/2"></div>
        <div className="h-96 bg-neutral-200 rounded"></div>
        <div className="space-y-3">
          <div className="h-4 bg-neutral-200 rounded"></div>
          <div className="h-4 bg-neutral-200 rounded"></div>
          <div className="h-4 bg-neutral-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <h2 className="font-editorial text-2xl font-bold text-[#0B1B3D]">Article Not Found</h2>
        <p className="text-sm text-[#64748B] mt-2">The requested dispatch may have been moved, updated, or archived.</p>
        <Link to="/" className="inline-block mt-4 text-xs font-semibold text-[#B83232] hover:underline">
          Return to Front Page
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto py-4">
      {/* Category & Breadcrumb */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 mb-6">
        <div className="flex items-center gap-2 text-xs">
          <Link to="/" className="text-[#64748B] hover:text-[#0B1B3D]">Home</Link>
          <span className="text-neutral-300">/</span>
          <Link to={`/category/${article.category?.slug}`} className="font-semibold text-[#B83232] uppercase tracking-wider">
            {article.category?.name}
          </Link>
        </div>
        <div className="flex items-center gap-3 text-xs text-[#64748B]">
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {article.views + 1} Reads
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {article.readingTimeMin || 4} min read
          </span>
        </div>
      </div>

      {/* Main Headline */}
      <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-[#0B1B3D] tracking-tight leading-[1.15]">
        {article.title}
      </h1>

      {/* Standfirst / Summary Excerpt */}
      <p className="font-serif italic text-lg sm:text-xl text-[#334155] mt-4 leading-relaxed border-l-3 border-[#B83232] pl-4">
        {article.summary}
      </p>

      {/* Author & Publication Byline Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-4 my-6 border-t border-b border-[#E2E8F0] text-xs">
        <div className="flex items-center gap-3">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
            alt={article.author?.name || 'Author'}
            className="w-10 h-10 rounded-full object-cover border border-[#CBD5E1]"
          />
          <div>
            <span className="font-semibold text-[#0B1B3D] block text-sm">
              By {article.author?.name || 'Newsroom Bureau'}
            </span>
            <span className="text-[#64748B]">
              Senior Editorial Correspondent • {formatNewsTime(article.publishedAt)}
            </span>
          </div>
        </div>

        {/* Share buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#CBD5E1] rounded text-xs text-[#475569] hover:bg-white hover:text-[#0B1B3D] transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied' : 'Share Dispatch'}</span>
          </button>
        </div>
      </div>

      {/* Featured Lead Photograph */}
      <figure className="mb-8">
        <img
          src={article.featuredImage}
          alt={article.title}
          loading="lazy"
          className="w-full h-80 sm:h-[460px] object-cover rounded-xs"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80';
          }}
        />
        {(article.imageCaption || article.imageSource) && (
          <figcaption className="text-xs text-[#64748B] mt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center italic gap-1">
            <span>{article.imageCaption}</span>
            {article.imageSource && <span className="font-normal uppercase text-[10px] text-[#94A3B8]">Credit: {article.imageSource}</span>}
          </figcaption>
        )}
      </figure>

      {/* Wire Source Attribution Banner */}
      {article.isExternal && (
        <div className="p-4 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xs mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-[#0B1B3D] uppercase tracking-wide">Wire Source Attribution:</span>
            <p className="text-[#475569] mt-0.5">
              This wire report was ingested under editorial syndication from <strong>{article.sourceName}</strong>.
            </p>
          </div>
          {article.sourceUrl && (
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#0B1B3D] hover:bg-[#B83232] text-white rounded font-medium whitespace-nowrap transition-colors"
            >
              Read Full Original Report ↗
            </a>
          )}
        </div>
      )}

      {/* Article Content Body (Rich editorial typography) */}
      <div className="prose prose-lg max-w-none text-[#1E293B] leading-[1.8] space-y-6 text-[17px]">
        {article.content.split('\n\n').map((paragraph, idx) => (
          <p key={idx} className="first-letter:font-editorial first-letter:text-4xl first-letter:font-bold first-letter:float-left first-letter:mr-2 first-letter:text-[#0B1B3D]">
            {paragraph}
          </p>
        ))}
      </div>

      {/* Previous / Next Article Navigation */}
      <div className="mt-12 py-6 border-t border-b border-[#CBD5E1] grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
        {article.prevArticle ? (
          <Link to={`/news/${article.prevArticle.slug}`} className="group flex items-start gap-2 text-left">
            <ArrowLeft className="w-4 h-4 text-[#B83232] mt-0.5 flex-shrink-0 group-hover:-translate-x-1 transition-transform" />
            <div>
              <span className="text-[#94A3B8] uppercase text-[10px] font-bold block mb-0.5">Previous Dispatch</span>
              <span className="font-editorial text-sm font-bold text-[#0B1B3D] group-hover:text-[#B83232] line-clamp-1">{article.prevArticle.title}</span>
            </div>
          </Link>
        ) : <div />}

        {article.nextArticle ? (
          <Link to={`/news/${article.nextArticle.slug}`} className="group flex items-start justify-end gap-2 text-right">
            <div>
              <span className="text-[#94A3B8] uppercase text-[10px] font-bold block mb-0.5">Next Dispatch</span>
              <span className="font-editorial text-sm font-bold text-[#0B1B3D] group-hover:text-[#B83232] line-clamp-1">{article.nextArticle.title}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-[#B83232] mt-0.5 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
          </Link>
        ) : <div />}
      </div>

      {/* Reader Comments Section */}
      <section className="mt-12 pt-8 border-t-2 border-[#0B1B3D]">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="w-5 h-5 text-[#B83232]" />
          <h3 className="font-editorial text-2xl font-bold text-[#0B1B3D]">
            Reader Discussion ({article.comments?.length || 0})
          </h3>
        </div>

        {/* Comment Form */}
        <form onSubmit={handleCommentSubmit} className="bg-white p-5 border border-[#E2E8F0] rounded-xs mb-8">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B1B3D] mb-3">
            Civic Discussion & Perspectives
          </h4>

          {commentSuccess && (
            <div className="mb-3 p-3 bg-emerald-50 border border-emerald-300 rounded text-xs text-emerald-800">
              Your comment has been published to the discussion record.
            </div>
          )}

          {!user && (
            <input
              type="text"
              placeholder="Your Name (e.g. Bipin Sharma, Kathmandu)"
              value={commentAuthor}
              onChange={(e) => setCommentAuthor(e.target.value)}
              className="w-full text-xs p-2.5 mb-3 bg-[#FBF9F5] border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0B1B3D]"
            />
          )}

          <textarea
            rows="3"
            placeholder="Share your verified perspective or civic reflection..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full text-xs p-3 bg-[#FBF9F5] border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0B1B3D]"
            required
          ></textarea>

          <div className="mt-2 flex justify-between items-center">
            <span className="text-[11px] text-[#64748B]">Comments adhere to The Nepal Chronicle editorial code.</span>
            <button
              type="submit"
              disabled={submittingComment}
              className="px-4 py-2 bg-[#0B1B3D] hover:bg-[#B83232] text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submittingComment ? 'Posting...' : 'Post Comment'}</span>
            </button>
          </div>
        </form>

        {/* Existing Comments */}
        <div className="space-y-4">
          {(article.comments || []).map((comm) => (
            <div key={comm.id} className="p-4 bg-white border border-[#E2E8F0] rounded-xs">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-[#0B1B3D]">{comm.guestName || comm.user?.name || 'Reader'}</span>
                <span className="text-[#94A3B8]">{formatNewsTime(comm.createdAt)}</span>
              </div>
              <p className="text-xs text-[#334155] leading-relaxed">{comm.content}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related Dispatches in Same Desk */}
      {article.related && article.related.length > 0 && (
        <section className="mt-16 pt-8 border-t border-[#CBD5E1]">
          <h3 className="font-editorial text-2xl font-bold text-[#0B1B3D] mb-6">
            Related Dispatches from {article.category?.name}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {article.related.map(rel => (
              <Link key={rel.id} to={`/news/${rel.slug}`} className="group block bg-white p-3 border border-[#E2E8F0] rounded-xs hover:border-[#0B1B3D] transition-colors">
                <img
                  src={rel.featuredImage}
                  alt={rel.title}
                  loading="lazy"
                  className="w-full h-28 object-cover rounded-xs mb-2"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <h4 className="font-editorial text-sm font-bold text-[#0B1B3D] group-hover:text-[#9E2A2B] line-clamp-2">
                  {rel.title}
                </h4>
                <span className="text-[10px] text-[#94A3B8] block mt-1">{formatNewsTime(rel.publishedAt)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
