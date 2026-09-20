/* ==========================================================================
   news-data.js (TIER 1)
   CP Chemicals Newsroom articles. The original 3 articles were each a
   hand-built, uniquely-formatted static HTML page (anniversary_story.html,
   wheat_guide.html, sustainability_update.html), linked from a hardcoded
   card on news.html.

   This module stores the CARD metadata for ALL articles (badge, date,
   title, excerpt, optional photo, optional YouTube link) in localStorage,
   editable from manage_news.html. The 3 original articles keep their
   existing hand-built pages exactly as they are (via a `legacyUrl` field
   the card links to instead of the dynamic viewer). Every NEW article
   added from here on gets its full body, photo and video stored too, and
   is read by the new news_article.html?id=... viewer -- so publishing a
   new article never again requires building a new HTML page by hand.

   Persisted under localStorage key 'cp_news_articles'.

   A note on size: unlike Firestore (where each document gets its own 1MB
   allowance), localStorage shares one small pool (commonly ~5-10MB total)
   across EVERYTHING the whole site stores for this browser -- cart,
   invoices, diagnosis log, all of it. A 500KB photo is fine occasionally,
   but several image-heavy articles could meaningfully eat into that shared
   budget faster than the same feature would in Tier 2. manage_news.html's
   own size check reflects this.
   ========================================================================== */

const DEFAULT_NEWS_ARTICLES = [
    { id: 'seed-1', badge: 'Announcement', date: 'April 2026', title: 'Celebrating 20 Years of Growth',
      excerpt: 'Join us as we reflect on two decades of supporting Zimbabwean farmers with quality chemicals and expert advice.',
      content: '', image: null, videoUrl: null, legacyUrl: 'anniversary_story.html', order: 1 },
    { id: 'seed-2', badge: 'Agronomy Guide', date: 'March 2026', title: 'Preparing for the Winter Wheat Season',
      excerpt: 'Our experts share the top 5 mistakes to avoid during the initial planting phase this year to maximize your yield.',
      content: '', image: null, videoUrl: null, legacyUrl: 'wheat_guide.html', order: 2 },
    { id: 'seed-3', badge: 'Sustainability', date: 'February 2026', title: 'New Eco-Friendly Packaging',
      excerpt: 'CP Chemicals is moving towards sustainable distribution with our new recyclable container initiative launching this quarter.',
      content: '', image: null, videoUrl: null, legacyUrl: 'sustainability_update.html', order: 3 }
];

function getNewsArticles() {
    try {
        const stored = JSON.parse(localStorage.getItem('cp_news_articles'));
        if (stored && stored.length > 0) return stored.sort((a, b) => (a.order || 0) - (b.order || 0));
    } catch (e) { /* fall through to seeding */ }
    localStorage.setItem('cp_news_articles', JSON.stringify(DEFAULT_NEWS_ARTICLES));
    return DEFAULT_NEWS_ARTICLES.slice();
}

function saveNewsArticles(list) {
    localStorage.setItem('cp_news_articles', JSON.stringify(list));
}

function getNewsArticleById(id) {
    return getNewsArticles().find(a => a.id === id) || null;
}

function addNewsArticle(badge, title, excerpt, content, date, image = null, videoUrl = null) {
    const list = getNewsArticles();
    const nextOrder = list.length > 0 ? Math.min(...list.map(a => a.order || 0)) - 1 : 1; // new articles appear first
    const article = {
        id: 'NEWS-' + Date.now().toString(36).toUpperCase(),
        badge, title, excerpt, content, image, videoUrl,
        date: date || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        legacyUrl: null, order: nextOrder
    };
    list.push(article);
    saveNewsArticles(list);
    return article;
}

function updateNewsArticle(id, fields) {
    const list = getNewsArticles();
    const idx = list.findIndex(a => a.id === id);
    if (idx === -1) return;
    Object.assign(list[idx], fields);
    saveNewsArticles(list);
}

function deleteNewsArticle(id) {
    const list = getNewsArticles().filter(a => a.id !== id);
    saveNewsArticles(list);
}

/**
 * Extracts a YouTube video ID from any common share/watch URL format and returns a proper
 * embeddable URL. Staff paste the normal link they'd copy from YouTube (watch?v=... or youtu.be/...);
 * a raw watch-page URL cannot be used directly in an <iframe>, only the /embed/ form can. Returns
 * null for anything that isn't a recognised YouTube URL, so the caller can fall back to a plain link.
 */
function getYouTubeEmbedUrl(url) {
    if (!url) return null;
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return `https://www.youtube.com/embed/${match[1]}`;
    }
    return null;
}
