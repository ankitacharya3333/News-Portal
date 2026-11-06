import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { formService } from '../services/api';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  category: z.string().min(1, 'Please select an inquiry category'),
  message: z.string().min(10, 'Message must be at least 10 characters')
});

export default function ContactPage() {
  const [submissionState, setSubmissionState] = useState({ state: 'idle', message: '', inquiryId: null });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      category: 'Editorial Inquiry'
    }
  });

  const onSubmit = async (data) => {
    try {
      setSubmissionState({ state: 'loading', message: '', inquiryId: null });
      const res = await formService.submitInquiry(data);
      setSubmissionState({
        state: 'success',
        message: 'Your inquiry has been successfully transmitted to our editorial desk and an automatic email confirmation has been dispatched.',
        inquiryId: res.data.data?.id
      });
      reset();
    } catch (err) {
      setSubmissionState({
        state: 'error',
        message: err.message || 'Submission failed. Please check your network or try again.',
        inquiryId: null
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6">
      {/* Editorial Header */}
      <div className="border-b-2 border-[#0B1B3D] pb-6 mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-[#B83232] block mb-1">
          Editorial & Corporate Desk
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-[#0B1B3D]">
          Contact The Nepal Chronicle
        </h1>
        <p className="text-sm text-[#475569] mt-2 max-w-2xl leading-relaxed">
          Reach our newsroom editors, submit press releases, request corrections, or connect with our corporate media relations team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Contact Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-8 border border-[#E2E8F0] rounded-xs shadow-xs">
          <h2 className="font-editorial text-2xl font-bold text-[#0B1B3D] mb-6">
            Dispatch a Message
          </h2>

          {submissionState.state === 'success' && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-300 rounded-xs flex items-start gap-3 text-emerald-800 text-sm">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
              <div>
                <p className="font-bold">Transmission Confirmed</p>
                <p className="text-xs mt-1 leading-relaxed">{submissionState.message}</p>
                {submissionState.inquiryId && (
                  <p className="text-xs font-mono mt-1 text-emerald-700">Reference ID: #{submissionState.inquiryId.slice(0, 8).toUpperCase()}</p>
                )}
              </div>
            </div>
          )}

          {submissionState.state === 'error' && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-300 rounded-xs flex items-start gap-3 text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
              <div>
                <p className="font-bold">Transmission Error</p>
                <p className="text-xs mt-1">{submissionState.message}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0B1B3D] uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  {...register('name')}
                  placeholder="e.g. Bipin Sharma"
                  className="w-full text-xs p-2.5 bg-[#FBF9F5] border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0B1B3D]"
                />
                {errors.name && <p className="text-[11px] text-red-600 mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B1B3D] uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="name@organization.com"
                  className="w-full text-xs p-2.5 bg-[#FBF9F5] border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0B1B3D]"
                />
                {errors.email && <p className="text-[11px] text-red-600 mt-1">{errors.email.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0B1B3D] uppercase tracking-wider mb-1.5">
                  Phone (Optional)
                </label>
                <input
                  type="text"
                  {...register('phone')}
                  placeholder="+977 98XXXXXXXX"
                  className="w-full text-xs p-2.5 bg-[#FBF9F5] border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0B1B3D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B1B3D] uppercase tracking-wider mb-1.5">
                  Inquiry Department *
                </label>
                <select
                  {...register('category')}
                  className="w-full text-xs p-2.5 bg-[#FBF9F5] border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0B1B3D]"
                >
                  <option value="Editorial Inquiry">Editorial & Newsdesk</option>
                  <option value="Whistleblower Tip">Confidential News Tip</option>
                  <option value="Advertising & Commercial">Advertising & Sponsorship</option>
                  <option value="Event Coverage">Event Coverage Request</option>
                  <option value="Corrections & Retractions">Factual Correction</option>
                  <option value="General Support">General Inquiries</option>
                </select>
                {errors.category && <p className="text-[11px] text-red-600 mt-1">{errors.category.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0B1B3D] uppercase tracking-wider mb-1.5">
                Subject Headline *
              </label>
              <input
                type="text"
                {...register('subject')}
                placeholder="Brief summary of your inquiry"
                className="w-full text-xs p-2.5 bg-[#FBF9F5] border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0B1B3D]"
              />
              {errors.subject && <p className="text-[11px] text-red-600 mt-1">{errors.subject.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0B1B3D] uppercase tracking-wider mb-1.5">
                Detailed Message *
              </label>
              <textarea
                rows="5"
                {...register('message')}
                placeholder="Provide complete context, verified facts, or inquiry details..."
                className="w-full text-xs p-3 bg-[#FBF9F5] border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0B1B3D]"
              ></textarea>
              {errors.message && <p className="text-[11px] text-red-600 mt-1">{errors.message.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3 bg-[#0B1B3D] hover:bg-[#B83232] text-white text-xs font-bold uppercase tracking-wider rounded flex items-center justify-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Transmitting...' : 'Send Message to Editorial Desk'}</span>
            </button>
          </form>
        </div>

        {/* Newsroom Details & Bureau Locations (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#F5F2EB] p-6 border border-[#E5DFD5] rounded-xs space-y-4">
            <h3 className="font-editorial text-xl font-bold text-[#0B1B3D]">
              Kathmandu News Bureau
            </h3>
            <p className="text-xs text-[#475569] leading-relaxed">
              Our central newsroom operates 24/7 out of the Babarmahal media enclave, monitoring breaking developments across all seven provinces of Nepal.
            </p>

            <div className="space-y-3 pt-2 text-xs text-[#334155]">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#B83232] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#0B1B3D]">Newsroom & Headquarters:</strong>
                  Babarmahal Media Enclave, Ward 11, Kathmandu, Nepal
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#B83232] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#0B1B3D]">Direct Lines:</strong>
                  Editorial Desk: +977-1-4240001<br />
                  Advertising & Partnerships: +977-1-4240002
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#B83232] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#0B1B3D]">Direct Email Inboxes:</strong>
                  Newsdesk: editor@nepalchronicle.com<br />
                  Executive Bureau: admin@nepalchronicle.com
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border border-[#E2E8F0] rounded-xs space-y-2">
            <h4 className="font-editorial text-base font-bold text-[#0B1B3D]">
              Whistleblower Protection Policy
            </h4>
            <p className="text-xs text-[#64748B] leading-relaxed">
              We uphold the international standards of journalist-source privilege. Sensitive whistleblower leaks may also be dispatched via encrypted PGP communication to our investigative desk.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

