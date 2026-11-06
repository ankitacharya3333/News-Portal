import React, { useState, useEffect } from 'react';
import { ShieldCheck, Award, Users, BookOpen } from 'lucide-react';
import { newsService } from '../services/api';

export default function AboutPage() {
  const [journalists, setJournalists] = useState([]);

  useEffect(() => {
    newsService.getJournalists()
      .then(res => setJournalists(res.data.data || []))
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-12">
      {/* Editorial Header */}
      <div className="border-b-2 border-[#0B1B3D] pb-6 text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-[#B83232] block mb-1">
          Our Charter & Editorial Heritage
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-[#0B1B3D]">
          About The Nepal Chronicle
        </h1>
        <p className="font-nepali text-base text-[#475569] mt-2">
          सत्य, तथ्य र निष्पक्ष पत्रकारिताको लागि प्रतिबद्ध डिजिटल पत्रिका
        </p>
      </div>

      {/* Mission & Principles */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 border border-[#E2E8F0] rounded-xs shadow-xs space-y-3">
          <ShieldCheck className="w-8 h-8 text-[#0B1B3D]" />
          <h3 className="font-editorial text-lg font-bold text-[#0B1B3D]">Editorial Independence</h3>
          <p className="text-xs text-[#475569] leading-relaxed">
            Our newsroom operates strictly independent of political party organs, corporate lobbying interests, and advertising pressures. Editorial judgement is governed solely by public interest and truth.
          </p>
        </div>

        <div className="bg-white p-6 border border-[#E2E8F0] rounded-xs shadow-xs space-y-3">
          <BookOpen className="w-8 h-8 text-[#B83232]" />
          <h3 className="font-editorial text-lg font-bold text-[#0B1B3D]">Investigative Rigor</h3>
          <p className="text-xs text-[#475569] leading-relaxed">
            We prioritize deep investigations over click-driven sensationalism. All major investigative disclosures require multi-source corroboration, primary documents, and rigorous legal review.
          </p>
        </div>

        <div className="bg-white p-6 border border-[#E2E8F0] rounded-xs shadow-xs space-y-3">
          <Award className="w-8 h-8 text-[#C59B27]" />
          <h3 className="font-editorial text-lg font-bold text-[#0B1B3D]">National & Alpine Focus</h3>
          <p className="text-xs text-[#475569] leading-relaxed">
            From Singha Durbar policy debates to climate change in the upper Himalayan valleys, we report stories that shape the future and sovereignty of the Federal Democratic Republic of Nepal.
          </p>
        </div>
      </section>

      {/* Editorial Leadership & Journalists */}
      <section className="bg-[#F5F2EB] p-8 border border-[#E5DFD5] rounded-xs">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#78350F]">The Newsroom</span>
          <h2 className="font-editorial text-3xl font-bold text-[#0B1B3D] mt-1">Our Editors & Correspondents</h2>
          <div className="w-16 h-0.5 bg-[#B83232] mx-auto mt-2"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {journalists.map(j => (
            <div key={j.id} className="bg-white p-5 border border-[#E2E8F0] rounded-xs text-center space-y-3 shadow-xs">
              <img
                src={j.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                alt={j.name}
                className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-[#0B1B3D]"
              />
              <div>
                <h4 className="font-editorial text-base font-bold text-[#0B1B3D]">{j.name}</h4>
                <p className="text-xs text-[#B83232] font-semibold mt-0.5">{j.jobTitle || 'Correspondent'}</p>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed line-clamp-3">
                {j.bio || 'Covers key national developments and investigative reports for The Nepal Chronicle.'}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

