import { prisma } from '../config/db.js';
import { slugify } from '../utils/auth.js';

/**
 * GET /api/articles
 * Supports search, category filter, isBreaking, isFeatured, isTrending, pagination
 */
export async function getArticles(req, res, next) {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      isBreaking,
      isFeatured,
      isTrending
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where = {
      status: 'PUBLISHED'
    };

    if (category) {
      where.category = { slug: category };
    }

    if (isBreaking === 'true') {
      where.isBreaking = true;
    }

    if (isFeatured === 'true') {
      where.isFeatured = true;
    }

    if (isTrending === 'true') {
      where.isTrending = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [articles, totalCount] = await Promise.all([
      prisma.newsArticle.findMany({
        where,
        skip,
        take,
        orderBy: { publishedAt: 'desc' },
        include: {
          category: { select: { id: true, name: true, slug: true, nepaliName: true, colorCode: true } },
          author: { select: { id: true, name: true, email: true } },
          _count: { select: { comments: true } }
        }
      }),
      prisma.newsArticle.count({ where })
    ]);

    res.json({
      success: true,
      data: articles,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalCount / Number(limit)),
        totalCount
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/articles/:slug
 * Retrieves full article and increments view count
 */
export async function getArticleBySlug(req, res, next) {
  try {
    const { slug } = req.params;

    const article = await prisma.newsArticle.findUnique({
      where: { slug },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true
          }
        },
        comments: {
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true } }
          }
        }
      }
    });

    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }

    // Increment view count asynchronously
    prisma.newsArticle.update({
      where: { id: article.id },
      data: { views: { increment: 1 } }
    }).catch(err => console.error('Failed to increment views', err));

    // Get related articles from the same category
    const related = await prisma.newsArticle.findMany({
      where: {
        categoryId: article.categoryId,
        id: { not: article.id },
        status: 'PUBLISHED'
      },
      take: 4,
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        featuredImage: true,
        publishedAt: true,
        readingTimeMin: true,
        category: { select: { name: true, slug: true } }
      }
    });

    // Get previous and next articles for pagination navigation
    const [prevArticle, nextArticle] = await Promise.all([
      prisma.newsArticle.findFirst({
        where: { publishedAt: { lt: article.publishedAt }, status: 'PUBLISHED' },
        orderBy: { publishedAt: 'desc' },
        select: { id: true, title: true, slug: true }
      }),
      prisma.newsArticle.findFirst({
        where: { publishedAt: { gt: article.publishedAt }, status: 'PUBLISHED' },
        orderBy: { publishedAt: 'asc' },
        select: { id: true, title: true, slug: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        ...article,
        related,
        prevArticle,
        nextArticle
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/articles/breaking
 */
export async function getBreakingNews(req, res, next) {
  try {
    const breaking = await prisma.newsArticle.findMany({
      where: {
        isBreaking: true,
        status: 'PUBLISHED'
      },
      take: 6,
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        publishedAt: true,
        category: { select: { name: true, slug: true } }
      }
    });

    res.json({ success: true, data: breaking });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/articles/:slug/comments
 */
export async function postComment(req, res, next) {
  try {
    const { slug } = req.params;
    const { content, guestName, guestEmail } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Comment content cannot be empty.' });
    }

    const article = await prisma.newsArticle.findUnique({ where: { slug } });
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }

    const comment = await prisma.newsComment.create({
      data: {
        articleId: article.id,
        userId: req.user?.id || null,
        guestName: req.user ? req.user.name : (guestName || 'Anonymous Reader'),
        guestEmail: req.user ? req.user.email : (guestEmail || null),
        content: content.trim(),
        isApproved: true
      }
    });

    res.status(201).json({ success: true, data: comment, message: 'Comment submitted successfully.' });
  } catch (err) {
    next(err);
  }
}
