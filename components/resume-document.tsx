'use client';

import type {
  ResumeData,
  TemplateId,
  FontFamily,
  AccentColor,
  SpacingDensity,
  BulletStyle,
  FontSizeScale,
  SkillCategory,
} from '@/lib/types';

interface ResumeDocumentProps {
  resume: ResumeData;
  sectionOrder: string[];
}

const ACCENT_COLOR_MAP: Record<AccentColor, { primary: string; secondary: string; lightBg: string; border: string }> = {
  slate: { primary: '#0f172a', secondary: '#334155', lightBg: '#f8fafc', border: '#cbd5e1' },
  sapphire: { primary: '#1e3a8a', secondary: '#2563eb', lightBg: '#eff6ff', border: '#bfdbfe' },
  emerald: { primary: '#064e3b', secondary: '#059669', lightBg: '#ecfdf5', border: '#a7f3d0' },
  crimson: { primary: '#881337', secondary: '#dc2626', lightBg: '#fef2f2', border: '#fecaca' },
  royal: { primary: '#4c1d95', secondary: '#7c3aed', lightBg: '#faf5ff', border: '#ddd6fe' },
  charcoal: { primary: '#111827', secondary: '#374151', lightBg: '#f9fafb', border: '#e5e7eb' },
};

const FONT_MAP: Record<FontFamily, string> = {
  inter: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  merriweather: "'Merriweather', 'Georgia', 'Times New Roman', serif",
  outfit: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif",
  roboto: "'Roboto', -apple-system, BlinkMacSystemFont, sans-serif",
  jetbrains: "'JetBrains Mono', monospace",
};

const BULLET_MAP: Record<BulletStyle, string> = {
  disc: '•',
  dash: '–',
  square: '▪',
  circle: '◦',
};

// Auto-bold metrics and key action numbers if boldKeywords is active
function formatBulletText(text: string, boldKeywords?: boolean) {
  if (!boldKeywords) return text;
  const parts = text.split(/(\b\d+(?:\.\d+)?(?:%|\+|k|x|ms|s|M|B)?\b|\$\d+(?:,\d+)?)/g);
  return parts.map((part, i) => {
    if (/^(\d+(?:\.\d+)?(?:%|\+|k|x|ms|s|M|B)?|\$\d+(?:,\d+)?)$/.test(part) && part.length > 1) {
      return (
        <strong key={i} className="font-semibold text-slate-950">
          {part}
        </strong>
      );
    }
    return part;
  });
}

