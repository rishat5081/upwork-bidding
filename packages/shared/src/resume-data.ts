import type { UserProfile, CaseStudy } from './types';

// ─── Default profile parsed from Saad Sohail's resume ──────────────────────

export const defaultProfile: UserProfile = {
  headline: 'Senior Backend Engineer | Node.js API Integrations | AWS | PostgreSQL',
  summary:
    'Senior Full-Stack Software Engineer with 6+ years of experience building scalable SaaS platforms, API integrations, and backend automation systems. Proven track record delivering complex multi-tenant architectures, webhook pipelines, CRM integrations, and real-time features using Node.js, NestJS, PostgreSQL, MongoDB, and AWS. Strong focus on clean architecture, performance optimization, and production reliability.',
  niche: 'Node.js API integrations, SaaS backends, webhook pipelines, backend automation',
  preferredJobTypes: [
    'Backend Development',
    'API Integration',
    'SaaS Backend',
    'Webhook Automation',
    'Database Design',
    'AWS Infrastructure',
    'Debugging & Performance',
  ],
  minimumBudget: 500,
  preferredStacks: [
    'Node.js',
    'NestJS',
    'Express',
    'PostgreSQL',
    'MongoDB',
    'Redis',
    'AWS',
    'TypeScript',
    'BullMQ',
    'Socket.IO',
  ],
  avoidList: [
    'WordPress',
    'Shopify theme',
    'Mobile-only app',
    'Blockchain',
    'Web3',
    'NFT',
    'Simple landing page',
  ],
  proposalTone: 'direct',
  yearsOfExperience: 6,

  workHistory: [
    {
      company: 'Obenan',
      role: 'Senior Full-Stack Engineer',
      dates: 'May 2023 - Present',
      highlights: [
        'Architected and maintained a multi-tenant SaaS platform with PostgreSQL (100+ models, 400+ migrations) and MongoDB for AI-driven local SEO services.',
        'Built and optimized background job pipelines using BullMQ and Redis, processing thousands of tasks daily for review management, listing sync, and AI content generation.',
        'Integrated third-party APIs including Google Business Profile, OpenAI, Stripe, SendGrid, and various review platforms.',
        'Developed a custom AI review-reply system leveraging GPT and fine-tuned models for automated, context-aware responses.',
        'Designed robust webhook ingestion and event-driven architectures for real-time data sync across services.',
        'Implemented Stripe billing with subscription management, usage tracking, and invoice automation.',
        'Led migration from monolith to modular service-oriented architecture, improving deployment velocity and code maintainability.',
        'Managed AWS infrastructure including EC2, S3, Lambda, VPC, ELB, and CodePipeline for CI/CD.',
      ],
    },
    {
      company: 'Agile District',
      role: 'Senior Backend Developer',
      dates: 'Feb 2022 - May 2023',
      highlights: [
        'Built a NestJS-based integration layer connecting GoTo Connect APIs (call events, transcriptions, recordings) with RedTail CRM for a financial services client.',
        'Developed webhook processors for real-time call event capture, AI-powered transcription summarization, and automated CRM activity logging.',
        'Created an Autotask PSA webhook automation pipeline with GPT-4o-mini enrichment for IT service management workflows.',
        'Designed Next.js admin dashboards with real-time monitoring, configuration management, and audit logging.',
        'Implemented Azure Key Vault integration for secure credential management in multi-tenant environments.',
        'Developed ITGlue documentation sync pipelines for automated IT asset management.',
      ],
    },
    {
      company: 'Zamulk.com',
      role: 'Software Engineer',
      dates: 'Jan 2020 - Jan 2022',
      highlights: [
        'Built a full-featured real estate portal with property listings, geospatial search (MongoDB 2dsphere indexes), and interactive map-based browsing.',
        'Implemented real-time chat and video calling features using Socket.IO and WebRTC.',
        'Developed user authentication, role-based access control, and property management workflows.',
        'Optimized MongoDB queries and aggregation pipelines for search performance across 100K+ listings.',
        'Created RESTful APIs consumed by both web (React) and mobile (React Native) clients.',
      ],
    },
  ],

  skills: [
    {
      category: 'Backend',
      skills: [
        'Node.js',
        'Express.js',
        'NestJS',
        'REST APIs',
        'GraphQL',
        'Socket.IO',
        'Python',
        'Nginx',
      ],
    },
    {
      category: 'Frontend',
      skills: ['React.js', 'Next.js', 'JavaScript', 'TypeScript'],
    },
    {
      category: 'Databases',
      skills: ['MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Sequelize'],
    },
    {
      category: 'Cloud & DevOps',
      skills: ['AWS (EC2, S3, Lambda, VPC, ELB, CodePipeline)', 'Azure Functions', 'Docker'],
    },
    {
      category: 'AI & LLMs',
      skills: [
        'Claude AI',
        'OpenAI (GPT-4, Codex)',
        'Gemini',
        'RAG',
        'Fine-tuning',
        'Prompt Engineering',
      ],
    },
    {
      category: 'Tools',
      skills: [
        'GitHub',
        'Jira',
        'Sentry',
        'CodeClimate',
        'JWT',
        'AutoTask',
        'ITGlue',
        'BullMQ',
        'Stripe',
        'SendGrid',
      ],
    },
  ],

  projects: [
    {
      name: 'Obenan SaaS Platform',
      description:
        'Multi-tenant local SEO platform with AI-driven review management, listing sync, and content generation. PostgreSQL + MongoDB hybrid, BullMQ job queues, Stripe billing, AWS infrastructure.',
      technologies: [
        'NestJS',
        'PostgreSQL',
        'MongoDB',
        'Redis',
        'BullMQ',
        'AWS',
        'Stripe',
        'OpenAI',
        'SendGrid',
      ],
    },
    {
      name: 'GoTo Connect CRM Integration',
      description:
        'NestJS integration layer connecting GoTo Connect APIs with RedTail CRM for financial services. Webhook processing, AI transcription summarization, automated activity logging.',
      technologies: [
        'NestJS',
        'GoTo Connect API',
        'RedTail CRM',
        'Webhooks',
        'AI Transcription',
        'PostgreSQL',
      ],
    },
    {
      name: 'Autotask Webhook Automation',
      description:
        'Webhook automation pipeline for Autotask PSA with GPT-4o-mini enrichment, Azure Key Vault credential management, and Next.js admin dashboard.',
      technologies: [
        'NestJS',
        'Autotask PSA',
        'GPT-4o-mini',
        'Azure Key Vault',
        'Next.js',
        'Webhooks',
      ],
    },
    {
      name: 'NowVPlay',
      description:
        'Real-time sports venue content management platform with Socket.IO, content moderation, and AWS Elastic Beanstalk deployment.',
      technologies: ['Node.js', 'Socket.IO', 'AWS Elastic Beanstalk', 'MongoDB', 'React'],
    },
    {
      name: 'Zamulk Real Estate Portal',
      description:
        'Full-featured real estate portal with geospatial search, real-time chat/video, property management, and mobile-ready APIs.',
      technologies: ['Node.js', 'MongoDB', 'Socket.IO', 'WebRTC', 'React', 'React Native'],
    },
    {
      name: 'ITGlue Documentation Sync',
      description:
        'Automated IT asset documentation sync pipeline connecting ITGlue with internal systems for real-time asset management.',
      technologies: ['NestJS', 'ITGlue API', 'PostgreSQL', 'BullMQ', 'Redis'],
    },
  ],

  strongestEvidence: [
    'Built and maintained a multi-tenant SaaS platform with 100+ PostgreSQL models and 400+ migrations at production scale.',
    'Designed webhook ingestion pipelines processing thousands of events daily with BullMQ and Redis.',
    'Integrated 10+ third-party APIs (GoTo Connect, RedTail CRM, Autotask, Google Business Profile, Stripe, OpenAI, SendGrid) in production systems.',
    'Built real-time features (Socket.IO, WebRTC) handling concurrent connections for sports venues and real estate platforms.',
    'Led migration from monolith to modular service-oriented architecture, improving deployment velocity.',
    'Managed AWS infrastructure (EC2, S3, Lambda, VPC, ELB, CodePipeline) for CI/CD and production workloads.',
    '6+ years shipping backend systems in Node.js/NestJS with PostgreSQL and MongoDB.',
  ],
};

