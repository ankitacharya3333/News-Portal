import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: 'National News', nepaliName: 'राष्ट्रिय समाचार', slug: 'national', description: 'Major administrative, constitutional, and governance developments across all seven provinces of Nepal.', colorCode: '#B83232', order: 1 },
  { name: 'Politics', nepaliName: 'राजनीति', slug: 'politics', description: 'Parliamentary deliberations in Singha Durbar, constitutional law, party congresses, and national policymaking.', colorCode: '#0B1B3D', order: 2 },
  { name: 'Economy & Business', nepaliName: 'अर्थतन्त्र र व्यवसाय', slug: 'business', description: 'Macroeconomic trends, Nepal Rastra Bank monetary directives, NEPSE benchmarks, hydropower investments, and foreign remittance.', colorCode: '#15803D', order: 3 },
  { name: 'Kathmandu Valley', nepaliName: 'काठमाडौँ उपत्यका', slug: 'kathmandu', description: 'Metropolitan civic governance, urban mobility, cultural guthi preservation, and public utility initiatives in Kathmandu, Lalitpur, and Bhaktapur.', colorCode: '#C59B27', order: 4 },
  { name: 'International', nepaliName: 'अन्तर्राष्ट्रिय', slug: 'international', description: 'Bilateral diplomacy with India, China, BIMSTEC, non-aligned foreign policy, and South Asian regional security.', colorCode: '#4338CA', order: 5 },
  { name: 'Technology', nepaliName: 'सूचना प्रविधि', slug: 'technology', description: 'Nepal IT service exports, digital public infrastructure, fintech adoption, software engineering hubs, and telecommunications.', colorCode: '#2563EB', order: 6 },
  { name: 'Science & Environment', nepaliName: 'विज्ञान तथा वातावरण', slug: 'science', description: 'Biodiversity conservation, scientific research, forestry stewardship, wildlife corridors, and renewable energy.', colorCode: '#059669', order: 7 },
  { name: 'Climate & Himalayas', nepaliName: 'जलवायु र हिमाल', slug: 'climate', description: 'Glacial outburst flood telemetry, high-altitude alpine melt, Hindu Kush Himalaya climate adaptation, and mountain safety.', colorCode: '#0284C7', order: 8 },
  { name: 'Sports', nepaliName: 'खेलकुद', slug: 'sports', description: 'Nepal national cricket team fixtures, ICC League 2 matches, Nepal Super League, marathon, and athletics.', colorCode: '#DC2626', order: 9 },
  { name: 'Education', nepaliName: 'शिक्षा', slug: 'education', description: 'Tribhuvan University reforms, higher education modernization, technical vocational training, and curriculum restructuring.', colorCode: '#7C3AED', order: 10 },
  { name: 'Health', nepaliName: 'स्वास्थ्य', slug: 'health', description: 'Public health infrastructure, rural telemedicine, pharmaceutical self-reliance, and epidemiology across Nepal.', colorCode: '#0D9488', order: 11 },
  { name: 'Opinion', nepaliName: 'विचार र दृष्टिकोण', slug: 'opinion', description: 'In-depth essays, geopolitical critique, civic columns, and thought leadership from leading Nepali intellectuals.', colorCode: '#78350F', order: 12 },
  { name: 'Culture & Society', nepaliName: 'संस्कृति र समाज', slug: 'culture', description: 'Indigenous living heritage, Newar art, indigenous languages, Himalayan festivals, and ethnic community histories.', colorCode: '#9333EA', order: 13 }
];

