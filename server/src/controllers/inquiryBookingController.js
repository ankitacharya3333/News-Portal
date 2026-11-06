import { prisma } from '../config/db.js';
import { sendContactInquiryNotifications, sendBookingNotifications } from '../services/emailService.js';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  organization: z.string().optional(),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  category: z.string().min(1, 'Please select an inquiry category'),
  message: z.string().min(10, 'Message must be at least 10 characters')
});

const bookingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(7, 'Phone number must be at least 7 digits'),
  organization: z.string().optional(),
  serviceType: z.string().min(2, 'Please select service type'),
  preferredDate: z.string().min(1, 'Please select a date'),
  preferredTimeSlot: z.string().min(3, 'Please select a time slot'),
  details: z.string().min(10, 'Please provide consultation details / agenda')
});

/**
 * POST /api/inquiries
 * Submits contact form, saves to DB, emails rmnrr333@gmail.com + user receipt
 */
export async function submitInquiry(req, res, next) {
  try {
    const validated = contactSchema.parse(req.body);

    const ticketNumber = `INQ-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const inquiry = await prisma.inquiry.create({
      data: {
        ticketNumber,
        name: validated.name,
        email: validated.email,
        phone: validated.phone || null,
        organization: validated.organization || null,
        subject: validated.subject,
        message: validated.message,
        inquiryType: validated.category,
        status: 'NEW'
      }
    });

    // Send asynchronous transactional emails via Resend
    sendContactInquiryNotifications({
      ...validated,
      inquiryId: inquiry.id
    }).catch(err => console.error('[InquiryEmailError]', err));

    res.status(201).json({
      success: true,
      data: inquiry,
      message: 'Your inquiry has been successfully transmitted to our editorial desk.'
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: err.errors });
    }
    next(err);
  }
}

/**
 * POST /api/appointments
 * Books consultation/advertising/editorial meeting with duplicate slot collision prevention
 */
export async function createAppointment(req, res, next) {
  try {
    const validated = bookingSchema.parse(req.body);

    // Collision check: prevent double booking for the same slot on the same date
    const existingSlot = await prisma.appointment.findFirst({
      where: {
        appointmentDate: validated.preferredDate,
        appointmentTime: validated.preferredTimeSlot,
        bookingStatus: { in: ['PENDING', 'CONFIRMED'] }
      }
    });

    if (existingSlot) {
      return res.status(409).json({
        success: false,
        message: `The time slot "${validated.preferredTimeSlot}" on ${validated.preferredDate} is already reserved. Please select another slot.`
      });
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateStamp = validated.preferredDate.replace(/-/g, '');
    const referenceNumber = `NPC-BK-${dateStamp}-${randomSuffix}`;

    const appointment = await prisma.appointment.create({
      data: {
        referenceNumber,
        customerName: validated.name,
        email: validated.email,
        phone: validated.phone,
        organization: validated.organization || null,
        selectedService: validated.serviceType,
        appointmentDate: validated.preferredDate,
        appointmentTime: validated.preferredTimeSlot,
        message: validated.details,
        bookingStatus: 'PENDING'
      }
    });

    // Send notification to admin and client
    sendBookingNotifications({
      bookingRef: referenceNumber,
      name: validated.name,
      email: validated.email,
      phone: validated.phone,
      organization: validated.organization,
      serviceType: validated.serviceType,
      preferredDate: validated.preferredDate,
      preferredTimeSlot: validated.preferredTimeSlot,
      details: validated.details
    }).catch(err => console.error('[BookingEmailError]', err));

    res.status(201).json({
      success: true,
      data: appointment,
      message: `Appointment request submitted. Your reference code is ${referenceNumber}.`
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: err.errors });
    }
    next(err);
  }
}