// ─── Case studies extracted from resume ─────────────────────────────────────

export const defaultCaseStudies: CaseStudy[] = [
  {
    id: 'cs-goto-crm',
    title: 'GoTo Connect CRM Integration Pipeline',
    client: 'Financial Services Firm (via Agile District)',
    problem:
      'A financial services client needed their GoTo Connect phone system integrated with RedTail CRM so call events, recordings, and transcriptions automatically logged against client records. Manual entry was causing missed records and compliance gaps.',
    solution:
      'Built a NestJS integration layer that receives GoTo Connect webhooks for call events, processes recordings through AI transcription, generates summaries using GPT, and logs all activities to RedTail CRM automatically. Implemented retry logic, dead-letter queues, and audit trails for compliance.',
    technologies: [
      'NestJS',
      'GoTo Connect API',
      'RedTail CRM API',
      'Webhooks',
      'AI Transcription',
      'GPT',
      'PostgreSQL',
      'Node.js',
      'TypeScript',
    ],
    outcome:
      'Eliminated manual call logging entirely. 100% of call events now auto-sync to CRM with AI-generated summaries. Reduced compliance risk and saved the team ~10 hours/week of manual data entry.',
    tags: [
      'api-integration',
      'crm',
      'webhooks',
      'nestjs',
      'ai',
      'transcription',
      'automation',
      'backend',
    ],
  },
  {
    id: 'cs-autotask-webhook',
    title: 'Autotask Webhook Automation with GPT Enrichment',
    client: 'IT Services Provider (via Agile District)',
    problem:
      'An IT managed services provider needed their Autotask PSA ticket workflow automated. Incoming tickets lacked proper categorization, priority, and context, slowing response times and causing SLA breaches.',
    solution:
      'Developed a NestJS webhook automation pipeline that captures Autotask ticket events, enriches them with GPT-4o-mini for intelligent categorization and priority assessment, and routes them to appropriate teams. Built a Next.js admin dashboard for real-time monitoring and configuration. Used Azure Key Vault for secure multi-tenant credential management.',
    technologies: [
      'NestJS',
      'Autotask PSA API',
      'GPT-4o-mini',
      'Azure Key Vault',
      'Next.js',
      'Webhooks',
      'Node.js',
      'TypeScript',
    ],
    outcome:
      'Reduced average ticket triage time from 15 minutes to under 30 seconds. Improved SLA compliance by 40%. Admin dashboard gave real-time visibility into automation pipeline health.',
    tags: [
      'webhook-automation',
      'ai',
      'gpt',
      'nestjs',
      'admin-dashboard',
      'psa',
      'it-services',
      'backend',
    ],
  },
  {
    id: 'cs-obenan-saas',
    title: 'Obenan Multi-Tenant SaaS Platform',
    client: 'Obenan',
    problem:
      'Obenan needed a scalable multi-tenant SaaS platform for AI-driven local SEO services including review management, listing sync, and content generation. The system had to handle hundreds of business locations with isolated data, background processing, and billing.',
    solution:
      'Architected a hybrid PostgreSQL + MongoDB data layer (100+ models, 400+ migrations) with tenant isolation. Built BullMQ + Redis job pipelines processing thousands of daily tasks for review management, AI content generation, and listing sync. Integrated Stripe for subscription billing with usage tracking. Connected Google Business Profile, OpenAI, and SendGrid APIs. Managed AWS infrastructure with EC2, S3, Lambda, and CodePipeline.',
    technologies: [
      'NestJS',
      'PostgreSQL',
      'MongoDB',
      'Redis',
      'BullMQ',
      'AWS',
      'Stripe',
      'OpenAI',
      'SendGrid',
      'Google Business Profile API',
      'Node.js',
      'TypeScript',
    ],
    outcome:
      'Platform serves hundreds of business locations with reliable daily processing. Stripe billing automates revenue collection. Modular architecture supports rapid feature development and independent deployment.',
    tags: [
      'saas',
      'multi-tenant',
      'postgresql',
      'mongodb',
      'bullmq',
      'aws',
      'stripe',
      'ai',
      'backend',
      'api-integration',
    ],
  },
  {
    id: 'cs-nowvplay',
    title: 'NowVPlay Real-Time Sports Venue Backend',
    client: 'NowVPlay',
    problem:
      'A sports venue platform needed a real-time backend to manage live content feeds, fan interactions, and venue-specific content moderation across multiple simultaneous events.',
    solution:
      'Built a Node.js/Socket.IO backend handling real-time bidirectional communication for live event feeds. Implemented content moderation pipelines, venue-specific broadcasting channels, and scalable WebSocket management. Deployed on AWS Elastic Beanstalk with auto-scaling for event peak loads.',
    technologies: [
      'Node.js',
      'Socket.IO',
      'AWS Elastic Beanstalk',
      'MongoDB',
      'React',
      'WebSockets',
    ],
    outcome:
      'Platform handled concurrent real-time connections during live sporting events with sub-second latency. Content moderation caught 95%+ of policy violations before broadcast.',
    tags: [
      'real-time',
      'socket-io',
      'websockets',
      'aws',
      'content-moderation',
      'backend',
      'sports',
    ],
  },
  {
    id: 'cs-zamulk',
    title: 'Zamulk Real Estate Portal',
    client: 'Zamulk.com',
    problem:
      'A real estate startup needed a full-featured property portal with geospatial search, interactive map browsing, real-time chat between buyers/sellers, and video calling -- all performing well across 100K+ listings.',
    solution:
      'Built the backend with Node.js and MongoDB using 2dsphere geospatial indexes for location-based property search. Implemented real-time chat and video calling via Socket.IO and WebRTC. Designed RESTful APIs consumed by both React web and React Native mobile clients. Optimized aggregation pipelines for search performance at scale.',
    technologies: [
      'Node.js',
      'MongoDB',
      'Socket.IO',
      'WebRTC',
      'React',
      'React Native',
      'REST APIs',
      'Geospatial Indexing',
    ],
    outcome:
      'Portal served 100K+ property listings with fast geospatial queries. Real-time chat and video enabled direct buyer-seller communication, increasing engagement and reducing time-to-contact.',
    tags: [
      'real-estate',
      'geospatial',
      'real-time',
      'socket-io',
      'webrtc',
      'mongodb',
      'backend',
      'mobile-api',
    ],
  },
];