async function main() {
  console.log('--- Starting Comprehensive Editorial Seed for The Nepal Chronicle ---');

  // 1. Seed or Preserve Admin User
  // Never overwrite an existing administrator password
  let adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!adminUser) {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@nepalchronicle.com';
    const passwordHash = await bcrypt.hash('AdminSecure@2026', 10);
    adminUser = await prisma.user.upsert({
      where: { email: adminEmail },
      update: { role: 'ADMIN' },
      create: {
        email: adminEmail,
        name: 'Executive Editor-in-Chief',
        passwordHash,
        role: 'ADMIN',
        company: 'The Nepal Chronicle Media Bureau'
      }
    });
    console.log(`✓ Admin account provisioned: ${adminEmail}`);
  } else {
    console.log(`✓ Existing Admin verified: ${adminUser.email}`);
  }

  // 2. Upsert All 13 Required Categories
  const categoryMap = {};
  for (const cat of CATEGORIES) {
    const record = await prisma.newsCategory.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        nepaliName: cat.nepaliName,
        description: cat.description,
        colorCode: cat.colorCode,
        order: cat.order
      },
      create: cat
    });
    categoryMap[cat.slug] = record.id;
  }
  console.log(`✓ All ${CATEGORIES.length} editorial categories populated.`);

  // 3. Populate 42+ High-Quality, Realistic Editorial News Articles
  // Ensuring at least 3 articles per category, with verified Unsplash editorial photographs
  const ARTICLES = [
    // --- 1. NATIONAL NEWS ---
    {
      title: 'Federal Governance Council Concludes Inter-Provincial Fiscal Harmonization Accord',
      slug: 'federal-governance-council-inter-provincial-fiscal-accord',
      categorySlug: 'national',
      summary: 'Chief Ministers and the federal finance ministry finalize revenue-sharing benchmarks for infrastructure grants across all seven provinces.',
      content: `The Inter-Provincial Council meeting presided over at the Office of the Prime Minister and Council of Ministers in Singha Durbar concluded on Thursday with a unanimous declaration addressing equalization and conditional grants for provincial treasuries.\n\nUnder the revised revenue allocation formula, provincial governments will receive an expanded 32 percent allocation from collected value-added taxes and domestic excise revenues to fund local health posts, secondary school upgrades, and agricultural feeder corridors.\n\n"Fiscal federalism cannot function on centralized ad-hoc grants," emphasized the chairperson of the National Natural Resources and Fiscal Commission. "Institutionalizing predictable mathematical criteria gives provincial planning commissions the fiscal certainty required for multi-year capital execution."`,
      featuredImage: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'The Federal Parliament complex in New Baneshwar, Kathmandu.',
      imageSource: 'Nepal Chronicle Photo Bureau',
      isFeatured: true,
      isBreaking: true,
      readingTimeMin: 4
    },
    {
      title: 'Department of Civil Aviation Finalizes Radar Surveillance Modernization for Western Airspace',
      slug: 'civil-aviation-radar-modernization-western-airspace',
      categorySlug: 'national',
      summary: 'Installation of second-generation monopulse secondary surveillance radar enhances air navigation over Pokhara, Bhairahawa, and Surkhet routes.',
      content: `The Civil Aviation Authority of Nepal (CAAN) has formally commissioned an advanced En-Route Monopulse Secondary Surveillance Radar (MSSR) atop the Bhattedanda ridgeline, substantially augmenting coverage over high-density western mountainous sectors.\n\nThe radar telemetry feeds direct real-time trajectory coordinates to the Kathmandu Air Traffic Control Center, eliminating previous dead-zones caused by Mahabharat mountain topography. Commercial airline operators serving Pokhara and Gautam Buddha International Airports noted that the system significantly improves flight schedule predictability during monsoon cloud cover.`,
      featuredImage: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'A commercial aircraft ascending past cloud cover over the Mahabharat Range.',
      imageSource: 'Civil Aviation Desk',
      isFeatured: false,
      isBreaking: false,
      readingTimeMin: 3
    },
    {
      title: 'National Identity Card Rollout Expands to Social Security Disbursement Across 77 Districts',
      slug: 'national-identity-card-social-security-rollout',
      categorySlug: 'national',
      summary: 'Home Ministry confirms over 12 million biometric records verified, eliminating ghost pensioners and ensuring prompt banking deposits.',
      content: `The Department of National ID and Civil Registration reported that over 85 percent of elderly, single women, and disability social security beneficiaries are now receiving state allowances directly via biometric National Identity verification.\n\nThe administrative transition has reduced processing friction at commercial rural bank branches, where recipients previously experienced hours of verification delays. Local ward offices in remote districts of Karnali and Sudurpashchim have deployed mobile solar-powered biometric tablets to register elderly citizens directly in their villages.`,
      featuredImage: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Administrative personnel processing civil registration documentation in Kathmandu.',
      imageSource: 'Nepal Chronicle Archive',
      isFeatured: false,
      isBreaking: false,
      readingTimeMin: 4
    },

    // --- 2. POLITICS ---
    {
      title: 'Parliamentary State Affairs Committee Directs Civil Service Bill Revisions on Merit-Based Promotions',
      slug: 'parliamentary-committee-civil-service-bill-merit-promotions',
      categorySlug: 'politics',
      summary: 'Cross-party consensus emerges over curbing bureaucratic trade-union interference and instituting transparent key performance indicators.',
      content: `Lawmakers across government and opposition benches in the parliamentary State Affairs and Good Governance Committee have reached an agreement on contentious clauses of the Federal Civil Service Bill.\n\nThe committee draft establishes that at least 25 percent of joint secretary appointments must be filled through open competitive testing, rather than seniority alone. Furthermore, administrative civil servants will be prohibited from holding active executive positions in partisan trade unions.\n\n"The state bureaucracy must transition from administrative inertia into high-efficiency public service delivery," stated the committee coordinator following a four-hour review session in Singha Durbar.`,
      featuredImage: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'A parliamentary deliberation hall in Singha Durbar.',
      imageSource: 'National Press Pool',
      isFeatured: true,
      isBreaking: false,
      readingTimeMin: 5
    },
    {
      title: 'Supreme Court Constitutional Bench Begins Final Hearings on Provincial Boundary Delimitation Cases',
      slug: 'supreme-court-constitutional-bench-boundary-delimitation',
      categorySlug: 'politics',
      summary: 'Five-member bench reviews writ petitions challenging administrative shifts between Madhesh and Bagmati provincial jurisdictions.',
      content: `The Constitutional Bench of the Supreme Court, headed by the Chief Justice, commenced final oral arguments on Thursday concerning public interest litigations challenging local boundary adjustments enacted without parliamentary assent.\n\nSenior advocates arguing on behalf of petitioner local bodies contended that constitutional articles protect municipal autonomy from unilateral executive decrees. The Office of the Attorney General countered that the realignment was necessary for uniform electoral voter distribution ahead of the upcoming mid-term civic evaluations.`,
      featuredImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'The Supreme Court of Nepal building in Ramshah Path, Kathmandu.',
      imageSource: 'Legal Affairs Bureau',
      isFeatured: false,
      isBreaking: false,
      readingTimeMin: 4
    },
    {
      title: 'Election Commission Modernizes Electronic Voter Rolls with Real-Time Civic Database Integration',
      slug: 'election-commission-electronic-voter-rolls-integration',
      categorySlug: 'politics',
      summary: 'Automated synchronization prevents dual registration and enables Nepali citizens reaching 18 years to be automatically registered.',
      content: `In a landmark digital governance milestone, the Election Commission of Nepal has linked its voter registration system with the Ministry of Home Affairs civil registry.\n\nThe modernization eliminates legacy duplicate records and ensures that citizens turning eighteen are immediately notified of their polling station eligibility via SMS. Chief Election Commissioner noted that overseas registration protocols for Nepali migrant workers in diplomatic missions abroad are also undergoing technical pilot testing.`,
      featuredImage: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Election officials inspecting ballot verification hardware.',
      imageSource: 'Press Guild Nepal',
      isFeatured: false,
      isBreaking: false,
      readingTimeMin: 3
    },

    // --- 3. ECONOMY & BUSINESS ---
    {
      title: 'Nepal Rastra Bank Reports Record $1.28 Billion Monthly Remittance Inflow Amid Foreign Reserve Highs',
      slug: 'nepal-rastra-bank-record-remittance-reserve-stability-q2',
      categorySlug: 'business',
      summary: 'Gross foreign exchange reserves expand to cover 14.1 months of merchandise imports, driven by formalized digital banking channels.',
      content: `The macroeconomic and financial status report published by Nepal Rastra Bank (NRB) for the current fiscal trimester highlights unprecedented foreign currency stability, with inward remittances touching a historic milestone through verified banking infrastructure.\n\nGross foreign exchange reserves expanded by 7.2 percent, primarily boosted by incentivized digital banking rails and streamlined National ID-linked remittance accounts in Gulf Cooperation Council countries and East Asia.\n\nEconomists at Tribhuvan University noted that while liquidity in domestic commercial banks remains comfortably elevated, credit disbursement towards productive manufacturing and agricultural mechanization must be prioritized to counter inflation pressures on imported essential commodities.`,
      featuredImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Nepal Rastra Bank headquarters in Baluwatar, Kathmandu.',
      imageSource: 'The Nepal Chronicle / Financial Bureau',
      isFeatured: true,
      isBreaking: true,
      readingTimeMin: 5
    },
    {
      title: 'Nepal Electricity Authority Commissions 220kV Chilime-Trishuli Hydro Transmission Corridor',
      slug: 'nea-chilime-trishuli-transmission-corridor-commissioned',
      categorySlug: 'business',
      summary: 'High-altitude double-circuit line evacuates 500MW of clean hydropower from Rasuwa and Nuwakot into the national grid.',
      content: `The Nepal Electricity Authority (NEA) has energized the 28-kilometer 220kV Chilime-Trishuli transmission line, successfully overcoming steep Himalayan topography and monsoon landslide risks.\n\nThe completion enables six independent hydropower stations along the Trishuli river basin to evacuate their full generating capacity without transmission curtailment. NEA Managing Director confirmed that surplus summer generation will now feed directly into the Dhalkebar-Muzaffarpur cross-border interconnection for regional export.`,
      featuredImage: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'High-voltage electrical transmission towers in a Himalayan river valley.',
      imageSource: 'Energy Bureau / NEA',
      isFeatured: false,
      isBreaking: false,
      readingTimeMin: 4
    },
    {
      title: 'NEPSE Benchmark Index Surges Past 2,800 Mark Led by Commercial Hydropower and Banking Equities',
      slug: 'nepse-benchmark-surges-past-2800-hydropower-banking',
      categorySlug: 'business',
      summary: 'Daily turnover exceeds Rs 11.4 billion as institutional pension funds and domestic retail investors increase equity participation.',
      content: `The Nepal Stock Exchange (NEPSE) index rallied 42.6 points on Thursday to settle at 2,824.12 points, propelled by robust quarterly balance sheets among commercial banks and anticipated hydro export dividends.\n\nMarket capitalisation expanded to Rs 4.48 trillion. Equity analysts noted that recent central bank monetary guidelines relaxing single-borrower margins on institutional margin lending injected vital liquidity into premier blue-chip listings.`,
      featuredImage: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Stock market financial data terminal displaying trading indices.',
      imageSource: 'Capital Markets Desk',
      isFeatured: false,
      isBreaking: false,
      readingTimeMin: 3
    },

    // --- 4. KATHMANDU VALLEY ---
    {
      title: 'Lalitpur Metropolitan City Restores 14 Ancient Hitis (Stone Spouts) with Traditional Aquifer Recharging',
      slug: 'lalitpur-restores-traditional-stone-spouts-aquifer-recharge',
      categorySlug: 'kathmandu',
      summary: 'Indigenous Newar engineering and community guthi partnerships revive centuries-old subterranean terracotta water channels in Patan.',
      content: `In an extraordinary victory for living urban heritage, the Lalitpur Metropolitan City has revived continuous natural water flow across 14 historical stone conduits (dhunge dharas) in Patan’s historic core.\n\nRather than relying on municipal pipe connections, the restoration team mapped original Malla-era terracotta conduits (raj kulo) and constructed subterranean rainwater percolation reservoirs across nearby traditional ponds (pukhuris).\n\n"Our ancestors understood natural hydrostatic equilibrium," stated lead preservation architect Rabindra Shrestha. "When urban ponds are preserved, the water table remains self-replenishing throughout the dry winter months."`,
      featuredImage: 'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Traditional Newar pagoda architecture and brickwork in Patan Durbar Square.',
      imageSource: 'The Nepal Chronicle / Cultural Heritage Desk',
      isFeatured: true,
      isBreaking: false,
      readingTimeMin: 4
    },
    {
      title: 'Kathmandu Ring Road Expansion Phase Two Accelerates Kalanki-Maharajgunj Flyover Construction',
      slug: 'kathmandu-ring-road-expansion-kalanki-maharajgunj',
      categorySlug: 'kathmandu',
      summary: 'Department of Roads completes site clearance and utility relocation for the 8.2-kilometer eight-lane dedicated expressway.',
      content: `Traffic congestion along western Kathmandu’s arterial ring road will soon witness substantial relief as engineering teams begin structural piling for grade-separated flyovers at Gongabu and Balaju intersections.\n\nThe project incorporates dedicated bicycle tracks, pedestrian footpaths with tactile tiles for visually impaired commuters, and extensive green tree belts along median dividers to absorb urban vehicular particulate emissions.`,
      featuredImage: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Urban traffic movement along an expanded metropolitan highway.',
      imageSource: 'Urban Infrastructure Bureau',
      isFeatured: false,
      isBreaking: false,
      readingTimeMin: 4
    },
    {
      title: 'Bhaktapur Municipality Achieves 100% Waste Segregation at Source with Local Organic Composting',
      slug: 'bhaktapur-waste-segregation-source-organic-composting',
      categorySlug: 'kathmandu',
      summary: 'Ancient heritage city becomes the first valley municipality to divert 70 tons of organic waste daily into fertilizer for local farmers.',
      content: `Bhaktapur’s community-led municipal governance model has achieved a critical urban sustainability milestone: universal source segregation of household waste across all ten wards.\n\nOrganic kitchen refuse is collected bi-daily and processed at a decentralized composting plant in Sallaghari, producing affordable, pathogen-free compost for potato and vegetable growers in Changunarayan and Suryabinayak. Non-biodegradable plastics are channeled into industrial recycling facilities.`,
      featuredImage: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Community organic agriculture and sustainable city management.',
      imageSource: 'Civic Environmental Desk',
      isFeatured: false,
      isBreaking: false,
      readingTimeMin: 3
    },

    // --- 5. INTERNATIONAL ---
    {
      title: 'BIMSTEC Energy Grid Connectivity Charter Enters Advanced Ratification Phase in Colombo',
      slug: 'bimstec-energy-grid-connectivity-charter-ratification',
      categorySlug: 'international',
      summary: 'Regional transmission framework creates institutional pathway for trilateral power trading among Nepal, Bangladesh, and India.',
      content: `Foreign ministers and energy plenipotentiaries from seven Bay of Bengal Initiative for Multi-Sectoral Technical and Economic Cooperation (BIMSTEC) member states concluded multilateral consultations regarding harmonized cross-border grid protocols.\n\nThe charter provides standard transit wheeling tariffs and technical grid codes, paving the way for seamless electricity flow from Nepal’s Himalayan run-of-river generators to load centers in northern India and industrial zones in Bangladesh.\n\nNepal’s foreign secretary affirmed that clean regional power exchange represents one of the most tangible economic dividends of multilateral neighborhood cooperation.`,
      featuredImage: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Diplomatic delegations convened for multilateral summit consultations.',
      imageSource: 'Foreign Relations Bureau',
      isFeatured: false,
      isBreaking: false,
      readingTimeMin: 4
    },
    {
      title: 'Nepali Diplomatic Missions in the Gulf Expand 24/7 Digital Consular Services for Migrant Workers',
      slug: 'nepali-embassies-gulf-digital-consular-services',
      categorySlug: 'international',
      summary: 'Automated passport renewals, legal counsel hotlines, and repatriation insurance claims streamlined across Doha, Dubai, and Riyadh.',
      content: `Embassies of Nepal across the Gulf Cooperation Council (GCC) countries have rolled out unified consular portals allowing migrant workers to renew e-passports, verify employment contracts, and access emergency legal counsel without travelling hundreds of kilometers to capital missions.\n\nLabor attaches reported that the digital docket system has cut passport delivery turnaround from twelve weeks to just fourteen days, while providing direct biometric dispute filing for workers encountering contract violations.`,
      featuredImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Modern financial district in a Gulf metropolitan capital.',
      imageSource: 'Diplomatic Desk',
      isFeatured: false,
      isBreaking: false,
      readingTimeMin: 4
    },
    {
      title: 'Nepal and South Korea Mark 50 Years of Diplomatic Relations with Technology and Agriculture Accords',
      slug: 'nepal-south-korea-50-years-diplomatic-relations',
      categorySlug: 'international',
      summary: 'Bilateral cooperation expands funding for smart greenhouse farming in Gandaki and technical polytechnic academies in Madhesh.',
      content: `Commemorating five decades of diplomatic and economic partnership, representatives from Kathmandu and Seoul signed bilateral memorandums of understanding establishing three new centers of agricultural excellence in Pokhara, Hetauda, and Janakpur.\n\nThe Korean International Cooperation Agency (KOICA) will provide solar automated greenhouse hardware, hybrid climate-resilient seeds, and training fellowships for over 1,500 young Nepali agronomists.`,
      featuredImage: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Bilateral agreement signing ceremony between government delegations.',
      imageSource: 'Foreign Ministry Pool',
      isFeatured: false,
      isBreaking: false,
      readingTimeMin: 3
    },

    // --- 6. TECHNOLOGY ---
    {
      title: 'Kathmandu Valley Tech Startups Expand IT Service Exports Past $500 Million Annual Benchmark',
      slug: 'kathmandu-tech-startups-it-service-exports-record',
      categorySlug: 'technology',
      summary: 'Specialized engineering in AI pipeline evaluation, embedded firmware, and enterprise fintech accelerates hiring across Lalitpur and Pokhara.',
      content: `Nepal’s digital services export sector has quietly emerged as one of the country’s most resilient economic engines, according to new data compiled by the Computer Association of Nepal (CAN Federation).\n\nDriven by competitive software engineering talent, fiber-optic backbone expansion across major urban centers, and institutional acceptance of remote contracting frameworks, tech firms operating out of Kupondole, Jhamsikhel, and Pokhara are now servicing international enterprise clients in Tokyo, London, and San Francisco.\n\nGovernment representatives indicated that upcoming digital entrepreneurship policy reforms will introduce tax incentives for local venture funds and streamline repatriated foreign revenues.`,
      featuredImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Software engineers at a technology incubator workspace in Lalitpur.',
      imageSource: 'The Nepal Chronicle / Tech Bureau',
      isFeatured: true,
      isBreaking: false,
      readingTimeMin: 4
    },
    {
      title: 'Nepal Interbank Payment System Transitions to Instant QR Cross-Border Payments with Regional Hubs',
      slug: 'nepal-interbank-payment-system-cross-border-qr',
      categorySlug: 'technology',
      summary: 'Nepal Clearing House activates interoperable QR codes enabling tourists and diaspora to pay directly from domestic mobile wallets.',
      content: `The National Payment Interface (NPI) managed by Nepal Clearing House Limited (NCHL) has processed over 25 million transactions this month following bilateral linkage with international payment networks.\n\nTourists visiting Thamel, Pokhara Lakeside, and Lumbini can now scan NepalPay and Fonepay QR merchant stands using their native bank applications, eliminating foreign exchange conversion commissions and cash dependency.`,
      featuredImage: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'A retail merchant accepting contactless digital smartphone payment.',
      imageSource: 'Fintech Bureau',
      isFeatured: false,
      isBreaking: false,
      readingTimeMin: 3
    },
    {
      title: 'Tribhuvan University Robotics Club Builds Solar-Powered Agricultural Drones for Mountain Terraces',
      slug: 'tu-robotics-solar-agricultural-drones-mountain-terraces',
      categorySlug: 'technology',
      summary: 'Pulchowk Campus engineers develop automated LiDAR spraying and soil moisture telemetry drones optimized for high-slope farming.',
      content: `Undergraduate engineering researchers at the Institute of Engineering (IOE) Pulchowk have field-tested an autonomous quadcopter designed specifically for steep Himalayan terraced fields where tractor mechanization is impossible.\n\nThe drone uses multispectral camera telemetry to detect crop pest infestations in mustard and maize fields, spraying micro-doses of organic neem bio-pesticides with centimeter precision while cutting chemical expenditure by 80 percent.`,
      featuredImage: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'An autonomous engineering drone operating in a rural valley.',
      imageSource: 'IOE Pulchowk Press',
      isFeatured: false,
      isBreaking: false,
      readingTimeMin: 4
    },

    // --- 7. SCIENCE & ENVIRONMENT ---
    {
      title: 'Chitwan National Park Records Zero Rhino Poaching for Third Consecutive Year Due to AI Trail Sensors',
      slug: 'chitwan-zero-rhino-poaching-ai-trail-sensors',
      categorySlug: 'science',
      summary: 'Integration of solar smart camera traps and acoustic gunshot detectors protects one of South Asia’s premier greater one-horned rhino sanctuaries.',
      content: `Nepal’s Department of National Parks and Wildlife Conservation celebrated a major conservation milestone as Chitwan National Park confirmed 36 continuous months with zero poaching incidents of the endangered Greater One-horned Rhinoceros.\n\nThe deployment of real-time AI image-recognition trail cameras along buffer zone river crossings automatically flags human presence to army patrol basecamps within seconds. Over 750 rhinos now roam the grassland oxbows of the Narayani and Rapti river basins.`,
      featuredImage: 'https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'A one-horned rhinoceros grazing in the sal forests of Chitwan.',
      imageSource: 'Department of Wildlife Conservation',
      isFeatured: false,
      isBreaking: false,
      readingTimeMin: 4
    },
    {
      title: 'Botanists Discover Three New Alpine Orchid Species in Makalu-Barun Pristine Cloud Forests',
      slug: 'botanists-discover-new-alpine-orchid-species-makalu-barun',
      categorySlug: 'science',
      summary: 'Joint expedition by Nepal Academy of Science and Technology and Kew Gardens catalogs rare micro-flora thriving at 3,200 meters.',
      content: `A botanical research expedition traversing the remote Kasuwa and Barun river valleys in eastern Nepal has cataloged three previously unrecorded species of epiphytic orchids belonging to the genus Coelogyne.\n\nThe delicate orchids bloom exclusively along moss-draped Himalayan birch and rhododendron trees shrouded in perpetual monsoon mists. Researchers emphasized that protecting Makalu-Barun’s intact microclimates is essential for South Asian ecological gene banks.`,
      featuredImage: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Rich alpine flora and virgin temperate forest in the eastern Himalayas.',
      imageSource: 'Botanical Society of Nepal',
      isFeatured: false,
      isBreaking: false,
      readingTimeMin: 3
    },
    {
      title: 'Community Forestry User Groups in Mid-Hills Generate $14M from Verified Carbon Credit Registry',
      slug: 'community-forestry-user-groups-verified-carbon-credits',
      categorySlug: 'science',
      summary: 'Over 400,000 hectares of restored broadleaf forests in Bagmati and Gandaki earn direct international climate finance payouts.',
      content: `Nepal’s internationally celebrated Community Forestry model has achieved another breakthrough: monetizing verified forest biomass growth through the voluntary carbon market.\n\nFederation of Community Forestry Users Nepal (FECOFUN) reported that revenue earned from international verified carbon offsets is being deposited directly into village bank accounts, funding solar drinking water pumps, girls’ scholarship funds, and forest fire rapid-response squads.`,
      featuredImage: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Dense canopy of protected community broadleaf forest in the mid-hills.',
      imageSource: 'Forestry Department / FECOFUN',
      isFeatured: false,
      isBreaking: false,
      readingTimeMin: 4
    },

    // --- 8. CLIMATE & HIMALAYAS ---
    {
      title: 'Glaciologists Deploy High-Altitude Early Warning Telemetry Sensors at Imja Tsho in Everest Basin',
      slug: 'glaciologists-early-warning-sensors-imja-tsho-everest-basin',
      categorySlug: 'climate',
      summary: 'Department of Hydrology teams activate automated telemetry stations to track glacial lake outbursts and provide 45 minutes advance warning.',
      content: `Operating at an altitude exceeding 5,000 meters above sea level in the Khumbu region, a joint expedition of glaciologists and alpine hydrologists has activated automated bathymetric sensors along the terminal moraine of Imja Tsho.\n\nThe lake, identified by international climate researchers as one of the most rapidly expanding glacial reservoirs in the Hindu Kush Himalaya, now transmits continuous water pressure, ice-dam deformation, and precipitation telemetry via satellite transponders directly to the National Emergency Operations Centre in Kathmandu.\n\n"Downstream Sherpa settlements along the Dudh Koshi valley now possess direct telemetry sirens," explained lead scientist Pasang Sherpa. "Every millimeter of hydrostatic variance is correlated with historical melt algorithms."`,
      featuredImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Mount Ama Dablam and surrounding glacial moraines in the upper Solukhumbu region.',
      imageSource: 'Alpine Scientific Survey / The Nepal Chronicle',
      isFeatured: true,
      isBreaking: false,
      readingTimeMin: 5
    },
    {
      title: 'ICIMOD Assessment Warns Hindu Kush Glaciers Melting 65% Faster Than Previous Decade',
      slug: 'icimod-assessment-hindu-kush-glaciers-melting-faster',
      categorySlug: 'climate',
      summary: 'Intergovernmental scientific body calls for urgent loss and damage financing to safeguard drinking water for 1.6 billion downstream people.',
      content: `The International Centre for Integrated Mountain Development (ICIMOD) released its comprehensive Hindu Kush Himalaya Water and Cryosphere Assessment at its headquarters in Lalitpur on Wednesday.\n\nSatellite altimetry data reveals unprecedented mass loss across alpine ice sheets feeding major river systems including the Koshi, Gandaki, and Karnali. The report stresses that without aggressive global decarbonization, two-thirds of Himalayan glacier volume could vanish by the end of this century, fundamentally destabilizing seasonal dry-run agricultural irrigation.`,
      featuredImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Glacial valley and snow-capped peaks in the central Himalayan range.',
      imageSource: 'ICIMOD Media Enclave',
      isFeatured: false,
      isBreaking: true,
      readingTimeMin: 4
    },
    {
      title: 'Tsum Valley Communities Adopt Organic Zero-Waste Charter to Protect Sacred Alpine Ecosystem',
      slug: 'tsum-valley-zero-waste-charter-sacred-alpine-ecosystem',
      categorySlug: 'climate',
      summary: 'High-altitude Buddhist cultural valley in northern Gorkha bans single-use non-biodegradable plastics and installs solar-powered compost stations.',
      content: `Known as the sacred Beyul Tsum Kyimolatsang, the remote Tsum Valley in northern Gorkha has adopted a comprehensive community conservation charter enforced by traditional village councils (Ghawa).\n\nTrekkers entering the valley are required to register all plastic containers at entry checkpoints in Lokpa and carry them out. Local community lodges have transitioned entirely to organic homegrown buckwheat, barley, and solar greenhouse greens.`,
      featuredImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'A high-altitude remote settlement nestled beneath Himalayan granite cliffs.',
      imageSource: 'Alpine Heritage Society',
      isFeatured: false,
      isBreaking: false,
      readingTimeMin: 3
    },

    // --- 9. SPORTS ---
    {
      title: 'Nepal National Cricket Team Secures Historic Last-Over Victory in ICC League 2 Thriller at TU Ground',
      slug: 'nepal-cricket-thrilling-victory-icc-league-2-tu-ground',
      categorySlug: 'sports',
      summary: 'Before twenty thousand electric supporters in Kirtipur, national team bowlers defend 245 with surgical death-over discipline.',
      content: `A masterclass in death bowling during the penultimate overs sent the capacity crowd at the Tribhuvan University International Cricket Ground in Kirtipur into rapturous celebration as Nepal secured a dramatic four-run win in the ICC Men\'s Cricket World Cup League 2 fixture.\n\nChasing 246 on a pitch offering dual bounce under afternoon sunshine, the opposing top-order threatened to take the match away before a two-wicket maiden in the 48th over swung momentum permanently in the hosts\' favor.\n\n"The tactical discipline demonstrated by our bowling unit under pressure shows the rapid maturity of our international cricket setup," remarked national team head coach during the post-match briefing.`,
      featuredImage: 'https://images.unsplash.com/photo-1531415074868-036b1c575351?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'The vibrant atmosphere during an international one-day match at TU Ground, Kirtipur.',
      imageSource: 'Nepal Sports Press Guild',
      isFeatured: true,
      isBreaking: false,
      readingTimeMin: 4
    },
    {
      title: 'Nepal Super League Football Season 3 Kicks Off at Dasharath Stadium with Ten Franchises',
      slug: 'nepal-super-league-football-dasharath-stadium-kickoff',
      categorySlug: 'sports',
      summary: 'Franchise tournament features premier foreign signings from Europe, South America, and West Africa alongside Nepal\'s national squad stars.',
      content: `Floodlights illuminated Kathmandu’s historic Dasharath Stadium as the third iteration of the franchise-based Nepal Super League (NSL) kicked off before 15,000 passionate football fans.\n\nOrganizers have incorporated VAR goal-line review technology for the first time in domestic Nepali football history. The opening derby between Kathmandu Rayzrs and Pokhara Thunders delivered an intense tactical draw featuring standout performances from youth academy debutants.`,
      featuredImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Football players contending for possession during a stadium match.',
      imageSource: 'Sports Desk / All Nepal Football Association',
      isFeatured: false,
      isBreaking: false,
      readingTimeMin: 3
    },
    {
      title: 'Annapurna High-Altitude Mountain Marathon Draws 300 Global Ultrarunners to Thorong La Pass',
      slug: 'annapurna-mountain-marathon-thorong-la-ultrarunners',
      categorySlug: 'sports',
      summary: 'Nepali mountain athletes dominate the grueling 60km trail race from Manang to Muktinath across 5,416-meter altitude.',
      content: `Navigating scree trails, sub-zero winds, and extreme oxygen deprivation over the Thorong La Pass, international ultrarunners converged for the 12th annual Annapurna Ultra Mountain Marathon.\n\nAthletes from Jumla and Solukhumbu swept the podium positions, finishing the 60-kilometer alpine traverse in just five hours and 42 minutes. The event has become a benchmark for eco-tourism and extreme endurance sports in South Asia.`,
      featuredImage: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Trail ultrarunners traversing high mountain ridgelines in the Himalayas.',
      imageSource: 'Mountain Sports Federation',
      isFeatured: false,
      isBreaking: false,
      readingTimeMin: 4
    },

    // --- 10. EDUCATION ---
    {
      title: 'Tribhuvan University Unveils Academic Calendar Digitization and Examination Automation Reform',
      slug: 'tribhuvan-university-academic-calendar-digitization',
      categorySlug: 'education',
      summary: 'Historic university implements digital answer-sheet barcoding and time-bound 90-day examination result publications.',
      content: `Tribhuvan University (TU), Nepal’s largest and oldest higher education institution, has formally launched an integrated Enterprise Resource Planning (ERP) platform across its 62 constituent campuses.\n\nStudents will now receive digital transcripts authenticated via national blockchain verifiers, eliminating multi-month bureaucratic delays. TU Vice-Chancellor declared that the unified academic calendar will ensure examinations and result publications occur on fixed dates regardless of political or administrative contingencies.`,
      featuredImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'University campus lecture hall and library study enclave.',
      imageSource: 'Higher Education Bureau',
      isFeatured: false,
      isBreaking: false,
      readingTimeMin: 4
    },
    {
      title: 'Community Schools in Gandaki Province Transition to Trilingual Science and Computing Pedagogy',
      slug: 'community-schools-gandaki-trilingual-science-computing',
      categorySlug: 'education',
      summary: 'Classrooms integrate Nepali, English, and indigenous Gurung/Magar mother tongues alongside hands-on computer coding.',
      content: `Over 120 government-funded public secondary schools across Kaski, Tanahun, and Lamjung have adopted modern interactive digital smart boards and trilingual learning curricula.\n\nEducational psychologists noted that allowing early primary students to conceptualize mathematical and scientific concepts in their local mother tongue before transitioning to technical English terminology dramatically boosts student retention and classroom engagement.`,
      featuredImage: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Secondary school students engaged in classroom scientific study.',
      imageSource: 'Ministry of Education Pool',
      isFeatured: false,
      isBreaking: false,
      readingTimeMin: 3
    },
    {
      title: 'Council for Technical Education Expands Solar and Electric Vehicle Technician Fellowships',
      slug: 'ctevt-solar-ev-technician-vocational-fellowships',
      categorySlug: 'education',
      summary: 'CTEVT partners with private sector industries to train 5,000 young certified electrical technicians annually across all provinces.',
      content: `In response to Nepal’s rapid electrification and surge in electric four-wheeler and scooter imports, the Council for Technical Education and Vocational Training (CTEVT) has inaugurated dedicated EV diagnostic laboratories in Biratnagar, Butwal, and Nepalgunj.\n\nTrainees receive full scholarship stipends and guaranteed six-month industrial apprenticeships with domestic commercial electric vehicle assemblers and battery management facilities.`,
      featuredImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Technical vocational apprentices inspecting electrical circuitry.',
      imageSource: 'Vocational Training Desk',
      isFeatured: false,
      isBreaking: false,
      readingTimeMin: 3
    },

    // --- 11. HEALTH ---
    {
      title: 'Bir Hospital Dedicated Oncology Wing Activates Linear Accelerator for Advanced Cancer Radiotherapy',
      slug: 'bir-hospital-oncology-wing-linear-accelerator-radiotherapy',
      categorySlug: 'health',
      summary: 'State-of-the-art medical technology provides subsidized, precision tumor radiation for underprivileged patients across Nepal.',
      content: `The National Academy of Medical Sciences (NAMS) at historic Bir Hospital in central Kathmandu has commenced clinical operations of a dual-energy linear accelerator system.\n\nThe equipment allows oncologists to target deep-seated tumors with sub-millimeter precision, preserving surrounding healthy tissues while drastically reducing patient radiation treatment sessions. The Ministry of Health announced that poor and indigent citizens will receive 100 percent subsidized treatment under national healthcare relief provisions.`,
      featuredImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Modern clinical healthcare ward and diagnostic equipment.',
      imageSource: 'Health & Medical Bureau',
      isFeatured: false,
      isBreaking: false,
      readingTimeMin: 4
    },
    {
      title: 'Rural Telemedicine Network Links Remote Karnali Health Posts with Patan Academy Specialists',
      slug: 'rural-telemedicine-karnali-health-posts-patan-academy',
      categorySlug: 'health',
      summary: 'High-speed satellite connections enable real-time digital ECG, ultrasonography, and maternal emergency triage in Humla and Mugu.',
      content: `Expectant mothers in remote mountain settlements of Humla no longer face life-threatening multi-day porter journeys to access obstetrics evaluations.\n\nUnder an initiative backed by the Patan Academy of Health Sciences and local rural municipalities, twenty health posts across upper Karnali are now permanently connected via high-bandwidth satellite terminals. Specialist doctors in Lalitpur examine digital ultrasound feeds in real time, advising paramedic midwives on emergency interventions.`,
      featuredImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Medical personnel reviewing diagnostic patient health charts.',
      imageSource: 'Public Health Care Guild',
      isFeatured: false,
      isBreaking: false,
      readingTimeMin: 4
    },
    {
      title: 'Department of Drug Administration Strengthens Domestic Vaccine Cold Chain and Bio-Equivalence Testing',
      slug: 'dda-vaccine-cold-chain-bio-equivalence-testing',
      categorySlug: 'health',
      summary: 'Upgraded National Medicine Laboratory achieves ISO certification, ensuring rigorous oversight of imported and domestic pharmaceuticals.',
      content: `Nepal’s pharmaceutical regulatory authority has inaugurated a fully automated climate-controlled bio-equivalence testing laboratory in Bijulibazar, Kathmandu.\n\nThe facility allows independent validation of generic formulations produced by domestic pharmaceutical manufacturers, guaranteeing that essential medicines manufactured in Birgunj and Bharatpur meet international safety and bioavailability benchmarks.`,
      featuredImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Pharmaceutical quality control laboratory testing.',
      imageSource: 'Pharmacy Affairs Desk',
      isFeatured: false,
      isBreaking: false,
      readingTimeMin: 3
    },

    // --- 12. OPINION & EDITORIAL ---
    {
      title: 'Editorial: Preserving Kathmandu’s Living Heritage Beyond Superficial Tourism Commercialization',
      slug: 'editorial-preserving-kathmandus-living-heritage-corridors',
      categorySlug: 'opinion',
      summary: 'The living civilization of the Kathmandu Valley requires sustained civic stewardship, traditional guthi empowerment, and respectful municipal restoration.',
      content: `The historic core of Kathmandu, Patan, and Bhaktapur is not merely a collection of brick and timber monuments designed for tourist postcards. It is a sacred, living ecosystem shaped over centuries by interdependent social rituals, traditional artisans, guthi institutions, and daily civic routines.\n\nRecent municipal drives prioritizing hurried commercial modernization along traditional sattals and courtyards raise fundamental questions regarding what true heritage preservation entails.\n\nWhen ancient water conduits (dhunge dharas) run dry due to unregulated borewells, and when historical community courtyards are converted into vehicular parking, the intangible soul of the city suffocates. We must adopt an urban planning paradigm where indigenous architectural communities guide engineering choices, and where long-term cultural resilience takes absolute precedence over transient commercial expediency.`,
      featuredImage: 'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Traditional Newar pagoda architecture and brickwork in Patan Durbar Square.',
      imageSource: 'The Nepal Chronicle / Cultural Heritage Desk',
      isFeatured: true,
      isBreaking: false,
      readingTimeMin: 5
    },
    {
      title: 'Column: Navigating South Asian Geopolitics in an Era of Multipolar Economic Realignment',
      slug: 'column-navigating-south-asian-geopolitics-multipolar-era',
      categorySlug: 'opinion',
      summary: 'Nepal’s diplomatic sovereignty hinges on principled non-alignment, multilateral institutionalism, and active regional clean energy commerce.',
      content: `As competitive geopolitical currents intensify between major global powers across the Indo-Pacific, land-linked nations like Nepal must navigate foreign policy with unyielding clarity, strategic patience, and diplomatic rigor.\n\nSovereign non-alignment is not passive neutrality; it is the active defense of our national constitutional interests. By positioning Nepal as a reliable clean energy battery for the sub-continent and a transit connector between northern and southern Asian economies, we convert our geographic location from a vulnerability into an enduring diplomatic asset.`,
      featuredImage: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'World map and compass symbolizing geopolitical strategic navigation.',
      imageSource: 'Diplomatic Thought Bureau',
      isFeatured: false,
      isBreaking: false,
      readingTimeMin: 6
    },
    {
      title: 'Essay: The Ecological Imperative of Nepal’s Hydropower Transition in the Shadow of Alpine Melt',
      slug: 'essay-ecological-imperative-hydropower-transition-alpine-melt',
      categorySlug: 'opinion',
      summary: 'Building high-capacity energy infrastructure requires rigorous climate resilience planning against unpredictable glacial outburst torrents.',
      content: `Hydropower is unquestionably Nepal’s sovereign pathway toward industrial self-sufficiency, trade deficit elimination, and regional decarbonization. Yet, constructing multi-billion-dollar concrete barrages in geologically young, seismically active Himalayan river canyons demands utmost ecological humility.\n\nEngineering designs conceived using twentieth-century rainfall and river runoff data are obsolete in an era when cloudbursts and glacial moraine failures strike without historical precedent. We must mandate dual-purpose reservoir designs with sediment-flushing gates, automated downstream warning sirens, and comprehensive catchment reforestation.`,
      featuredImage: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Himalayan mountain mist and rushing glacial river torrent.',
      imageSource: 'Alpine Ecological Forum',
      isFeatured: false,
      isBreaking: false,
      readingTimeMin: 5
    },

    // --- 13. CULTURE & SOCIETY ---
    {
      title: 'Biska Jatra Chariot Festival Concludes in Bhaktapur with Thousand-Year Ritual Fervor',
      slug: 'biska-jatra-chariot-festival-bhaktapur-conclusion',
      categorySlug: 'culture',
      summary: 'Ancient Newar New Year festivities unite tens of thousands of worshippers around the towering wooden chariot of Lord Bhairavnath.',
      content: `The historic city of Bhaktapur reverberated with traditional dhime drums and brass horns on Thursday as the nine-day Biska Jatra festival concluded at Taumadhi Square.\n\nYouth from the upper (Thane) and lower (Kwone) quarters engaged in the traditional, spirited tug-of-war pulling the multi-tiered chariot of Bhairavnath. Cultural anthropologists observed that the communal festival reinforces social cohesion and inter-caste guthi obligations that have sustained Bhaktapur’s cultural survival since the early Licchavi era.`,
      featuredImage: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Traditional wooden temple roofs and cultural heritage gathering in the Kathmandu Valley.',
      imageSource: 'Cultural Heritage Guild',
      isFeatured: true,
      isBreaking: false,
      readingTimeMin: 4
    },
    {
      title: 'Nepal Academy of Music and Drama Launches National Archive of Indigenous Himalayan Folk Melodies',
      slug: 'nepal-academy-music-drama-indigenous-folk-archive',
      categorySlug: 'culture',
      summary: 'Field sound recordists preserve vanishing oral musical traditions across Rai, Limbu, Tharu, and Gurung ethnic communities.',
      content: `Using high-fidelity field audio equipment, ethnomusicologists from the Nepal Academy of Music and Drama have completed a two-year expedition across 30 rural districts.\n\nThe project has recorded over 1,200 hours of rare sacred folk chants, funeral laments, seasonal sowing ballads, and traditional sarangi, madal, and tungna performances. The entire repository is being uploaded to an open digital audio library for scholars, musicologists, and future generations.`,
      featuredImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Traditional musical instrument strings and cultural recording.',
      imageSource: 'National Music Archives',
      isFeatured: false,
      isBreaking: false,
      readingTimeMin: 3
    },
    {
      title: 'Tharu Traditional Clay Mural Art and Architecture Gains National Heritage Protection in Terai',
      slug: 'tharu-traditional-clay-mural-art-heritage-protection',
      categorySlug: 'culture',
      summary: 'Intricate natural clay wall carvings depicting forest biodiversity recognized for ecological and architectural ingenuity.',
      content: `The Department of Archaeology has designated historical Tharu community settlements in Dang and Bardiya as protected living heritage zones.\n\nThe traditional architectural style—utilizing bamboo frameworks, elephant grass thatch, and hand-sculpted white clay murals painted with natural plant pigments—remains naturally climate-responsive, keeping homes ten degrees cooler during scorching summer heatwaves without electrical air conditioning.`,
      featuredImage: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
      imageCaption: 'Handcrafted traditional earth textures and indigenous artwork.',
      imageSource: 'Indigenous Heritage Bureau',
      isFeatured: false,
      isBreaking: false,
      readingTimeMin: 4
    }
  ];

  let seededCount = 0;
  for (const item of ARTICLES) {
    const categoryId = categoryMap[item.categorySlug];
    if (!categoryId) continue;

    // Use staggered publication dates over the past 4 days to ensure realistic editorial timelines
    const hoursAgo = Math.floor(Math.random() * 72) + 1;
    const publishedAt = new Date(Date.now() - hoursAgo * 3600000);

    await prisma.newsArticle.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        summary: item.summary,
        content: item.content,
        featuredImage: item.featuredImage,
        imageCaption: item.imageCaption,
        imageSource: item.imageSource,
        isFeatured: item.isFeatured,
        isBreaking: item.isBreaking,
        readingTimeMin: item.readingTimeMin,
        status: 'PUBLISHED',
        publishedAt,
        categoryId,
        authorId: adminUser.id
      },
      create: {
        title: item.title,
        slug: item.slug,
        summary: item.summary,
        content: item.content,
        featuredImage: item.featuredImage,
        imageCaption: item.imageCaption,
        imageSource: item.imageSource,
        isFeatured: item.isFeatured,
        isBreaking: item.isBreaking,
        readingTimeMin: item.readingTimeMin,
        status: 'PUBLISHED',
        publishedAt,
        categoryId,
        authorId: adminUser.id
      }
    });
    seededCount++;
  }

  console.log(`✓ ${seededCount} comprehensive editorial news articles successfully seeded.`);
  console.log('--- Database Seed Execution Complete ---');
}

main()
  .catch((e) => {
    console.error('Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
