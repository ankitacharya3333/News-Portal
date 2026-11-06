import { prisma } from '../config/db.js';
import { slugify } from '../utils/auth.js';
import { sendBookingStatusUpdate } from '../services/emailService.js';
import { REGISTERED_PROVIDERS, fetchRssFeed } from '../services/newsSyncService.js';

/**
 * GET /api/admin/overview
 * Real database statistics from Neon PostgreSQL
 */
export async function getDashboardOverview(req, res, next) {
  try {
    const [
      totalPublished,
      totalDrafts,
      totalUsers,
      totalInquiries,
      unreadInquiries,
      totalSubscribers,
      totalAppointments,
      pendingAppointments,
      viewsAggregate,
      recentArticles,
      latestSync
    ] = await Promise.all([
      prisma.newsArticle.count({ where: { status: 'PUBLISHED' } }),
      prisma.newsArticle.count({ where: { status: 'DRAFT' } }),
      prisma.user.count(),
      prisma.inquiry.count(),
      prisma.inquiry.count({ where: { status: 'NEW' } }),
      prisma.newsSubscriber.count({ where: { isActive: true } }),
      prisma.appointment.count(),
      prisma.appointment.count({ where: { bookingStatus: 'PENDING' } }),
      prisma.newsArticle.aggregate({ _sum: { views: true } }),
      prisma.newsArticle.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { name: true } },
          author: { select: { name: true } }
        }
      }),
      prisma.newsSyncLog.findFirst({
        orderBy: { syncedAt: 'desc' }
      })
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalPublished,
          totalDrafts,
          totalUsers,
          totalInquiries,
          unreadInquiries,
          totalSubscribers,
          totalAppointments,
          pendingAppointments,
          totalViews: viewsAggregate._sum.views || 0
        },
        recentArticles,
        latestSync
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Article Management (CRUD + Breaking/Featured toggles)
 */
export async function createArticle(req, res, next) {
  try {
    const { title, summary, content, categoryId, featuredImage, imageCaption, imageSource, isBreaking, isFeatured, status } = req.body;

    if (!title || !summary || !content || !categoryId) {
      return res.status(400).json({ success: false, message: 'Title, summary, content, and category are required.' });
    }

    let slug = slugify(title);
    const existing = await prisma.newsArticle.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const article = await prisma.newsArticle.create({
      data: {
        title,
        slug,
        summary,
        content,
        featuredImage: featuredImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
        imageCaption: imageCaption || null,
        imageSource: imageSource || 'The Nepal Chronicle Desk',
        status: status || 'PUBLISHED',
        isBreaking: Boolean(isBreaking),
        isFeatured: Boolean(isFeatured),
        categoryId,
        authorId: req.user.id,
        publishedAt: status === 'PUBLISHED' ? new Date() : new Date()
      }
    });

    res.status(201).json({ success: true, data: article, message: 'Article created successfully.' });
  } catch (err) {
    next(err);
  }
}

export async function updateArticle(req, res, next) {
  try {
    const { id } = req.params;
    const { title, summary, content, categoryId, featuredImage, imageCaption, imageSource, isBreaking, isFeatured, status } = req.body;

    const data = {
      title,
      summary,
      content,
      categoryId,
      featuredImage,
      imageCaption,
      imageSource,
      isBreaking: Boolean(isBreaking),
      isFeatured: Boolean(isFeatured),
      status
    };

    const updated = await prisma.newsArticle.update({
      where: { id },
      data
    });

    res.json({ success: true, data: updated, message: 'Article updated successfully.' });
  } catch (err) {
    next(err);
  }
}

export async function deleteArticle(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.newsArticle.delete({ where: { id } });
    res.json({ success: true, message: 'Article deleted successfully.' });
  } catch (err) {
    next(err);
  }
}

/**
 * Appointments & Consultations Management
 */
export async function getAppointments(req, res, next) {
  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: appointments });
  } catch (err) {
    next(err);
  }
}

export async function updateAppointmentStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        bookingStatus: status,
        notes: adminNotes || undefined
      }
    });

    res.json({ success: true, data: updated, message: `Booking status changed to ${status}.` });
  } catch (err) {
    next(err);
  }
}

/**
 * Inquiries Management
 */
export async function getInquiries(req, res, next) {
  try {
    const inquiries = await prisma.inquiry.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: inquiries });
  } catch (err) {
    next(err);
  }
}

export async function updateInquiryStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await prisma.inquiry.update({
      where: { id },
      data: { status }
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

/**
 * Live News Ingestion Manual Trigger & Status
 */
export async function syncNewsFeeds(req, res, next) {
  try {
    let importedCount = 0;
    let skippedCount = 0;
    const syncLogs = [];

    // Find default categories
    const nationalCategory = await prisma.newsCategory.findFirst({ where: { slug: 'national' } }) ||
                             await prisma.newsCategory.findFirst();

    for (const provider of REGISTERED_PROVIDERS) {
      if (provider.type === 'RSS') {
        try {
          const items = await fetchRssFeed(provider);
          let providerImported = 0;
          let providerSkipped = 0;

          for (const item of items) {
            const existing = await prisma.newsArticle.findUnique({
              where: { sourceChecksum: item.checksum }
            });

            if (!existing) {
              const baseSlug = slugify(item.title);
              const slug = `${baseSlug.slice(0, 80)}-${Date.now().toString().slice(-4)}`;

              // Attempt category mapping
              let matchedCat = await prisma.newsCategory.findFirst({ where: { slug: item.categorySlug } });
              if (!matchedCat) matchedCat = nationalCategory;

              await prisma.newsArticle.create({
                data: {
                  title: item.title,
                  slug,
                  summary: item.summary,
                  content: `${item.summary}\n\n[Full story covered by original publisher ${item.sourceName}. Follow original source link for complete reportage.]`,
                  featuredImage: item.imageUrl,
                  imageCaption: `Wire dispatch via ${item.sourceName}`,
                  imageSource: item.sourceName,
                  status: 'PUBLISHED',
                  isExternal: true,
                  sourceName: item.sourceName,
                  sourceUrl: item.sourceUrl,
                  sourceChecksum: item.checksum,
                  publishedAt: item.publishedAt,
                  categoryId: matchedCat.id
                }
              });
              providerImported++;
              importedCount++;
            } else {
              providerSkipped++;
              skippedCount++;
            }
          }

          await prisma.newsSyncLog.create({
            data: {
              providerName: provider.name,
              feedUrl: provider.url,
              status: 'SUCCESS',
              itemsImported: providerImported
            }
          });

          syncLogs.push({ provider: provider.name, imported: providerImported, skipped: providerSkipped, status: 'SUCCESS' });
        } catch (err) {
          await prisma.newsSyncLog.create({
            data: {
              providerName: provider.name,
              feedUrl: provider.url,
              status: 'FAILED',
              errorMessage: err.message
            }
          });
          syncLogs.push({ provider: provider.name, error: err.message, status: 'FAILED' });
        }
      }
    }

    res.json({
      success: true,
      message: `News synchronization finished: ${importedCount} imported, ${skippedCount} skipped (duplicates prevented).`,
      importedCount,
      skippedCount,
      logs: syncLogs
    });
  } catch (err) {
    next(err);
  }
}
