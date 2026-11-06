import { prisma } from '../config/db.js';
import { hashPassword, comparePassword, signToken } from '../utils/auth.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../services/emailService.js';
import crypto from 'crypto';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

export async function register(req, res, next) {
  try {
    const validated = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const passwordHash = await hashPassword(validated.password);

    // SECURITY GUARANTEE: Public registration ALWAYS assigns CUSTOMER role.
    // Client-submitted roles are strictly ignored.
    const user = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email.toLowerCase(),
        passwordHash,
        role: 'CUSTOMER'
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });

    const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });

    // Send welcome email via Resend
    sendWelcomeEmail({ name: user.name, email: user.email }).catch(err => console.error('[WelcomeEmailError]', err));

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      success: true,
      data: { user, token },
      message: 'Account created successfully.'
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: err.errors });
    }
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const validated = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: validated.email.toLowerCase() }
    });

    if (!user || user.accountStatus === 'SUSPENDED') {
      return res.status(401).json({ success: false, message: 'Invalid credentials or inactive account.' });
    }

    const isValid = await comparePassword(validated.password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          company: user.company
        },
        token
      },
      message: 'Logged in successfully.'
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: err.errors });
    }
    next(err);
  }
}

export async function logout(req, res) {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully.' });
}

export async function getProfile(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        company: true,
        phone: true,
        createdAt: true,
        newsBookmarks: {
          include: {
            article: {
              select: {
                id: true,
                title: true,
                slug: true,
                featuredImage: true,
                publishedAt: true,
                category: { select: { name: true, slug: true } }
              }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.json({ success: true, message: 'If an account exists, a reset link has been dispatched.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpires }
    });

    sendPasswordResetEmail({ name: user.name, email: user.email, resetToken }).catch(err =>
      console.error('[ResetEmailError]', err)
    );

    res.json({ success: true, message: 'Password reset link sent to your registered email.' });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, email, newPassword } = req.body;

    if (!token || !email || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Valid token, email, and minimum 6 character password required.' });
    }

    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        resetToken: token,
        resetTokenExpires: { gt: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Reset token is invalid or has expired.' });
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpires: null
      }
    });

    res.json({ success: true, message: 'Password has been successfully reset. You may now log in.' });
  } catch (err) {
    next(err);
  }
}
