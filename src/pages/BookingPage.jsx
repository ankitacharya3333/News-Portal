import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Clock, CheckCircle2, AlertCircle, Building, ShieldCheck } from 'lucide-react';
import { formService } from '../services/api';

const bookingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(7, 'Please provide a valid phone contact'),
  organization: z.string().optional(),
  serviceType: z.enum(['ADVERTISING', 'EDITORIAL_MEETING', 'MEDIA_COVERAGE', 'EVENT_COVERAGE', 'BUSINESS_PARTNERSHIP']),
  preferredDate: z.string().min(1, 'Please select a preferred date'),
  preferredTimeSlot: z.string().min(1, 'Please choose a time slot'),
  details: z.string().min(10, 'Please describe your consultation agenda')
});

export default function BookingPage() {
  const [bookingResult, setBookingResult] = useState({ state: 'idle', message: '', bookingRef: null });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      serviceType: 'ADVERTISING',
      preferredTimeSlot: '11:00 AM - 12:00 PM'
    }
  });

  const onSubmit = async (data) => {
    try {
      setBookingResult({ state: 'loading', message: '', bookingRef: null });
      const res = await formService.bookAppointment(data);
      setBookingResult({
        state: 'success',
        message: 'Your consultation session has been scheduled in the reservation system. Both our newsroom coordinator and your inbox have received the reservation docket.',
        bookingRef: res.data.data?.bookingRef
      });
      reset();
    } catch (err) {
      setBookingResult({
        state: 'error',
        message: err.message || 'Booking conflict or reservation error. Please try a different slot.',
        bookingRef: null
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6">
      {/* Editorial Header */}
      <div className="border-b-2 border-[#0B1B3D] pb-6 mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-[#C59B27] block mb-1">
          Corporate & Editorial Calendar
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-[#0B1B3D]">
          Schedule a Consultation or Coverage Meeting
        </h1>
        <p className="text-sm text-[#475569] mt-2 max-w-2xl leading-relaxed">
          Coordinate official press meetings, commercial advertising consultations, corporate event coverage, or bilateral media partnerships with The Nepal Chronicle.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Form Container (7 cols) */}
        <div className="lg:col-span-7 bg-white p-8 border border-[#E2E8F0] rounded-xs shadow-xs">
          <h2 className="font-editorial text-2xl font-bold text-[#0B1B3D] mb-6">
            Reserve Date & Time
          </h2>

          {bookingResult.state === 'success' && (
            <div className="mb-6 p-5 bg-emerald-50 border-2 border-emerald-400 rounded-xs flex items-start gap-4 text-emerald-900 text-sm">
              <CheckCircle2 className="w-6 h-6 flex-shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <p className="font-bold text-base">Reservation Docket Generated</p>
                <p className="text-xs mt-1 leading-relaxed">{bookingResult.message}</p>
                {bookingResult.bookingRef && (
                  <div className="mt-3 p-2.5 bg-white border border-emerald-300 rounded font-mono text-xs font-bold text-emerald-800">
                    REFERENCE CODE: {bookingResult.bookingRef}
                  </div>
                )}
              </div>
            </div>
          )}

          {bookingResult.state === 'error' && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-300 rounded-xs flex items-start gap-3 text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
              <div>
                <p className="font-bold">Reservation Conflict</p>
                <p className="text-xs mt-1">{bookingResult.message}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0B1B3D] uppercase tracking-wider mb-1.5">
                  Client / Lead Name *
                </label>
                <input
                  type="text"
                  {...register('name')}
                  placeholder="e.g. Sujan Shrestha"
                  className="w-full text-xs p-2.5 bg-[#FBF9F5] border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0B1B3D]"
                />
                {errors.name && <p className="text-[11px] text-red-600 mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B1B3D] uppercase tracking-wider mb-1.5">
                  Official Email *
                </label>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="client@company.com"
                  className="w-full text-xs p-2.5 bg-[#FBF9F5] border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0B1B3D]"
                />
                {errors.email && <p className="text-[11px] text-red-600 mt-1">{errors.email.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0B1B3D] uppercase tracking-wider mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="text"
                  {...register('phone')}
                  placeholder="+977 98XXXXXXXX"
                  className="w-full text-xs p-2.5 bg-[#FBF9F5] border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0B1B3D]"
                />
                {errors.phone && <p className="text-[11px] text-red-600 mt-1">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B1B3D] uppercase tracking-wider mb-1.5">
                  Organization / Agency
                </label>
                <input
                  type="text"
                  {...register('organization')}
                  placeholder="Company, NGO, or Agency name"
                  className="w-full text-xs p-2.5 bg-[#FBF9F5] border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0B1B3D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0B1B3D] uppercase tracking-wider mb-1.5">
                Consultation Type *
              </label>
              <select
                {...register('serviceType')}
                className="w-full text-xs p-2.5 bg-[#FBF9F5] border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0B1B3D]"
              >
                <option value="ADVERTISING">Advertising & Digital Campaigns</option>
                <option value="EDITORIAL_MEETING">Editorial Briefing & Background Meeting</option>
                <option value="MEDIA_COVERAGE">Media Coverage & Press Enclave</option>
                <option value="EVENT_COVERAGE">Summit & On-Site Event Coverage</option>
                <option value="BUSINESS_PARTNERSHIP">Strategic Content Partnership</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0B1B3D] uppercase tracking-wider mb-1.5">
                  Preferred Date *
                </label>
                <input
                  type="date"
                  {...register('preferredDate')}
                  className="w-full text-xs p-2.5 bg-[#FBF9F5] border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0B1B3D]"
                />
                {errors.preferredDate && <p className="text-[11px] text-red-600 mt-1">{errors.preferredDate.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B1B3D] uppercase tracking-wider mb-1.5">
                  Available Time Slot *
                </label>
                <select
                  {...register('preferredTimeSlot')}
                  className="w-full text-xs p-2.5 bg-[#FBF9F5] border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0B1B3D]"
                >
                  <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM (Morning Session)</option>
                  <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM (Editorial Hour)</option>
                  <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM (Afternoon Session)</option>
                  <option value="03:30 PM - 04:30 PM">03:30 PM - 04:30 PM (Corporate Hour)</option>
                  <option value="05:00 PM - 06:00 PM">05:00 PM - 06:00 PM (Evening Briefing)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0B1B3D] uppercase tracking-wider mb-1.5">
                Meeting Agenda & Scope *
              </label>
              <textarea
                rows="4"
                {...register('details')}
                placeholder="Outline the campaign targets, conference dates, or editorial topics to discuss..."
                className="w-full text-xs p-3 bg-[#FBF9F5] border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0B1B3D]"
              ></textarea>
              {errors.details && <p className="text-[11px] text-red-600 mt-1">{errors.details.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3 bg-[#B83232] hover:bg-[#9E2A2B] text-white text-xs font-bold uppercase tracking-wider rounded flex items-center justify-center gap-2 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>{isSubmitting ? 'Confirming Availability...' : 'Confirm Appointment Reservation'}</span>
            </button>
          </form>
        </div>

        {/* Sidebar Info (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0B1B3D] text-white p-6 rounded-xs space-y-4">
            <h3 className="font-editorial text-xl font-bold text-[#C59B27]">
              Reservation Protocol
            </h3>
            <ul className="text-xs text-neutral-300 space-y-3 leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Automatic collision prevention guarantees that no two parties reserve the same slot simultaneously.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Our administrative editorial bureau receives immediate transmission of your reservation docket.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>You will receive an official confirmation docket and calendar invite at your submitted email address.</span>
              </li>
            </ul>
          </div>

          <div className="p-6 bg-[#F4EFE6] border border-[#D6CEBF] rounded-xs space-y-2">
            <h4 className="font-editorial text-base font-bold text-[#0B1B3D]">
              Physical or Virtual Options
            </h4>
            <p className="text-xs text-[#475569] leading-relaxed">
              Consultations can be conducted in person at our Babarmahal central bureau or via encrypted video link for overseas partners and out-of-valley commercial organizations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

