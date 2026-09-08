import type { ResumeData, ResumeStyleSettings } from './types';

export const DEFAULT_STYLE_SETTINGS: ResumeStyleSettings = {
  template: 'harvard-ats',
  fontFamily: 'inter',
  accentColor: 'slate',
  density: 'standard',
  showIcons: true,
  highlightKeywords: false,
};

export const DEFAULT_SECTION_ORDER = [
  'summary',
  'education',
  'skills',
  'positions',
  'projects',
  'certifications',
];

export const SAMPLE_PROFILES: Record<string, { label: string; description: string; data: ResumeData }> = {
  'vedanth-gali': {
    label: 'Computer Engineering (Vedanth Gali)',
    description: 'Computer Engineering student with React, Node.js, SQL, and conference leadership.',
    data: {
      id: 'profile-vedanth',
      title: 'Vedanth Gali — Computer Engineering',
      contact: {
        name: 'VEDANTH GALI',
        phone: '+91 9987602631',
        email: 'vedanthmgali@gmail.com',
        location: 'Mumbai, Maharashtra, India',
        github: 'https://github.com/vedanthgali',
        linkedin: 'https://linkedin.com/in/vedanthgali',
      },
      summary:
        'Computer Engineering student with hands-on experience in building web applications using React, Node.js, and databases. Actively participates in hackathons and team projects, with a strong focus on problem-solving, scalability, and clean UI/UX.',
      education: [
        {
          degree: 'Bachelor of Engineering – Computer Engineering (final Year)',
          institution: 'Mumbai University, India',
          dates: 'Duration: 2023 – 2027',
        },
      ],
      skills: [
        { category: 'Languages', skills: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C', 'SQL'] },
        { category: 'Frontend', skills: ['React.js', 'HTML', 'CSS', 'Tailwind CSS', 'Vite'] },
        { category: 'Backend', skills: ['Node.js', 'Express.js', 'REST APIs'] },
        { category: 'Databases', skills: ['MySQL', 'PostgreSQL'] },
        { category: 'Design & Development', skills: ['Figma', 'UI/UX', 'Responsive Design'] },
        { category: 'Tools', skills: ['Git', 'GitHub', 'VS Code', 'Antigravity'] },
      ],
      positions: [
        {
          title: 'Conference Coordinator & Creative Head — ICSICE 2026',
          bullets: [
            'Coordinated the International Conference on Sustainability Innovation in Computing and Engineering (ICSICE 2026), overseeing cross-team planning, communication, and event execution. Directed the creative vision of the conference, including branding, visual design, promotional materials, and maintaining a consistent identity across conference activities.',
          ],
        },
        {
          title: 'Hackathon Club Head – Computer Engineering Department | 2024–2025',
          bullets: [
            'Shaping technical challenges, facilitating team participation, and supporting students through ideation, development, and final submissions.',
          ],
        },
        {
          title: 'Technical Head – Department of Computer Engineering CESA & CSI | 2024',
          bullets: [
            'Managed the department’s technical activities, including student workshops, expert lectures, technical sessions, and project mentoring.',
          ],
        },
      ],
      projects: [
        {
          name: 'College Buzz',
          tech: ['React.js', 'Node.js', 'Express.js', 'SQL'],
          bullets: [
            'Built a full-stack platform for colleges to publish, manage, and promote events, workshops, and student activities.',
            'Developed the React.js frontend and Node.js/Express.js backend with REST APIs for users, events, and platform operations.',
            'Implemented authentication, admin workflows, and database management using SQL.',
          ],
          visible: true,
        },
        {
          name: 'Escape Placement Cell',
          tech: ['React.js', 'TypeScript', 'Node.js', 'Express.js'],
          bullets: [
            'Developed a gamified placement-preparation platform featuring interactive challenges and progression-based tasks.',
            'Built responsive frontend experiences using React.js and TypeScript with backend services using Node.js and Express.js.',
            'Designed user flows and interactive logic to make placement preparation more engaging and structured.',
          ],
          visible: true,
        },
        {
          name: 'Wings Studios',
          tech: ['React.js', 'Tailwind CSS', 'Vite'],
          bullets: [
            'Designed and developed a professional portfolio platform for a film production house to showcase projects and creative work.',
            'Built responsive, media-focused interfaces using React.js and Tailwind CSS with emphasis on visual storytelling.',
            'Integrated structured project content and modern UI interactions for a polished client-facing experience.',
          ],
          visible: true,
        },
      ],
      certifications: [
        { title: 'Introduction to Database Systems', issuer: 'NPTEL, IIT Madras', year: '2025' },
        { title: 'RDBMS PostgreSQL Training', issuer: 'EduPyramids, SINE IIT Bombay', year: '2026' },
        { title: 'Tata GenAI Powered Data Analytics Job Simulation', issuer: 'Forage', year: '2026' },
        { title: 'Linux Training', issuer: 'EduPyramids, SINE IIT Bombay', year: '2025' },
      ],
      style: DEFAULT_STYLE_SETTINGS,
      sectionOrder: DEFAULT_SECTION_ORDER,
    },
  },

  'full-stack': {
    label: 'Software Engineering & Full Stack',
    description: 'Specialized in React, Node.js, TypeScript, SQL, and cloud microservices.',
    data: {
      id: 'profile-fullstack',
      title: 'Full Stack Engineering Resume',
      contact: {
        name: 'ALEX CHEN',
        phone: '+1 (555) 234-5678',
        email: 'alex.chen@university.edu',
        location: 'San Francisco, CA',
        github: 'https://github.com/alexchen-dev',
        linkedin: 'https://linkedin.com/in/alexchen-dev',
        portfolio: 'https://alexchen.dev',
      },
      summary:
        'Final-year Computer Science student with hands-on software engineering experience architecting scalable full-stack web applications using React, Node.js, and PostgreSQL. Proven track record in hackathons and campus tech leadership with a focus on clean modular architecture, CI/CD automation, and low-latency REST APIs.',
      education: [
        {
          degree: 'Bachelor of Science in Computer Science (GPA: 3.85/4.0)',
          institution: 'University of California, Berkeley',
          dates: '2023 – 2027',
          location: 'Berkeley, CA',
          coursework: 'Data Structures, Distributed Systems, Database Systems, Computer Networks',
        },
      ],
      skills: [
        { category: 'Languages', skills: ['TypeScript', 'JavaScript', 'Python', 'Go', 'SQL', 'C++'] },
        { category: 'Frontend', skills: ['React.js', 'Next.js', 'Tailwind CSS', 'Redux Toolkit', 'HTML5/CSS3'] },
        { category: 'Backend & APIs', skills: ['Node.js', 'Express.js', 'FastAPI', 'RESTful APIs', 'GraphQL'] },
        { category: 'Databases & Cloud', skills: ['PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'AWS (S3, EC2)'] },
        { category: 'Tools & Practices', skills: ['Git', 'GitHub Actions', 'Jest', 'Postman', 'Agile/Scrum'] },
      ],
      positions: [
        {
          title: 'Software Engineering Intern',
          organization: 'Apex Cloud Solutions',
          dates: 'Jun 2025 – Aug 2025',
          location: 'San Francisco, CA',
          bullets: [
            'Engineered high-throughput REST endpoints in Node.js/Express, reducing API latency by 28% for 45,000+ daily active users.',
            'Architected automated test suites in Jest and Supertest, elevating backend code coverage from 64% to 91%.',
            'Collaborated with senior engineers to migrate legacy SQL schemas to PostgreSQL with zero downtime.',
          ],
        },
        {
          title: 'Vice President & Technical Lead',
          organization: 'ACM Student Chapter',
          dates: '2024 – Present',
          location: 'UC Berkeley',
          bullets: [
            'Organized 12+ hands-on technical workshops covering Web3, Docker, and full-stack architecture for 400+ students.',
            'Mentored 15 junior engineering teams through ideation to deployment for collegiate hackathons.',
          ],
        },
      ],
      projects: [
        {
          name: 'CloudSync Hub — Real-time Collaboration Engine',
          tech: ['Next.js', 'TypeScript', 'Node.js', 'Redis', 'WebSockets', 'PostgreSQL'],
          bullets: [
            'Built a real-time collaborative workspace supporting live markdown editing, presence awareness, and sub-50ms sync.',
            'Implemented optimistic UI updates and conflict-resolution algorithms handling up to 100 concurrent room editors.',
            'Integrated JWT-based authentication and role-based access control (RBAC) with secure session persistence in Redis.',
          ],
          link: 'https://cloudsync-hub.demo.app',
          github: 'https://github.com/alexchen-dev/cloudsync-hub',
          visible: true,
        },
        {
          name: 'DevPulse — Developer Analytics & Git Visualizer',
          tech: ['React.js', 'FastAPI', 'Python', 'PostgreSQL', 'Docker'],
          bullets: [
            'Developed an automated Git telemetry dashboard that analyzes PR velocity, code churn, and test coverage trends.',
            'Constructed ETL pipelines in Python querying GitHub REST & GraphQL APIs with intelligent caching strategies.',
            'Containerized services using Docker Compose, decreasing local onboarding setup time by 70%.',
          ],
          link: 'https://devpulse.analytics.io',
          github: 'https://github.com/alexchen-dev/devpulse',
          visible: true,
        },
      ],
      certifications: [
        { title: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', year: '2025' },
        { title: 'Meta Front-End Developer Professional Certificate', issuer: 'Coursera / Meta', year: '2024' },
      ],
      style: DEFAULT_STYLE_SETTINGS,
      sectionOrder: DEFAULT_SECTION_ORDER,
    },
  },

  'ai-data-science': {
    label: 'AI & Data Science',
    description: 'Focused on Machine Learning, PyTorch, Data Pipelines, LLMs, and Statistical Analysis.',
    data: {
      id: 'profile-datascience',
      title: 'Data Science & AI Resume',
      contact: {
        name: 'PRIYA SHARMA',
        phone: '+1 (555) 987-6543',
        email: 'priya.sharma@stanford.edu',
        location: 'Palo Alto, CA',
        github: 'https://github.com/priyasharma-ai',
        linkedin: 'https://linkedin.com/in/priyasharma-ai',
      },
      summary:
        'Data Science & Artificial Intelligence student with strong foundation in machine learning, statistical modeling, and LLM fine-tuning. Experienced in developing predictive analytics pipelines and deep learning models with PyTorch and Scikit-Learn. Passionate about transforming raw complex data into actionable business intelligence.',
      education: [
        {
          degree: 'Bachelor of Science in Data Science & Statistics (GPA: 3.92/4.0)',
          institution: 'Stanford University',
          dates: '2023 – 2027',
          location: 'Stanford, CA',
          coursework: 'Machine Learning, Deep Neural Networks, Applied Statistics, Big Data Systems',
        },
      ],
      skills: [
        { category: 'Languages', skills: ['Python', 'R', 'SQL', 'C++', 'Bash'] },
        { category: 'ML & Deep Learning', skills: ['PyTorch', 'TensorFlow', 'Scikit-Learn', 'Hugging Face Transformers', 'LangChain'] },
        { category: 'Data Analysis & Viz', skills: ['Pandas', 'NumPy', 'SciPy', 'Matplotlib', 'Seaborn', 'Tableau', 'Power BI'] },
        { category: 'Big Data & Cloud', skills: ['Apache Spark', 'Databricks', 'AWS SageMaker', 'PostgreSQL', 'Snowflake'] },
        { category: 'Tools & DevOps', skills: ['MLflow', 'Docker', 'Git', 'Jupyter', 'Weights & Biases'] },
      ],
      positions: [
        {
          title: 'Machine Learning Research Assistant',
          organization: 'Stanford AI Lab',
          dates: 'Jan 2025 – Present',
          location: 'Stanford, CA',
          bullets: [
            'Trained and evaluated transformer-based biomedical NLP models on 2M+ PubMed abstracts, achieving 94.2% F1-score.',
            'Implemented LoRA parameter-efficient fine-tuning on Llama-3, reducing GPU memory footprint by 65%.',
            'Co-authored research paper on domain-specific prompt engineering accepted at student research symposium.',
          ],
        },
      ],
      projects: [
        {
          name: 'MediVision — Multimodal Chest X-Ray Diagnosis',
          tech: ['PyTorch', 'Vision Transformers', 'FastAPI', 'Docker', 'Streamlit'],
          bullets: [
            'Developed a deep learning diagnostic assistant trained on 100k+ NIH Chest X-ray images with 92.4% AUC-ROC.',
            'Integrated Grad-CAM visual heatmaps to explain model predictions to clinical practitioners.',
          ],
          github: 'https://github.com/priyasharma-ai/medivision',
          visible: true,
        },
      ],
      certifications: [
        { title: 'Deep Learning Specialization', issuer: 'DeepLearning.AI / Andrew Ng', year: '2025' },
      ],
      style: DEFAULT_STYLE_SETTINGS,
      sectionOrder: DEFAULT_SECTION_ORDER,
    },
  },

  'product-manager': {
    label: 'Product & Project Management',
    description: 'Geared towards technical PM, Agile Scrum, roadmaps, and stakeholder alignment.',
    data: {
      id: 'profile-pm',
      title: 'Product Management Resume',
      contact: {
        name: 'MARCUS VANCE',
        phone: '+1 (555) 456-7890',
        email: 'marcus.vance@mit.edu',
        location: 'Boston, MA',
        github: 'https://github.com/marcusvance-pm',
        linkedin: 'https://linkedin.com/in/marcusvance-pm',
      },
      summary:
        'Engineering & Management student with proven leadership delivering cross-functional digital products from 0 to 1. Experienced in user discovery, backlog prioritization, PRD writing, and Agile sprint execution. Adept at bridging technical feasibility with business growth metrics.',
      education: [
        {
          degree: 'Bachelor of Science in Engineering & Business Management',
          institution: 'Massachusetts Institute of Technology',
          dates: '2023 – 2027',
          location: 'Cambridge, MA',
        },
      ],
      skills: [
        { category: 'Product Strategy', skills: ['Product Discovery', 'PRD Writing', 'Roadmapping', 'User Journey Mapping', 'A/B Testing'] },
        { category: 'Agile & Delivery', skills: ['Scrum Master', 'Sprint Planning', 'Backlog Grooming', 'Jira', 'Linear', 'Notion'] },
        { category: 'Analytics & Metrics', skills: ['SQL', 'Mixpanel', 'Google Analytics 4', 'Amplitude', 'Tableau'] },
        { category: 'Design & Prototyping', skills: ['Figma', 'Wireframing', 'User Research', 'Usability Testing'] },
      ],
      positions: [
        {
          title: 'Associate Product Manager Intern',
          organization: 'Beacon FinTech Group',
          dates: 'Jun 2025 – Aug 2025',
          location: 'Boston, MA',
          bullets: [
            'Spearheaded the redesign of user onboarding flow, boosting 7-day user activation rate by 34% across 80,000+ accounts.',
            'Authored 14 detailed PRDs and user stories, coordinating sprints across 6 engineers and 2 UI/UX designers.',
          ],
        },
      ],
      projects: [
        {
          name: 'CampusMeal Pass — Campus Dining Subscription App',
          tech: ['Figma', 'React Native', 'Node.js', 'Stripe API'],
          bullets: [
            'Validated problem space through 150+ student surveys and launched beta app adopted by 850 active monthly students.',
          ],
          visible: true,
        },
      ],
      certifications: [
        { title: 'Certified Scrum Product Owner (CSPO)', issuer: 'Scrum Alliance', year: '2025' },
      ],
      style: DEFAULT_STYLE_SETTINGS,
      sectionOrder: DEFAULT_SECTION_ORDER,
    },
  },

  'blank': {
    label: 'Blank Template (From Scratch)',
    description: 'Start with a clean slate to enter your own information from the ground up.',
    data: {
      id: 'profile-blank',
      title: 'My Custom Resume',
      contact: {
        name: 'YOUR NAME',
        phone: '+1 (555) 000-0000',
        email: 'your.email@domain.com',
        location: 'City, Country',
        github: 'https://github.com/yourhandle',
        linkedin: 'https://linkedin.com/in/yourhandle',
        portfolio: '',
      },
      summary:
        'Motivated student / aspiring professional with strong foundational skills. Looking to contribute impactful work in high-growth environments.',
      education: [
        {
          degree: 'Bachelor of Science in Engineering',
          institution: 'University Name',
          dates: '2023 – 2027',
          location: 'City, Country',
        },
      ],
      skills: [
        { category: 'Technical Skills', skills: ['Skill 1', 'Skill 2', 'Skill 3'] },
        { category: 'Tools & Technologies', skills: ['Tool A', 'Tool B', 'Tool C'] },
      ],
      positions: [
        {
          title: 'Position / Role Title',
          organization: 'Organization / Company Name',
          dates: 'Jan 2025 – Present',
          bullets: [
            'Accomplished key project milestones on schedule.',
          ],
        },
      ],
      projects: [
        {
          name: 'Project Title',
          tech: ['React', 'Node.js', 'SQL'],
          bullets: [
            'Built an impactful solution addressing key problems.',
          ],
          visible: true,
        },
      ],
      certifications: [
        { title: 'Certification or Course Name', issuer: 'Issuing Organization', year: '2025' },
      ],
      style: DEFAULT_STYLE_SETTINGS,
      sectionOrder: DEFAULT_SECTION_ORDER,
    },
  },
};
