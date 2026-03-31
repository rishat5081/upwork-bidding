import {
  getProfile,
  saveProfile,
  getCaseStudies,
  saveCaseStudy,
  getSettings,
  saveSettings,
} from './db';

export function seedDatabase() {
  // Only seed if profile doesn't exist
  const profile = getProfile();
  if (profile) return;

  // Seed profile
  saveProfile({
    headline: 'Senior Backend Engineer | Node.js API Integrations | AWS | PostgreSQL',
    summary:
      'Senior Full-Stack Software Engineer with 6+ years of experience designing, developing, and deploying high-performance web applications and RESTful APIs. Specializes in building production-grade Node.js systems backed by PostgreSQL, MongoDB, and AWS \u2014 and enhancing them with Large Language Models and Generative AI.',
    niche: 'Node.js API integrations, SaaS backends, webhook pipelines, backend automation',
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
      'Stripe',
      'SendGrid',
    ],
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
    avoidList: [
      'WordPress',
      'Shopify theme',
      'Mobile-only',
      'Blockchain',
      'Web3',
      'NFT',
      'Simple landing page',
      'Logo design',
    ],
    proposalTone: 'direct',
    yearsOfExperience: 6,
    workHistory: [
      {
        company: 'Obenan',
        role: 'Senior Full-Stack Engineer',
        period: 'May 2023 - Present',
        description:
          'Architected and maintain a multi-tenant SaaS platform with dual-database system (PostgreSQL + MongoDB). Built 100+ Sequelize models, 400+ migrations, and multi-tenant data isolation. Engineered BullMQ job pipelines for async processing, Stripe billing integration, SendGrid email system, and full AWS infrastructure with CI/CD. Integrated AI features using Claude and GPT-4.',
        highlights: [
          'Multi-tenant SaaS architecture',
          '100+ Sequelize models, 400+ migrations',
          'BullMQ job pipelines',
          'Stripe billing integration',
          'AWS infrastructure (EC2, S3, Lambda, VPC)',
          'AI/LLM integrations (Claude, GPT-4)',
        ],
      },
      {
        company: 'Agile District',
        role: 'Senior Backend Developer',
        period: 'Feb 2022 - May 2023',
        description:
          'Built the NowVPlay sports platform backend with MongoDB for complex data structures. Engineered real-time notification and messaging with Socket.IO. Implemented content moderation with NSFWJS. CI/CD with AWS Elastic Beanstalk.',
        highlights: [
          'Real-time Socket.IO messaging',
          'MongoDB complex data structures',
          'Content moderation (NSFWJS)',
          'AWS Elastic Beanstalk CI/CD',
        ],
      },
      {
        company: 'Zamulk.com',
        role: 'Software Engineer',
        period: 'Jan 2020 - Jan 2022',
        description:
          "Developed RESTful APIs for Pakistan's real estate portal covering 100+ cities. Built property listings, search, filtering, Vision 360 virtual tours, online auction room with real-time bidding, and agent directory. Implemented real-time communication with live chat, audio/video calls using Socket.IO. MongoDB with geospatial queries.",
        highlights: [
          'RESTful APIs for 100+ cities',
          'Geospatial search with MongoDB',
          'Real-time bidding auction system',
          'Live chat and video calls via Socket.IO',
        ],
      },
    ],
    skills: {
      backend: [
        'Node.js',
        'Express.js',
        'NestJS',
        'REST APIs',
        'GraphQL',
        'Socket.IO',
        'Python',
        'Nginx',
      ],
      frontend: ['React.js', 'Next.js', 'JavaScript', 'TypeScript'],
      databases: ['MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Sequelize'],
      cloudDevOps: ['AWS (EC2, S3, Lambda, VPC, ELB, CodePipeline)', 'Azure Functions', 'Docker'],
      aiLlms: ['Claude AI', 'OpenAI (GPT-4, Codex)', 'Gemini', 'RAG', 'Fine-tuning'],
      tools: [
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
  });

  // Seed case studies
  const existingCaseStudies = getCaseStudies();
  if (existingCaseStudies.length === 0) {
    const caseStudies = [
      {
        id: 'goto-api',
        title: 'GoTo API Integration \u2014 Enterprise Communication',
        client: 'Enterprise Client',
        problem:
          'Needed integrated communication platform with CRM sync, call recording management, and AI-powered transcription',
        solution:
          'Built NestJS monorepo integrating GoTo Connect APIs for webhook processing, call recording management, and AI transcription using OpenAI GPT-4o and AWS Transcribe. Includes RedTail CRM integration, Agenda job scheduler, and CI/CD with GitHub Actions.',
        technologies: [
          'NestJS',
          'TypeScript',
          'Next.js',
          'GoTo Connect API',
          'OpenAI GPT-4o',
          'AWS Transcribe',
          'RedTail CRM',
          'Agenda',
          'GitHub Actions',
        ],
        outcome: 'Fully automated communication workflow with AI transcription and CRM sync',
        tags: ['api-integration', 'crm', 'webhooks', 'ai', 'nestjs'],
      },
      {
        id: 'autotask-gpt',
        title: 'Autotask Webhook Automation with GPT Enrichment',
        client: 'MSP Client',
        problem: 'Manual ticket analysis in Autotask PSA was time-consuming and inconsistent',
        solution:
          'Automated Autotask PSA ticket analysis with GPT-4o-mini. Webhooks gather ticket data, company info, image attachments, and IT Glue enrichment \u2014 AI generates analysis notes posted back to tickets. Includes Azure Key Vault for secrets and Next.js admin dashboard.',
        technologies: [
          'NestJS',
          'TypeScript',
          'Next.js 14',
          'Autotask PSA API',
          'GPT-4o-mini',
          'Azure Key Vault',
          'IT Glue API',
          'Webhooks',
        ],
        outcome:
          'Reduced ticket analysis time by automating intelligence gathering and AI-powered insights',
        tags: ['webhook-automation', 'ai', 'ticketing', 'nestjs', 'azure'],
      },
      {
        id: 'obenan-saas',
        title: 'Obenan Multi-Tenant SaaS Platform',
        client: 'Obenan',
        problem:
          'Needed scalable multi-tenant platform for managing business locations, reviews, and engagement across thousands of businesses',
        solution:
          'Architected dual-database system (PostgreSQL + MongoDB) with 100+ Sequelize models, 400+ migrations, and multi-tenant data isolation. Built BullMQ job pipelines for async processing, Stripe billing integration, SendGrid email system, and full AWS infrastructure with CI/CD.',
        technologies: [
          'Node.js',
          'PostgreSQL',
          'MongoDB',
          'Sequelize',
          'AWS',
          'BullMQ',
          'Redis',
          'Stripe',
          'SendGrid',
          'Lambda',
          'EC2',
          'S3',
        ],
        outcome:
          'Production SaaS serving thousands of businesses with high availability and automated billing',
        tags: ['saas', 'multi-tenant', 'postgresql', 'mongodb', 'aws', 'stripe'],
      },
      {
        id: 'nowvplay-realtime',
        title: 'NowVPlay Real-Time Sports Platform',
        client: 'Agile District',
        problem: 'Build backend for sports venue management with real-time features',
        solution:
          'Built high-availability backend with MongoDB for complex data structures. Engineered real-time notification and messaging with Socket.IO. Implemented content moderation with NSFWJS. CI/CD with AWS Elastic Beanstalk.',
        technologies: [
          'Node.js',
          'MongoDB',
          'Socket.IO',
          'AWS Elastic Beanstalk',
          'NSFWJS',
          'Chai',
          'Mocha',
        ],
        outcome:
          'Live sports platform with real-time match invitations, booking confirmations, and activity updates',
        tags: ['real-time', 'socket-io', 'mongodb', 'aws', 'backend'],
      },
      {
        id: 'zamulk-realestate',
        title: 'Zamulk Real Estate Portal',
        client: 'Zamulk.com',
        problem: "Build backend for Pakistan's real estate portal covering 100+ cities",
        solution:
          'Developed RESTful APIs for property listings, search, filtering, Vision 360 virtual tours, online auction room with real-time bidding, and agent directory. Built real-time communication with live chat, audio/video calls using Socket.IO. MongoDB with geospatial queries.',
        technologies: ['Node.js', 'MongoDB', 'Socket.IO', 'REST APIs', 'Geospatial Queries'],
        outcome: 'Comprehensive real estate platform serving 100+ cities with real-time features',
        tags: ['real-time', 'socket-io', 'mongodb', 'geospatial', 'rest-api'],
      },
    ];

    for (const cs of caseStudies) {
      saveCaseStudy(cs);
    }
  }

  // Seed settings
  const existingSettings = getSettings();
  if (!existingSettings) {
    saveSettings({
      llmProvider: 'none',
      apiKey: '',
      dashboardPort: 3000,
      autoScoreOnReceive: true,
      createdAt: new Date().toISOString(),
    });
  }
}
