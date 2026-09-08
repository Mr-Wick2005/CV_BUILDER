import type { ResumeData, TargetRole } from './types';
import { SAMPLE_PROFILES } from './sample-profiles';

export const MASTER_RESUME: ResumeData = SAMPLE_PROFILES['vedanth-gali'].data;

export const TARGET_ROLES: TargetRole[] = [
  'Full Stack Developer',
  'Frontend Engineer',
  'Backend / Cloud Engineer',
  'AI / Data Scientist',
  'Project / Product Manager',
  'UI/UX Designer',
  'Software Tester / QA',
  'DevOps / SRE',
  'Business Analyst',
  'Custom',
];

export const JD_PRESETS: Record<string, { role: TargetRole; jd: string }> = {
  'Full Stack Developer': {
    role: 'Full Stack Developer',
    jd: `We are seeking a Full Stack Developer to build scalable, high-performance web applications.

Responsibilities:
- Architect and develop responsive, accessible frontend interfaces in React.js and TypeScript.
- Build reliable, secure backend services and REST/GraphQL APIs with Node.js and Express.
- Model, optimize, and maintain relational (PostgreSQL/MySQL) and NoSQL database schemas.
- Implement automated testing (unit, integration) and integrate with CI/CD deployment pipelines.
- Collaborate with product designers and cross-functional engineers in an Agile Scrum environment.

Requirements:
- Strong proficiency in JavaScript/TypeScript, React, Node.js, and modern CSS frameworks (Tailwind).
- Experience with relational databases, indexing, and REST API design.
- Familiarity with Git workflows, Docker, and cloud hosting (AWS / Vercel).
- Passion for clean code, system scalability, and test-driven development.`,
  },

  'AI / Data Scientist': {
    role: 'AI / Data Scientist',
    jd: `We are hiring an AI & Data Science Engineer to develop predictive models and generative AI solutions.

Responsibilities:
- Build and evaluate machine learning and deep learning models using PyTorch, Scikit-Learn, and TensorFlow.
- Design data pipelines for ingestion, transformation, and feature engineering across large datasets.
- Implement retrieval-augmented generation (RAG) pipelines and fine-tune open-source LLMs (Llama, Mistral).
- Perform exploratory data analysis, statistical testing, and create executive visualization dashboards.
- Deploy low-latency model inference endpoints via FastAPI and containerized Docker services.

Requirements:
- Strong programming in Python, SQL, and data science libraries (Pandas, NumPy, Matplotlib).
- Hands-on experience training ML/DL algorithms and evaluating performance metrics (AUC, F1, precision/recall).
- Experience with cloud data platforms (AWS, Snowflake) and MLops tools (MLflow, Weights & Biases).`,
  },

  'Product / Project Manager': {
    role: 'Project / Product Manager',
    jd: `We are looking for an Associate Product / Project Manager to guide product development from discovery to launch.

Responsibilities:
- Define product requirements, user stories, and acceptance criteria in detailed PRDs.
- Prioritize feature backlog and manage sprint planning, standups, and retrospectives in Jira.
- Conduct user interviews, market research, and synthesize data analytics to identify customer pain points.
- Align engineering, design, marketing, and executive stakeholders on milestones and roadmaps.
- Track key performance indicators (KPIs), conversion funnels, and user retention metrics.

Requirements:
- Strong communication, analytical thinking, and cross-functional team leadership.
- Familiarity with Agile/Scrum methodologies, roadmapping tools (Jira, Linear), and Figma.
- Ability to make data-driven decisions using product analytics (Mixpanel, Google Analytics, SQL).`,
  },

  'UI/UX Designer': {
    role: 'UI/UX Designer',
    jd: `We are seeking a UI/UX Designer to craft intuitive, delightful digital product experiences.

Responsibilities:
- Design user flows, wireframes, high-fidelity mockups, and interactive prototypes in Figma.
- Maintain and expand multi-brand design systems with comprehensive component token libraries.
- Conduct usability testing, user interviews, and translate feedback into iterative design improvements.
- Partner closely with frontend developers to ensure pixel-perfect fidelity and WCAG 2.1 AA accessibility.
- Design micro-interactions and motion states that enhance usability and brand delight.

Requirements:
- Portfolio demonstrating strong design thinking, typographic hierarchy, and visual polish.
- Mastery of Figma, auto-layout, prototyping, and responsive layout grids.
- Understanding of frontend constraints (HTML, CSS/Tailwind, React components).`,
  },

  'DevOps / Cloud Engineer': {
    role: 'DevOps / SRE',
    jd: `We are hiring a Cloud / DevOps Engineer to strengthen our infrastructure, CI/CD, and reliability.

Responsibilities:
- Manage cloud infrastructure on AWS/GCP using Infrastructure as Code (Terraform).
- Construct automated CI/CD pipelines using GitHub Actions for continuous testing and zero-downtime deployment.
- Containerize services with Docker and manage orchestration using Kubernetes (K8s).
- Implement monitoring, alerting, and observability dashboards using Prometheus, Grafana, and CloudWatch.
- Ensure cloud security best practices, IAM role management, and backup recovery protocols.

Requirements:
- Proficiency in Linux/Unix, Bash scripting, Python, and Docker containerization.
- Experience with CI/CD automation, cloud architecture (AWS/GCP), and networking fundamentals.`,
  },

  'Software Tester / QA': {
    role: 'Software Tester / QA',
    jd: `We are looking for a QA Engineer / Software Tester to champion automated and manual testing standards.

Responsibilities:
- Formulate comprehensive test plans, test matrices, and automated regression test suites.
- Develop automated end-to-end and API tests using Cypress, Playwright, or Selenium with TypeScript.
- Perform API validation, performance load testing, and database verification.
- Identify, isolate, report, and track bugs through resolution in Jira.
- Integrate automated tests into CI/CD release cycles to prevent production regressions.

Requirements:
- Strong understanding of QA methodologies, defect lifecycles, and test automation frameworks.
- Experience testing REST APIs (Postman) and inspecting web network calls / DOM elements.
- Detail-oriented mindset with strong problem-solving and documentation skills.`,
  },
};
