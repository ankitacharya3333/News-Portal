import express from 'express';
import { getArticles, getArticleBySlug, getBreakingNews, postComment } from '../controllers/articleController.js';
import { submitInquiry, createAppointment } from '../controllers/inquiryBookingController.js';
import { register, login, logout, getProfile, forgotPassword, resetPassword } from '../controllers/authController.js';
import {
  getDashboardOverview,
  createArticle,
  updateArticle,
  deleteArticle,
  getAppointments,
  updateAppointmentStatus,
  getInquiries,
  updateInquiryStatus,
  syncNewsFeeds
} from '../controllers/adminController.js';
import { authenticateUser, requireRole } from '../middleware/authMiddleware.js';
import { prisma } from '../config/db.js';

const router = express.Router();

// --- PUBLIC NEWS & EDITORIAL ROUTES ---
router.get('/articles', getArticles);
router.get('/articles/breaking', getBreakingNews);
router.get('/articles/:slug', getArticleBySlug);
router.post('/articles/:slug/comments', postComment);

// Categories
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await prisma.newsCategory.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { articles: true } }
      }
    });
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
});

// Editorial Journalists / Staff
router.get('/journalists', async (req, res, next) => {
  try {
    const journalists = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        name: true,
        company: true,
        email: true,
        role: true,
        _count: { select: { newsArticles: true } }
      }
    });
    res.json({ success: true, data: journalists });
  } catch (err) {
    next(err);
  }
});

// Newsletter subscription
router.post('/newsletter/subscribe', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid email address required.' });
    }

    const subscriber = await prisma.newsSubscriber.upsert({
      where: { email: email.toLowerCase() },
      update: { isActive: true },
      create: { email: email.toLowerCase(), isActive: true }
    });

    res.json({ success: true, message: 'Thank you for subscribing to The Nepal Chronicle morning dispatch!' });
  } catch (err) {
    next(err);
  }
});

// Contact & Booking Public Endpoints
router.post('/inquiries', submitInquiry);
router.post('/appointments', createAppointment);

// Authentication Public Endpoints
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/logout', logout);
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/reset-password', resetPassword);
router.get('/auth/me', authenticateUser, getProfile);

// --- PROTECTED ADMIN ROUTES (ADMIN Role Required) ---
const adminAuth = [authenticateUser, requireRole('ADMIN')];

router.get('/admin/overview', adminAuth, getDashboardOverview);
router.post('/admin/articles', adminAuth, createArticle);
router.put('/admin/articles/:id', adminAuth, updateArticle);
router.delete('/admin/articles/:id', adminAuth, deleteArticle);

router.get('/admin/appointments', adminAuth, getAppointments);
router.patch('/admin/appointments/:id', adminAuth, updateAppointmentStatus);

router.get('/admin/inquiries', adminAuth, getInquiries);
router.patch('/admin/inquiries/:id', adminAuth, updateInquiryStatus);

router.post('/admin/news-sync', adminAuth, syncNewsFeeds);

export default router;