export function ResumeDocument({ resume, sectionOrder }: ResumeDocumentProps) {
  const c = resume.contact;
  const style = resume.style || {
    template: 'harvard-ats',
    fontFamily: 'inter',
    accentColor: 'slate',
    density: 'standard',
    showIcons: true,
    highlightKeywords: false,
    boldKeywords: false,
    bulletStyle: 'disc',
  };

  const template: TemplateId = style.template || 'harvard-ats';
  const fontFamily = FONT_MAP[style.fontFamily || 'inter'];
  const baseColor = ACCENT_COLOR_MAP[style.accentColor as AccentColor] || ACCENT_COLOR_MAP.slate;
  const primaryColor = style.customColor || baseColor.primary;
  const density: SpacingDensity = style.density || 'standard';
  const bulletChar = BULLET_MAP[style.bulletStyle || 'disc'];
  const boldKeywords = style.boldKeywords ?? false;
  const fontScale: FontSizeScale = style.fontSizeScale || 'base';

  // Candidate Name
  const displayName = (c.name || 'YOUR NAME').trim().toUpperCase();

  // Location
  const displayLocation = (c.location || '').trim();

  // Density spacing calibrated for single-page A4
  const densityStyles = {
    compact: {
      fontSize: fontScale === 'sm' ? '7.8pt' : fontScale === 'lg' ? '9.0pt' : '8.4pt',
      lineHeight: 1.22,
      sectionMargin: '3px',
      entryMargin: '1.5px',
      titleSize: fontScale === 'sm' ? '10.0pt' : fontScale === 'lg' ? '11.5pt' : '10.8pt',
      nameSize: fontScale === 'sm' ? '25pt' : fontScale === 'lg' ? '30pt' : '27pt',
    },
    standard: {
      fontSize: fontScale === 'sm' ? '8.4pt' : fontScale === 'lg' ? '9.8pt' : '9.2pt',
      lineHeight: 1.28,
      sectionMargin: '4px',
      entryMargin: '2px',
      titleSize: fontScale === 'sm' ? '11.0pt' : fontScale === 'lg' ? '12.5pt' : '11.8pt',
      nameSize: fontScale === 'sm' ? '28pt' : fontScale === 'lg' ? '34pt' : '31.5pt',
    },
    relaxed: {
      fontSize: fontScale === 'sm' ? '9.0pt' : fontScale === 'lg' ? '10.5pt' : '9.8pt',
      lineHeight: 1.34,
      sectionMargin: '6px',
      entryMargin: '3px',
      titleSize: fontScale === 'sm' ? '11.8pt' : fontScale === 'lg' ? '13.2pt' : '12.5pt',
      nameSize: fontScale === 'sm' ? '30pt' : fontScale === 'lg' ? '36pt' : '33.5pt',
    },
  }[density];

  // Section Title with full-width thin rule
  const renderSectionTitle = (title: string) => {
    if (template === 'modern-tech') {
      return (
        <div
          className="resume-section-title-modern flex items-center gap-2"
          style={{
            borderLeft: `3.5px solid ${primaryColor}`,
            paddingLeft: '6px',
            marginBottom: '2.5px',
          }}
        >
          <span
            className="font-bold uppercase tracking-wider"
            style={{
              fontSize: densityStyles.titleSize,
              color: primaryColor,
            }}
          >
            {title}
          </span>
        </div>
      );
    }

    if (template === 'executive-slate') {
      return (
        <div
          className="resume-section-title-exec flex items-center justify-between"
          style={{
            borderBottom: `1.5px solid ${primaryColor}`,
            paddingBottom: '1.5px',
            marginBottom: '2.5px',
          }}
        >
          <span
            className="font-bold uppercase tracking-wide"
            style={{
              fontSize: densityStyles.titleSize,
              color: primaryColor,
            }}
          >
            {title}
          </span>
          <span className="h-1 w-8 rounded-full" style={{ backgroundColor: primaryColor }} />
        </div>
      );
    }

    // Default / Harvard ATS / Classic ATS: Bold uppercase with thin rule underneath
    return (
      <div
        className="resume-section-header"
        style={{
          borderBottom: `1px solid ${primaryColor}`,
          paddingBottom: '1px',
          marginBottom: '2.5px',
          marginTop: '0px',
        }}
      >
        <h2
          className="resume-section-title font-bold uppercase tracking-wider"
          style={{
            fontSize: densityStyles.titleSize,
            color: primaryColor,
            margin: 0,
            padding: 0,
          }}
        >
          {title}
        </h2>
      </div>
    );
  };

  const renderSection = (id: string) => {
    // Custom sections
    if (id.startsWith('custom-')) {
      const customSec = resume.customSections?.find((cs) => cs.id === id);
      if (!customSec || customSec.items.length === 0) return null;

      return (
        <section key={customSec.id} className="resume-section" style={{ marginTop: densityStyles.sectionMargin }}>
          {renderSectionTitle(customSec.sectionTitle)}
          {customSec.items.map((item, idx) => (
            <div key={idx} className="resume-entry" style={{ marginBottom: densityStyles.entryMargin }}>
              <div className="flex items-baseline justify-between">
                <span className="font-bold text-slate-900" style={{ fontSize: densityStyles.fontSize }}>
                  {item.title}
                </span>
                {item.date && (
                  <span className="font-semibold text-slate-800 whitespace-nowrap" style={{ fontSize: densityStyles.fontSize }}>
                    {item.date}
                  </span>
                )}
              </div>
              {item.subtitle && (
                <div className="text-slate-700 italic" style={{ fontSize: densityStyles.fontSize }}>
                  {item.subtitle}
                </div>
              )}
              {item.bullets && item.bullets.length > 0 && (
                <ul className="resume-bullets list-disc pl-4 mt-0.5">
                  {item.bullets.map((b, bIdx) => (
                    <li
                      key={bIdx}
                      className="text-slate-800 text-justify"
                      style={{
                        fontSize: densityStyles.fontSize,
                        lineHeight: densityStyles.lineHeight,
                        marginBottom: '1px',
                      }}
                    >
                      {formatBulletText(b, boldKeywords)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      );
    }

    switch (id) {
      case 'summary':
        if (!resume.summary) return null;
        return (
          <section key="summary" className="resume-section" style={{ marginTop: densityStyles.sectionMargin }}>
            {renderSectionTitle('Summary')}
            <p
              className="resume-summary text-justify"
              style={{
                fontSize: densityStyles.fontSize,
                lineHeight: densityStyles.lineHeight,
                color: '#1e293b',
                marginTop: '1.5px',
              }}
            >
              {resume.summary}
            </p>
          </section>
        );

      case 'education':
        if (!resume.education || resume.education.length === 0) return null;
        return (
          <section key="education" className="resume-section" style={{ marginTop: densityStyles.sectionMargin }}>
            {renderSectionTitle('Education')}
            {resume.education.map((e, i) => (
              <div key={i} className="resume-education-entry" style={{ marginBottom: densityStyles.entryMargin }}>
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-slate-900" style={{ fontSize: densityStyles.fontSize }}>
                    {e.degree}
                  </span>
                  <span className="font-semibold text-slate-800 whitespace-nowrap ml-2" style={{ fontSize: densityStyles.fontSize }}>
                    {e.dates}
                  </span>
                </div>
                <div className="flex items-baseline justify-between text-slate-700" style={{ fontSize: densityStyles.fontSize }}>
                  <span className="italic">{e.institution}</span>
                  {e.location && <span className="italic text-slate-600">{e.location}</span>}
                </div>
                {e.gpa && (
                  <div className="text-slate-700" style={{ fontSize: '7.5pt' }}>
                    <strong>GPA:</strong> {e.gpa}
                  </div>
                )}
                {e.coursework && (
                  <div className="text-slate-600 italic" style={{ fontSize: '7.5pt' }}>
                    <strong>Relevant Coursework:</strong> {e.coursework}
                  </div>
                )}
              </div>
            ))}
          </section>
        );

      case 'skills': {
        if (!resume.skills || resume.skills.length === 0) return null;

        // Two-Column Technical Skills Layout
        const hasExplicitColumns = resume.skills.some((s) => s.column === 2);
        let col1Skills: SkillCategory[] = [];
        let col2Skills: SkillCategory[] = [];

        if (hasExplicitColumns) {
          col1Skills = resume.skills.filter((s) => s.column !== 2);
          col2Skills = resume.skills.filter((s) => s.column === 2);
        } else if (resume.skills.length >= 4) {
          const mid = Math.ceil(resume.skills.length / 2);
          col1Skills = resume.skills.slice(0, mid);
          col2Skills = resume.skills.slice(mid);
        } else {
          col1Skills = resume.skills;
        }

        const isTwoColumn = col2Skills.length > 0;

        return (
          <section key="skills" className="resume-section" style={{ marginTop: densityStyles.sectionMargin }}>
            {renderSectionTitle('Technical Skills')}
            {isTwoColumn ? (
              <div className="grid grid-cols-2 gap-x-6 mt-1">
                {/* Left Column */}
                <div className="space-y-0.5">
                  {col1Skills.map((s, idx) => (
                    <div
                      key={idx}
                      className="flex items-baseline text-justify"
                      style={{
                        fontSize: densityStyles.fontSize,
                        lineHeight: densityStyles.lineHeight,
                      }}
                    >
                      <span className="text-slate-800 mr-1.5 font-bold shrink-0">{bulletChar}</span>
                      <div>
                        <span className="font-bold text-slate-900 mr-1">{s.category}:</span>
                        <span className="text-slate-800 font-normal">{s.skills.join(', ')}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Column */}
                <div className="space-y-0.5">
                  {col2Skills.map((s, idx) => (
                    <div
                      key={idx}
                      className="flex items-baseline text-justify"
                      style={{
                        fontSize: densityStyles.fontSize,
                        lineHeight: densityStyles.lineHeight,
                      }}
                    >
                      <span className="text-slate-800 mr-1.5 font-bold shrink-0">{bulletChar}</span>
                      <div>
                        <span className="font-bold text-slate-900 mr-1">{s.category}:</span>
                        <span className="text-slate-800 font-normal">{s.skills.join(', ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-0.5 mt-1">
                {col1Skills.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex items-baseline text-justify"
                    style={{
                      fontSize: densityStyles.fontSize,
                      lineHeight: densityStyles.lineHeight,
                    }}
                  >
                    <span className="text-slate-800 mr-1.5 font-bold shrink-0">{bulletChar}</span>
                    <div>
                      <span className="font-bold text-slate-900 mr-1">{s.category}:</span>
                      <span className="text-slate-800 font-normal">{s.skills.join(', ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      }

      case 'positions':
        if (!resume.positions || resume.positions.length === 0) return null;
        return (
          <section key="positions" className="resume-section" style={{ marginTop: densityStyles.sectionMargin }}>
            {renderSectionTitle('Positions of Responsibility')}
            {resume.positions.map((pos, pIdx) => (
              <div key={pIdx} className="resume-entry" style={{ marginBottom: densityStyles.entryMargin }}>
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-slate-900" style={{ fontSize: densityStyles.fontSize }}>
                    {pos.title}
                  </span>
                  {pos.dates && (
                    <span className="font-semibold text-slate-800 whitespace-nowrap ml-2" style={{ fontSize: densityStyles.fontSize }}>
                      {pos.dates}
                    </span>
                  )}
                </div>
                {pos.organization && (
                  <div className="flex items-baseline justify-between text-slate-700 italic" style={{ fontSize: densityStyles.fontSize }}>
                    <span>{pos.organization}</span>
                    {pos.location && <span className="text-slate-600">{pos.location}</span>}
                  </div>
                )}
                <ul className="resume-bullets list-disc pl-4 mt-0.5">
                  {pos.bullets.map((b, bIdx) => (
                    <li
                      key={bIdx}
                      className="text-slate-800 text-justify"
                      style={{
                        fontSize: densityStyles.fontSize,
                        lineHeight: densityStyles.lineHeight,
                        marginBottom: '1px',
                      }}
                    >
                      {formatBulletText(b, boldKeywords)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        );

      case 'projects': {
        if (!resume.projects || resume.projects.length === 0) return null;
        const visibleProjects = resume.projects.filter((p) => p.visible !== false);
        if (visibleProjects.length === 0) return null;

        return (
          <section key="projects" className="resume-section" style={{ marginTop: densityStyles.sectionMargin }}>
            {renderSectionTitle('Projects')}
            {visibleProjects.map((p, pIdx) => (
              <div key={pIdx} className="resume-entry" style={{ marginBottom: densityStyles.entryMargin }}>
                <div className="flex items-baseline justify-between flex-wrap gap-y-0.5">
                  {/* Project Name & Tech Stack */}
                  <div className="flex items-baseline flex-wrap gap-1">
                    {p.link ? (
                      <a
                        href={p.link.startsWith('http') ? p.link : `https://${p.link}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-slate-900 underline decoration-slate-400 hover:text-primary transition-colors"
                        style={{ fontSize: densityStyles.fontSize }}
                      >
                        {p.name}
                      </a>
                    ) : (
                      <span
                        className="font-bold text-slate-900 underline decoration-slate-400"
                        style={{ fontSize: densityStyles.fontSize }}
                      >
                        {p.name}
                      </span>
                    )}

                    {p.tech && p.tech.length > 0 && (
                      <>
                        <span className="text-slate-400 font-normal px-0.5">|</span>
                        <span className="font-normal text-slate-700" style={{ fontSize: densityStyles.fontSize }}>
                          {p.tech.join(', ')}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Links & Date */}
                  <div className="flex items-center gap-2">
                    {p.link && (
                      <a
                        href={p.link.startsWith('http') ? p.link : `https://${p.link}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-0.5 text-slate-700 hover:text-primary underline text-[7.5pt]"
                      >
                        <span>Demo ↗</span>
                      </a>
                    )}
                    {p.github && (
                      <a
                        href={p.github.startsWith('http') ? p.github : `https://${p.github}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-0.5 text-slate-700 hover:text-primary underline text-[7.5pt]"
                      >
                        <span>Code ↗</span>
                      </a>
                    )}
                    {p.date && (
                      <span className="text-[7.5pt] text-slate-500 font-medium">
                        {p.date}
                      </span>
                    )}
                  </div>
                </div>

                <ul className="resume-bullets list-disc pl-4 mt-0.5">
                  {p.bullets.map((b, bIdx) => (
                    <li
                      key={bIdx}
                      className="text-slate-800 text-justify"
                      style={{
                        fontSize: densityStyles.fontSize,
                        lineHeight: densityStyles.lineHeight,
                        marginBottom: '1px',
                      }}
                    >
                      {formatBulletText(b, boldKeywords)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        );
      }

      case 'certifications':
        if (!resume.certifications || resume.certifications.length === 0) return null;
        return (
          <section key="certifications" className="resume-section" style={{ marginTop: densityStyles.sectionMargin }}>
            {renderSectionTitle('Certifications')}
            <ul className="resume-bullets list-disc pl-4 space-y-0.5 mt-0.5">
              {resume.certifications.map((cert, cIdx) => (
                <li
                  key={cIdx}
                  className="text-slate-800"
                  style={{
                    fontSize: densityStyles.fontSize,
                    lineHeight: densityStyles.lineHeight,
                  }}
                >
                  <span className="font-bold text-slate-900">{cert.title}</span>
                  {cert.issuer && (
                    <span className="text-slate-700"> — {cert.issuer}</span>
                  )}
                  {cert.year && (
                    <span className="text-slate-600 font-medium"> | {cert.year}</span>
                  )}
                  {cert.link && (
                    <a
                      href={cert.link.startsWith('http') ? cert.link : `https://${cert.link}`}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-1.5 text-[7.5pt] text-primary hover:underline"
                    >
                      Verify ↗
                    </a>
                  )}
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
    <div
      className={`resume-sheet template-${template} relative bg-white shadow-xl`}
      style={{
        fontFamily,
        color: '#0f172a',
        width: '794px',
        minHeight: '1123px',
        boxSizing: 'border-box',
        padding: '28px 36px',
      }}
    >
      {/* Candidate Header */}
      <div className={`resume-header template-${template}-header relative pb-1`}>
        {/* Location small on top right */}
        {displayLocation && (
          <div
            className="resume-location-badge absolute right-0 top-0 text-slate-700 font-normal"
            style={{ fontSize: '8.0pt' }}
          >
            {displayLocation}
          </div>
        )}

        {/* Large Prominent Candidate Name */}
        <h1
          className={`resume-name font-extrabold uppercase tracking-wide text-slate-900 ${
            template === 'modern-tech' || template === 'executive-slate' ? 'text-left' : 'text-center'
          } leading-tight pt-1`}
          style={{
            fontSize: densityStyles.nameSize,
            color: primaryColor,
          }}
        >
          {displayName}
        </h1>

        {/* Optional Headline */}
        {c.headline && (
          <div
            className={`resume-headline text-slate-700 font-semibold tracking-wide uppercase ${
              template === 'modern-tech' || template === 'executive-slate' ? 'text-left' : 'text-center'
            } mt-0.5`}
            style={{ fontSize: '8.5pt', color: baseColor.secondary }}
          >
            {c.headline}
          </div>
        )}

        {/* Single Contact Row with Divider Pipes and Clickable Links */}
        <div
          className={`resume-contact-bar flex items-center ${
            template === 'modern-tech' || template === 'executive-slate' ? 'justify-start' : 'justify-center'
          } flex-wrap gap-x-2.5 gap-y-1 mt-1.5 text-slate-800`}
          style={{ fontSize: '8.4pt' }}
        >
          {c.phone && (
            <span className="resume-contact-item font-medium">
              {c.phone}
            </span>
          )}

          {c.phone && c.email && (
            <span className="resume-contact-pipe text-slate-400 font-light">|</span>
          )}

          {c.email && (
            <a
              href={`mailto:${c.email}`}
              className="resume-contact-link font-medium text-slate-900 hover:underline"
            >
              {c.email}
            </a>
          )}

          {c.linkedin && (
            <>
              <span className="resume-contact-pipe text-slate-400 font-light">|</span>
              <a
                href={c.linkedin.startsWith('http') ? c.linkedin : `https://${c.linkedin}`}
                target="_blank"
                rel="noreferrer"
                className="resume-social-link inline-flex items-center gap-1 font-medium text-slate-900 hover:underline"
              >
                <svg className="w-2.5 h-2.5 text-slate-800 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.45 1.45 0 0 0 1.45-1.45 1.45 1.45 0 0 0-1.45-1.45A1.45 1.45 0 0 0 5 7.31c0 .8.65 1.45 1.46 1.45m1.39 9.97v-8.37H5.07v8.37h2.78z" />
                </svg>
                <span>LinkedIn</span>
              </a>
            </>
          )}

          {c.github && (
            <>
              <span className="resume-contact-pipe text-slate-400 font-light">|</span>
              <a
                href={c.github.startsWith('http') ? c.github : `https://${c.github}`}
                target="_blank"
                rel="noreferrer"
                className="resume-social-link inline-flex items-center gap-1 font-medium text-slate-900 hover:underline"
              >
                <svg className="w-2.5 h-2.5 text-slate-800 fill-current shrink-0" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
                <span>GitHub</span>
              </a>
            </>
          )}

          {c.portfolio && (
            <>
              <span className="resume-contact-pipe text-slate-400 font-light">|</span>
              <a
                href={c.portfolio.startsWith('http') ? c.portfolio : `https://${c.portfolio}`}
                target="_blank"
                rel="noreferrer"
                className="resume-social-link font-medium text-slate-900 hover:underline"
              >
                <span>Portfolio</span>
              </a>
            </>
          )}

          {c.website && (
            <>
              <span className="resume-contact-pipe text-slate-400 font-light">|</span>
              <a
                href={c.website.startsWith('http') ? c.website : `https://${c.website}`}
                target="_blank"
                rel="noreferrer"
                className="resume-social-link font-medium text-slate-900 hover:underline"
              >
                <span>Website</span>
              </a>
            </>
          )}
        </div>
      </div>

      {/* Render All Resume Sections in Order */}
      <div className="resume-body space-y-1">
        {sectionOrder.map((id) => renderSection(id))}
      </div>
    </div>
  );
}
