import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resendApiKey = process.env.RESEND_API_KEY;
const adminEmail = process.env.ADMIN_EMAIL || 'rmnrr333@gmail.com';
const emailFrom = process.env.EMAIL_FROM || 'The Nepal Chronicle <onboarding@resend.dev>';

const resend = resendApiKey ? new Resend(resendApiKey) : null;

/**
 * Common responsive HTML wrapper for Nepal Chronicle editorial emails
 */
function getEmailWrapper(title, preheader, contentHtml) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FBF9F5; margin: 0; padding: 20px; color: #1E293B; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 4px; border: 1px solid #E2E8F0; overflow: hidden; }
    .header { background: #0B1B3D; padding: 24px 30px; text-align: center; border-bottom: 3px solid #B83232; }
    .header h1 { color: #ffffff; margin: 0; font-family: Georgia, serif; font-size: 22px; letter-spacing: 0.5px; }
    .header p { color: #D1D5DB; margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; }
    .content { padding: 32px 30px; line-height: 1.65; font-size: 15px; }
    .badge { display: inline-block; background: #F3F4F6; color: #374151; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 3px; border-left: 3px solid #B83232; margin-bottom: 16px; }
    .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; background: #F8FAFC; border: 1px solid #E2E8F0; }
    .info-table td { padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 14px; }
    .info-table td.label { font-weight: 600; color: #475569; width: 35%; }
    .btn { display: inline-block; background: #B83232; color: #ffffff !important; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: 600; margin-top: 16px; font-size: 14px; }
    .footer { background: #F1F5F9; padding: 18px 30px; text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid #E2E8F0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>THE NEPAL CHRONICLE</h1>
      <p>Independent Nepali Digital Journalism • Kathmandu</p>
    </div>
    <div class="content">
      ${contentHtml}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} The Nepal Chronicle Media Pvt. Ltd. | Babarmahal, Kathmandu, Nepal</p>
      <p>This is an automated transmission. For inquiries, email <a href="mailto:${adminEmail}">${adminEmail}</a></p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Dispatch an email with Resend or provide safe dev log if API key not set yet
 */
async function sendEmail({ to, subject, html, replyTo = undefined, templateName = 'generic' }) {
  console.log(`[EmailService] Attempting to send [${templateName}] to: ${to} | Subject: "${subject}"`);
  
  if (!resend) {
    console.warn(`[EmailService] RESEND_API_KEY not configured. Simulating delivery:`);
    console.log(`-> TO: ${to}`);
    console.log(`-> SUBJECT: ${subject}`);
    console.log(`-> PREVIEW (Length: ${html.length} chars)`);
    return {
      success: true,
      simulated: true,
      message: 'Email logged (configure RESEND_API_KEY in server/.env for live dispatch via Resend)'
    };
  }

  try {
    const payload = {
      from: emailFrom,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    };

    if (replyTo) {
      payload.reply_to = replyTo;
    }

    const { data, error } = await resend.emails.send(payload);

    if (error) {
      console.error('[EmailService] Resend API Error:', error);
      return { success: false, error: error.message };
    }

    console.log(`[EmailService] Email successfully delivered via Resend. ID: ${data?.id}`);
    return { success: true, resendId: data?.id };
  } catch (err) {
    console.error('[EmailService] Unexpected delivery failure:', err);
    return { success: false, error: err.message };
  }
}

/**
 * 1. Contact Inquiry Notifications (Admin notification + User confirmation)
 */
export async function sendContactInquiryNotifications({ name, email, phone, subject, category, message, inquiryId }) {
  // A. Admin notification with direct reply-to the customer
  const adminSubject = `[Inquiry #${inquiryId?.slice(-6) || 'New'}] ${category}: ${subject}`;
  const adminHtml = getEmailWrapper(
    adminSubject,
    `New inquiry received from ${name}`,
    `
      <div class="badge">EDITORIAL INQUIRY DESK</div>
      <h2 style="margin-top:0; color:#0B1B3D;">New Message Received via Contact Portal</h2>
      <p>A new customer or reader inquiry has been received and stored in the database.</p>
      
      <table class="info-table">
        <tr><td class="label">Full Name</td><td><strong>${name}</strong></td></tr>
        <tr><td class="label">Email Address</td><td><a href="mailto:${email}">${email}</a></td></tr>
        <tr><td class="label">Phone</td><td>${phone || 'Not provided'}</td></tr>
        <tr><td class="label">Category</td><td>${category}</td></tr>
        <tr><td class="label">Subject</td><td>${subject}</td></tr>
      </table>

      <h4 style="margin-bottom:8px; color:#334155;">Message Content:</h4>
      <div style="background:#F8FAFC; padding:16px; border-left:4px solid #0B1B3D; border-radius:3px; white-space:pre-wrap; font-size:14px; color:#1E293B;">
${message}
      </div>
      <br/>
      <p style="font-size:13px; color:#64748B;">You can reply directly to this email to respond to <strong>${name}</strong> (${email}).</p>
    `
  );

  // B. User confirmation acknowledgment
  const userSubject = `We have received your message: "${subject}" — The Nepal Chronicle`;
  const userHtml = getEmailWrapper(
    userSubject,
    `Thank you for contacting The Nepal Chronicle`,
    `
      <h2 style="margin-top:0; color:#0B1B3D;">Thank you for reaching out, ${name}</h2>
      <p>Your message has been safely received by our editorial and support desk. A member of our team will review your inquiry and get back to you shortly.</p>
      
      <table class="info-table">
        <tr><td class="label">Inquiry Reference</td><td>#${inquiryId ? inquiryId.slice(0, 8).toUpperCase() : 'PENDING'}</td></tr>
        <tr><td class="label">Category</td><td>${category}</td></tr>
        <tr><td class="label">Submitted Subject</td><td>${subject}</td></tr>
      </table>

      <p>If your matter is an urgent news tip or press release, you can also reach our newsroom directly at <strong>newsdesk@nepalchronicle.com</strong>.</p>
      <br/>
      <p>Best regards,<br/><strong>The Editorial & Communications Team</strong><br/>The Nepal Chronicle</p>
    `
  );

  const [adminResult, userResult] = await Promise.all([
    sendEmail({
      to: adminEmail,
      subject: adminSubject,
      html: adminHtml,
      replyTo: email,
      templateName: 'contact-admin-alert'
    }),
    sendEmail({
      to: email,
      subject: userSubject,
      html: userHtml,
      templateName: 'contact-user-confirmation'
    })
  ]);

  return { adminResult, userResult };
}

/**
 * 2. Consultation & Booking Notifications (Admin alert + Customer confirmation)
 */
export async function sendBookingNotifications(booking) {
  const { bookingRef, name, email, phone, organization, serviceType, preferredDate, preferredTimeSlot, details } = booking;
  
  const formattedDate = new Date(preferredDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // A. Admin notification
  const adminSubject = `[Booking Request ${bookingRef}] ${serviceType.replace('_', ' ')} from ${name}`;
  const adminHtml = getEmailWrapper(
    adminSubject,
    `New Consultation Scheduled: ${bookingRef}`,
    `
      <div class="badge" style="border-left-color:#C59B27;">CONSULTATION & PARTNERSHIP DESK</div>
      <h2 style="margin-top:0; color:#0B1B3D;">New Appointment Request: ${bookingRef}</h2>
      <p>A new consultation or media coverage session has been requested.</p>

      <table class="info-table">
        <tr><td class="label">Reference ID</td><td><strong>${bookingRef}</strong></td></tr>
        <tr><td class="label">Requested Service</td><td><strong>${serviceType.replace(/_/g, ' ')}</strong></td></tr>
        <tr><td class="label">Requested Date</td><td><strong>${formattedDate}</strong></td></tr>
        <tr><td class="label">Requested Time Slot</td><td><strong>${preferredTimeSlot}</strong></td></tr>
        <tr><td class="label">Client Name</td><td>${name}</td></tr>
        <tr><td class="label">Client Email</td><td><a href="mailto:${email}">${email}</a></td></tr>
        <tr><td class="label">Phone</td><td>${phone}</td></tr>
        <tr><td class="label">Organization</td><td>${organization || 'Individual / None'}</td></tr>
      </table>

      <h4 style="margin-bottom:8px; color:#334155;">Meeting Agenda & Notes:</h4>
      <div style="background:#F8FAFC; padding:16px; border-left:4px solid #C59B27; border-radius:3px; white-space:pre-wrap; font-size:14px;">
${details}
      </div>
      <br/>
      <p style="font-size:13px; color:#64748B;">Log in to the Admin Dashboard at <code>/admin/bookings</code> to confirm, reschedule, or manage this reservation.</p>
    `
  );

  // B. Customer confirmation
  const userSubject = `Appointment Request Confirmation [Ref: ${bookingRef}] — The Nepal Chronicle`;
  const userHtml = getEmailWrapper(
    userSubject,
    `Your consultation request ${bookingRef} has been received`,
    `
      <h2 style="margin-top:0; color:#0B1B3D;">Booking Request Received</h2>
      <p>Dear ${name},</p>
      <p>Thank you for requesting an appointment with The Nepal Chronicle's partnership and editorial desk. We have received your booking details and our team is reviewing availability.</p>

      <table class="info-table">
        <tr><td class="label">Booking Reference</td><td><strong style="color:#B83232;">${bookingRef}</strong></td></tr>
        <tr><td class="label">Service</td><td>${serviceType.replace(/_/g, ' ')}</td></tr>
        <tr><td class="label">Requested Date</td><td>${formattedDate}</td></tr>
        <tr><td class="label">Time Slot</td><td>${preferredTimeSlot}</td></tr>
        <tr><td class="label">Status</td><td><span style="color:#D97706; font-weight:600;">PENDING CONFIRMATION</span></td></tr>
      </table>

      <p>You will receive a follow-up notification as soon as our coordinator confirms the reservation or reaches out with an alternative schedule if necessary.</p>
      <p>If you need to update this appointment, please quote reference <strong>${bookingRef}</strong> in any correspondence.</p>
      <br/>
      <p>Warm regards,<br/><strong>Corporate Relations & News Desk</strong><br/>The Nepal Chronicle</p>
    `
  );

  return Promise.all([
    sendEmail({ to: adminEmail, subject: adminSubject, html: adminHtml, replyTo: email, templateName: 'booking-admin-alert' }),
    sendEmail({ to: email, subject: userSubject, html: userHtml, templateName: 'booking-user-confirmation' })
  ]);
}

/**
 * 3. Booking Status Update Notification
 */
export async function sendBookingStatusUpdate(booking, newStatus, internalNotes = '') {
  const { bookingRef, name, email, serviceType, preferredDate, preferredTimeSlot } = booking;
  const formattedDate = new Date(preferredDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const subject = `Update regarding your Booking [${bookingRef}]: ${newStatus}`;
  const html = getEmailWrapper(
    subject,
    `Booking status updated to ${newStatus}`,
    `
      <h2 style="margin-top:0; color:#0B1B3D;">Status Update: ${bookingRef}</h2>
      <p>Dear ${name},</p>
      <p>The status of your appointment for <strong>${serviceType.replace(/_/g, ' ')}</strong> has been updated to: <strong>${newStatus}</strong>.</p>

      <table class="info-table">
        <tr><td class="label">Reference</td><td>${bookingRef}</td></tr>
        <tr><td class="label">Scheduled Date</td><td>${formattedDate}</td></tr>
        <tr><td class="label">Time Slot</td><td>${preferredTimeSlot}</td></tr>
        <tr><td class="label">Current Status</td><td><strong>${newStatus}</strong></td></tr>
        ${internalNotes ? `<tr><td class="label">Coordinator Note</td><td>${internalNotes}</td></tr>` : ''}
      </table>

      <p>If you have any questions or wish to reschedule, feel free to reply directly to this notice.</p>
      <br/>
      <p>The Nepal Chronicle Desk</p>
    `
  );

  return sendEmail({ to: email, subject, html, templateName: 'booking-status-update' });
}

/**
 * 4. User Registration Welcome Email
 */
export async function sendWelcomeEmail({ name, email }) {
  const subject = `Welcome to The Nepal Chronicle, ${name}`;
  const html = getEmailWrapper(
    subject,
    `Welcome to Nepal's Premier Digital News Portal`,
    `
      <h2 style="margin-top:0; color:#0B1B3D;">Namaste & Welcome, ${name}!</h2>
      <p>Thank you for creating an account with <strong>The Nepal Chronicle</strong>. You now have full access to our curated national reporting, investigative journalism, market intelligence, and reader features.</p>

      <p>As a registered member, you can now:</p>
      <ul style="line-height:1.8; color:#334155;">
        <li>Bookmark in-depth investigative pieces and read offline or later.</li>
        <li>Participate in respectful civic discussions in the verified comments section.</li>
        <li>Receive curated morning editorial bulletins and breaking bulletins.</li>
        <li>Follow specific beat journalists and national policy coverage.</li>
      </ul>

      <div style="margin:24px 0; text-align:center;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="btn">Explore Today's Front Page</a>
      </div>

      <p style="font-size:13px; color:#64748B;">If you did not register for this account, please notify our security team at security@nepalchronicle.com.</p>
    `
  );

  return sendEmail({ to: email, subject, html, templateName: 'user-welcome' });
}

/**
 * 5. Password Reset Recovery Email
 */
export async function sendPasswordResetEmail({ name, email, resetToken }) {
  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
  const subject = `Password Reset Request — The Nepal Chronicle`;
  const html = getEmailWrapper(
    subject,
    `Reset instructions for your account`,
    `
      <div class="badge" style="border-left-color:#EF4444;">SECURITY ALERT</div>
      <h2 style="margin-top:0; color:#0B1B3D;">Reset Your Password</h2>
      <p>Dear ${name},</p>
      <p>We received a request to reset the password associated with your account (<strong>${email}</strong>). Click the secure link below to choose a new password:</p>

      <div style="margin:24px 0; text-align:center;">
        <a href="${resetLink}" class="btn" style="background:#0B1B3D;">Reset Account Password</a>
      </div>

      <p style="font-size:13px; color:#64748B;">This secure link is time-limited and will expire in <strong>1 hour</strong>. For security reasons, never share this link or forward this email.</p>
      <p style="font-size:13px; color:#64748B;">If you did not initiate this request, you can safely ignore this email; your existing password will remain intact.</p>
    `
  );

  return sendEmail({ to: email, subject, html, templateName: 'password-reset' });
}

