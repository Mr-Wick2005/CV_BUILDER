import type { ResumeData } from '@/lib/types';

interface ResumeDocumentProps {
  resume: ResumeData;
  sectionOrder: string[];
}

export function ResumeDocument({ resume, sectionOrder }: ResumeDocumentProps) {
  const c = resume.contact;

  const renderSection = (id: string) => {
    switch (id) {
      case 'summary':
        return (
          <section key="summary">
            <h2>Summary</h2>
            <p className="resume-summary">{resume.summary}</p>
          </section>
        );

      case 'skills':
        return (
          <section key="skills">
            <h2>Technical Skills</h2>
            {resume.skills.map((s) => (
              <div key={s.category} className="resume-skill-line">
                <span className="resume-skill-cat">{s.category}:</span>{' '}
                {s.skills.join(', ')}
              </div>
            ))}
          </section>
        );

      case 'projects':
        return (
          <section key="projects">
            <h2>Projects</h2>
            {resume.projects
              .filter((p) => p.visible)
              .map((p) => (
                <div key={p.name} style={{ marginBottom: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="resume-entry-title">{p.name}</span>
                    <span className="resume-dates">{p.tech.join(' / ')}</span>
                  </div>
                  <ul>
                    {p.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
          </section>
        );

      case 'positions':
        return (
          <section key="positions">
            <h2>Positions of Responsibility</h2>
            {resume.positions.map((pos) => (
              <div key={pos.title} style={{ marginBottom: '3px' }}>
                <div className="resume-entry-title">{pos.title}</div>
                <ul>
                  {pos.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        );

      case 'certifications':
        return (
          <section key="certifications">
            <h2>Certifications</h2>
            <ul>
              {resume.certifications.map((cert) => (
                <li key={cert.title}>
                  <span className="resume-entry-title">{cert.title}</span> — {cert.issuer} ({cert.year})
                </li>
              ))}
            </ul>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="resume-sheet">
      {/* Header */}
      <div style={{ textAlign: 'center', borderBottom: '2px solid #1a1a1a', paddingBottom: '6px', marginBottom: '6px' }}>
        <h1>{c.name}</h1>
        <div className="resume-contact" style={{ marginTop: '3px' }}>
          {c.phone} &nbsp;|&nbsp; {c.email} &nbsp;|&nbsp; {c.location}
          <br />
          {c.github} &nbsp;|&nbsp; {c.linkedin}
        </div>
      </div>

      {/* Education */}
      <section>
        <h2>Education</h2>
        {resume.education.map((e) => (
          <div key={e.degree} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="resume-entry-title">{e.degree}</span>
            <span className="resume-dates">{e.dates}</span>
          </div>
        ))}
        <div style={{ fontSize: '9pt', marginTop: '1px' }}>{resume.education[0]?.institution}</div>
      </section>

      {/* Dynamic sections */}
      {sectionOrder.map((id) => renderSection(id))}
    </div>
  );
}
