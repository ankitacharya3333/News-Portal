import Parser from 'rss-parser';
import crypto from 'crypto';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml; q=0.1'
  }
});

/**
 * Verified legitimate, active Nepali news feeds
 */
export const REGISTERED_PROVIDERS = [
  {
    id: 'onlinekhabar-rss',
    name: 'OnlineKhabar English',
    type: 'RSS',
    url: 'https://english.onlinekhabar.com/feed',
    defaultCategorySlug: 'national',
    active: true
  },
  {
    id: 'nepalnews-rss',
    name: 'NepalNews Digital',
    type: 'RSS',
    url: 'https://nepalnews.com/feed',
    defaultCategorySlug: 'politics',
    active: true
  },
  {
    id: 'ratopati-rss',
    name: 'Ratopati National Wire',
    type: 'RSS',
    url: 'https://ratopati.com/feed',
    defaultCategorySlug: 'national',
    active: true
  }
];

/**
 * Generate a SHA-256 checksum to prevent duplicate imports
 */
export function generateNewsChecksum(title, sourceUrl) {
  const normalized = `${(title || '').trim().toLowerCase()}_${(sourceUrl || '').trim()}`;
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Map keywords in headline or summary to the appropriate category slug
 */
function inferCategorySlug(title = '', summary = '', fallback = 'national') {
  const text = `${title} ${summary}`.toLowerCase();
  if (text.includes('parliament') || text.includes('minister') || text.includes('party') || text.includes('election') || text.includes('court') || text.includes('singha durbar')) {
    return 'politics';
  }
  if (text.includes('nepse') || text.includes('bank') || text.includes('remittance') || text.includes('economy') || text.includes('market') || text.includes('rupee') || text.includes('trade')) {
    return 'business';
  }
  if (text.includes('kathmandu') || text.includes('lalitpur') || text.includes('bhaktapur') || text.includes('patan') || text.includes('valley')) {
    return 'kathmandu';
  }
  if (text.includes('cricket') || text.includes('football') || text.includes('league') || text.includes('stadium') || text.includes('match') || text.includes('tournament')) {
    return 'sports';
  }
  if (text.includes('glacier') || text.includes('everest') || text.includes('himalaya') || text.includes('climate') || text.includes('snow') || text.includes('flood')) {
    return 'climate';
  }
  if (text.includes('tech') || text.includes('digital') || text.includes('software') || text.includes('startup') || text.includes('app') || text.includes('telecom')) {
    return 'technology';
  }
  if (text.includes('hospital') || text.includes('health') || text.includes('medicine') || text.includes('doctor') || text.includes('patient') || text.includes('vaccine')) {
    return 'health';
  }
  if (text.includes('school') || text.includes('university') || text.includes('student') || text.includes('exam') || text.includes('education') || text.includes('campus')) {
    return 'education';
  }
  if (text.includes('diplomacy') || text.includes('india') || text.includes('china') || text.includes('un ') || text.includes('embassy') || text.includes('global')) {
    return 'international';
  }
  return fallback;
}

/**
 * RSS Feed Ingestion Adapter
 */
export async function fetchRssFeed(provider) {
  try {
    const feed = await parser.parseURL(provider.url);
    const items = feed.items || [];

    return items.slice(0, 15).map(item => {
      // Strip HTML tags for clean editorial summary
      const cleanSummary = (item.contentSnippet || item.summary || item.content || '')
        .replace(/<[^>]*>?/gm, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 320);

      // Extract image enclosure or fallback to categorized high-res image
      let imageUrl = null;
      if (item.enclosure && item.enclosure.url) {
        imageUrl = item.enclosure.url;
      } else if (item['media:content'] && item['media:content'].$ && item['media:content'].$.url) {
        imageUrl = item['media:content'].$.url;
      }

      const categorySlug = inferCategorySlug(item.title, cleanSummary, provider.defaultCategorySlug);

      const defaultCategoryImages = {
        national: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
        politics: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&w=1200&q=80',
        business: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
        kathmandu: 'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?auto=format&fit=crop&w=1200&q=80',
        climate: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
        technology: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
        sports: 'https://images.unsplash.com/photo-1531415074868-036b1c575351?auto=format&fit=crop&w=1200&q=80'
      };

      return {
        title: item.title?.trim() || 'Untitled Dispatch',
        summary: cleanSummary || 'Read primary investigative dispatch at the publisher source.',
        sourceName: provider.name,
        sourceUrl: item.link || provider.url,
        imageUrl: imageUrl || defaultCategoryImages[categorySlug] || defaultCategoryImages.national,
        publishedAt: item.isoDate ? new Date(item.isoDate) : (item.pubDate ? new Date(item.pubDate) : new Date()),
        categorySlug,
        checksum: generateNewsChecksum(item.title, item.link)
      };
    });
  } catch (err) {
    console.error(`[NewsSync] RSS fetch error for ${provider.name}:`, err.message);
    throw err;
  }
}
