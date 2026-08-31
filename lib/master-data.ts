import type { ResumeData, TargetRole } from './types';

export const MASTER_RESUME: ResumeData = {
  contact: {
    name: 'Vedanth Gali',
    phone: '+91 9987602631',
    email: 'vedanthmgali@gmail.com',
    location: 'Mumbai, Maharashtra, India',
    github: 'github.com/vedanthgali',
    linkedin: 'linkedin.com/in/vedanthgali',
  },
  summary:
    'Final-year Computer Engineering student with hands-on experience building full-stack web applications. Skilled in React.js, Node.js, and SQL with a strong foundation in problem-solving and clean architecture. Passionate about delivering scalable, user-focused software.',
  education: [
    {
      degree: 'Bachelor of Engineering — Computer Engineering (Final Year)',
      institution: 'Mumbai University',
      dates: '2023 — 2027',
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
        'Coordinated an international conference with cross-team planning across logistics, scheduling, and participant management.',
        'Directed visual branding and identity design, ensuring consistent communication across all event collateral.',
      ],
    },
    {
      title: 'Hackathon Club Head — Computer Engineering Department (2024-2025)',
      bullets: [
        'Facilitated student participation in inter-collegiate hackathons, supporting ideation and submission workflows.',
        'Organised mentoring sessions that improved team preparedness and project quality.',
      ],
    },
    {
      title: 'Technical Head — CESA & CSI (2024)',
      bullets: [
        'Managed student workshops and technical lectures, mentoring juniors on core CS concepts.',
        'Coordinated hands-on coding sessions that strengthened departmental technical culture.',
      ],
    },
  ],
  projects: [
    {
      name: 'College Buzz',
      tech: ['React.js', 'Node.js', 'Express.js', 'SQL'],
      bullets: [
        'Built a full-stack college events platform with secure authentication and role-based access control.',
        'Designed REST APIs for event creation, registration, and admin workflows with a normalised SQL schema.',
        'Implemented an admin dashboard for event moderation and real-time participant tracking.',
      ],
      visible: true,
    },
    {
      name: 'Escape Placement Cell',
      tech: ['React.js', 'TypeScript', 'Node.js', 'Express.js'],
      bullets: [
        'Developed a gamified placement preparation platform with interactive coding and aptitude challenges.',
        'Engineered a typed Express backend with modular routing for challenge delivery and progress tracking.',
        'Integrated a scoring engine that surfaced weak areas and recommended targeted practice.',
      ],
      visible: true,
    },
    {
      name: 'Wings Studios',
      tech: ['React.js', 'Tailwind CSS', 'Vite'],
      bullets: [
        'Crafted a portfolio platform for a film production house showcasing visual work across categories.',
        'Built a responsive, component-driven UI with Tailwind CSS and Vite for fast load performance.',
        'Designed an immersive gallery layout with smooth transitions and optimised media delivery.',
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
};

export const TARGET_ROLES: TargetRole[] = [
  'Full Stack Developer',
  'Project / Product Manager',
  'UI/UX Designer',
  'Software Tester / QA',
  'Custom',
];

export const JD_PRESETS: Record<string, string> = {
  'Project Manager': `We are seeking a Project Manager to lead cross-functional software delivery teams.

Responsibilities:
- Define project scope, timelines, and resource allocation across engineering and design teams
- Coordinate sprint planning, track milestones, and report progress to stakeholders
- Facilitate communication between product, engineering, and QA to ensure on-time delivery
- Identify risks early and implement mitigation strategies
- Drive continuous improvement in delivery processes

Requirements:
- Experience managing software projects end-to-end
- Strong stakeholder management and communication skills
- Familiarity with Agile/Scrum methodologies
- Ability to balance technical constraints with business priorities`,

  'Full Stack Developer': `We are hiring a Full Stack Developer to build scalable web applications.

Responsibilities:
- Design and develop full-stack features using React.js and Node.js
- Build and maintain REST APIs with Express.js
- Model and query relational databases (MySQL/PostgreSQL)
- Implement secure authentication and role-based access
- Write clean, tested, and maintainable code

Requirements:
- Strong proficiency in JavaScript and TypeScript
- Experience with React.js and modern frontend tooling
- Backend experience with Node.js and Express.js
- Solid understanding of SQL database design
- Knowledge of Git workflows and CI/CD`,

  'UI/UX Designer': `We are looking for a UI/UX Designer to create intuitive digital experiences.

Responsibilities:
- Design user-centered interfaces across web and mobile platforms
- Create wireframes, prototypes, and high-fidelity mockups in Figma
- Conduct user research and translate insights into design decisions
- Collaborate with developers to ensure design fidelity in implementation
- Maintain and evolve design systems for consistency

Requirements:
- Proficiency in Figma and responsive design principles
- Strong portfolio demonstrating end-to-end design thinking
- Understanding of accessibility and usability best practices
- Ability to balance aesthetics with functional requirements`,

  'Software Tester': `We are seeking a Software Tester / QA Engineer to ensure product quality.

Responsibilities:
- Design and execute manual and automated test cases across the application
- Perform API testing, integration testing, and end-to-end scenario validation
- Identify, document, and track defects through resolution
- Collaborate with developers to reproduce and diagnose issues
- Contribute to CI/CD test automation pipelines

Requirements:
- Experience with software testing methodologies and tools
- Understanding of REST APIs and database validation
- Knowledge of JavaScript/TypeScript for automation
- Strong analytical and detail-oriented mindset
- Familiarity with bug tracking and test management tools`,
};
