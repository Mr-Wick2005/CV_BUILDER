'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Plus,
  Trash2,
  Sparkles,
  ExternalLink,
  Loader2,
  Check,
  Globe,
  Github,
  MapPin,
  Mail,
  Phone,
} from 'lucide-react';
import type {
  ResumeData,
  TemplateId,
  FontFamily,
  AccentColor,
  SpacingDensity,
  BulletStyle,
  FontSizeScale,
  SkillCategory,
  ProjectEntry,
  PositionEntry,
  EducationEntry,
  CertificationEntry,
  CustomSection,
  CustomSectionItem,
} from '@/lib/types';

interface ResumeDocumentProps {
  resume: ResumeData;
  sectionOrder: string[];
  onChange?: (updated: ResumeData) => void;
  editable?: boolean;
  onEnhanceBullet?: (bullet: string, updateFn: (enhanced: string) => void, context?: string) => void;
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

// Inline editable text component that blends seamlessly into the A4 document canvas
function InlineEditable({
  value,
  onSave,
  className = '',
  style = {},
  placeholder = 'Type here...',
  multiline = false,
  tag = 'span',
  editable = true,
}: {
  value: string;
  onSave: (val: string) => void;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  multiline?: boolean;
  tag?: 'span' | 'h1' | 'h2' | 'div' | 'p' | 'li';
  editable?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);
  const ref = useRef<any>(null);

  useEffect(() => {
    setText(value);
  }, [value]);

  if (!editable) {
    const Tag = tag;
    return (
      <Tag className={className} style={style}>
        {value || placeholder}
      </Tag>
    );
  }

  const handleBlur = () => {
    setEditing(false);
    if (text !== value) {
      onSave(text.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
      handleBlur();
    }
  };

  if (editing) {
    if (multiline) {
      return (
        <textarea
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          autoFocus
          className={`w-full bg-primary/5 outline-none border border-primary/40 rounded p-1 text-slate-900 resize-y ${className}`}
          style={{ ...style, minHeight: '40px' }}
        />
      );
    }
    return (
      <input
        ref={ref}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
        className={`bg-primary/5 outline-none border-b-2 border-primary rounded-none px-1 text-slate-900 ${className}`}
        style={style}
      />
    );
  }

  const Tag = tag;
  return (
    <Tag
      onClick={() => setEditing(true)}
      title="Click to edit directly on canvas"
      className={`cursor-pointer hover:bg-primary/10 hover:outline hover:outline-1 hover:outline-primary/40 rounded transition-colors ${className}`}
      style={style}
    >
      {value || <span className="text-slate-400 italic">{placeholder}</span>}
    </Tag>
  );
}

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

export function ResumeDocument({
  resume,
  sectionOrder,
  onChange,
  editable = true,
  onEnhanceBullet,
}: ResumeDocumentProps) {
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

  // Balanced density spacing calibrated to fill A4 page gracefully (~90-95% coverage)
  const densityStyles = {
    compact: {
      fontSize: fontScale === 'sm' ? '8.4pt' : fontScale === 'lg' ? '9.6pt' : '9.0pt',
      lineHeight: 1.28,
      sectionMargin: '8px',
      entryMargin: '3px',
      titleSize: fontScale === 'sm' ? '10.2pt' : fontScale === 'lg' ? '11.5pt' : '10.8pt',
      nameSize: fontScale === 'sm' ? '18pt' : fontScale === 'lg' ? '22pt' : '20pt',
    },
    standard: {
      fontSize: fontScale === 'sm' ? '9.0pt' : fontScale === 'lg' ? '10.4pt' : '9.6pt',
      lineHeight: 1.35,
      sectionMargin: '11px',
      entryMargin: '5px',
      titleSize: fontScale === 'sm' ? '10.8pt' : fontScale === 'lg' ? '12.2pt' : '11.4pt',
      nameSize: fontScale === 'sm' ? '20pt' : fontScale === 'lg' ? '24pt' : '22pt',
    },
    relaxed: {
      fontSize: fontScale === 'sm' ? '9.5pt' : fontScale === 'lg' ? '11.0pt' : '10.2pt',
      lineHeight: 1.42,
      sectionMargin: '14px',
      entryMargin: '7px',
      titleSize: fontScale === 'sm' ? '11.4pt' : fontScale === 'lg' ? '13.0pt' : '12.0pt',
      nameSize: fontScale === 'sm' ? '22pt' : fontScale === 'lg' ? '26pt' : '24pt',
    },
  }[density];

  // Helper to push state updates safely
  const updateResume = useCallback(
    (updater: (prev: ResumeData) => ResumeData) => {
      if (onChange) {
        onChange(updater(resume));
      }
    },
    [onChange, resume]
  );

  // Update contact field
  const handleUpdateContact = (field: keyof typeof resume.contact, value: string) => {
    updateResume((prev) => ({
      ...prev,
      contact: { ...prev.contact, [field]: value },
    }));
  };

  // Section Title with full-width thin rule
  const renderSectionTitle = (title: string, sectionKey: string) => {
    if (template === 'modern-tech') {
      return (
        <div
          className="resume-section-title-modern flex items-center gap-2 group relative"
          style={{
            borderLeft: `3.5px solid ${primaryColor}`,
            paddingLeft: '6px',
            marginBottom: '3px',
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
          className="resume-section-title-exec flex items-center justify-between group relative"
          style={{
            borderBottom: `1.5px solid ${primaryColor}`,
            paddingBottom: '2px',
            marginBottom: '3px',
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

    // Default / Harvard ATS: Bold uppercase with thin rule underneath
    return (
      <div
        className="resume-section-header group relative"
        style={{
          borderBottom: `1px solid ${primaryColor}`,
          paddingBottom: '2px',
          marginBottom: '3.5px',
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
          {renderSectionTitle(customSec.sectionTitle, id)}
          {customSec.items.map((item, idx) => (
            <div key={idx} className="resume-entry group relative" style={{ marginBottom: densityStyles.entryMargin }}>
              <div className="flex items-baseline justify-between">
                <InlineEditable
                  value={item.title}
                  onSave={(v) => {
                    updateResume((prev) => {
                      const custom = [...(prev.customSections || [])];
                      const sIdx = custom.findIndex((cs) => cs.id === id);
                      if (sIdx >= 0) {
                        custom[sIdx].items[idx].title = v;
                      }
                      return { ...prev, customSections: custom };
                    });
                  }}
                  className="font-bold text-slate-900"
                  style={{ fontSize: densityStyles.fontSize }}
                  editable={editable}
                />
                {item.date && (
                  <InlineEditable
                    value={item.date}
                    onSave={(v) => {
                      updateResume((prev) => {
                        const custom = [...(prev.customSections || [])];
                        const sIdx = custom.findIndex((cs) => cs.id === id);
                        if (sIdx >= 0) {
                          custom[sIdx].items[idx].date = v;
                        }
                        return { ...prev, customSections: custom };
                      });
                    }}
                    className="font-semibold text-slate-800 whitespace-nowrap ml-2"
                    style={{ fontSize: densityStyles.fontSize }}
                    editable={editable}
                  />
                )}
              </div>
              {item.subtitle && (
                <div className="text-slate-700 italic" style={{ fontSize: densityStyles.fontSize }}>
                  <InlineEditable
                    value={item.subtitle}
                    onSave={(v) => {
                      updateResume((prev) => {
                        const custom = [...(prev.customSections || [])];
                        const sIdx = custom.findIndex((cs) => cs.id === id);
                        if (sIdx >= 0) {
                          custom[sIdx].items[idx].subtitle = v;
                        }
                        return { ...prev, customSections: custom };
                      });
                    }}
                    editable={editable}
                  />
                </div>
              )}
              {item.bullets && item.bullets.length > 0 && (
                <ul className="resume-bullets list-disc pl-4 mt-1">
                  {item.bullets.map((b, bIdx) => (
                    <li
                      key={bIdx}
                      className="text-slate-800 text-justify relative group/bullet"
                      style={{
                        fontSize: densityStyles.fontSize,
                        lineHeight: densityStyles.lineHeight,
                        marginBottom: '1.5px',
                      }}
                    >
                      <InlineEditable
                        value={b}
                        onSave={(newB) => {
                          updateResume((prev) => {
                            const custom = [...(prev.customSections || [])];
                            const sIdx = custom.findIndex((cs) => cs.id === id);
                            if (sIdx >= 0) {
                              custom[sIdx].items[idx].bullets[bIdx] = newB;
                            }
                            return { ...prev, customSections: custom };
                          });
                        }}
                        multiline
                        editable={editable}
                      />
                      {editable && (
                        <span className="no-print opacity-0 group-hover/bullet:opacity-100 inline-flex items-center gap-1 ml-2 transition-opacity">
                          {onEnhanceBullet && (
                            <button
                              type="button"
                              onClick={() =>
                                onEnhanceBullet(b, (enhanced) => {
                                  updateResume((prev) => {
                                    const custom = [...(prev.customSections || [])];
                                    const sIdx = custom.findIndex((cs) => cs.id === id);
                                    if (sIdx >= 0) {
                                      custom[sIdx].items[idx].bullets[bIdx] = enhanced;
                                    }
                                    return { ...prev, customSections: custom };
                                  });
                                })
                              }
                              title="AI Enhance bullet"
                              className="text-primary hover:text-primary/80"
                            >
                              <Sparkles className="h-3 w-3 inline" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              updateResume((prev) => {
                                const custom = [...(prev.customSections || [])];
                                const sIdx = custom.findIndex((cs) => cs.id === id);
                                if (sIdx >= 0) {
                                  custom[sIdx].items[idx].bullets = custom[sIdx].items[idx].bullets.filter(
                                    (_, i) => i !== bIdx
                                  );
                                }
                                return { ...prev, customSections: custom };
                              });
                            }}
                            title="Delete bullet"
                            className="text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="h-3 w-3 inline" />
                          </button>
                        </span>
                      )}
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
            {renderSectionTitle('Summary', 'summary')}
            <div
              className="resume-summary text-justify mt-1 text-slate-800"
              style={{
                fontSize: densityStyles.fontSize,
                lineHeight: densityStyles.lineHeight,
              }}
            >
              <InlineEditable
                value={resume.summary}
                onSave={(v) => updateResume((prev) => ({ ...prev, summary: v }))}
                multiline
                editable={editable}
              />
            </div>
          </section>
        );

      case 'education':
        if (!resume.education || resume.education.length === 0) return null;
        return (
          <section key="education" className="resume-section" style={{ marginTop: densityStyles.sectionMargin }}>
            {renderSectionTitle('Education', 'education')}
            {resume.education.map((e, i) => (
              <div key={i} className="resume-education-entry group relative" style={{ marginBottom: densityStyles.entryMargin }}>
                <div className="flex items-baseline justify-between">
                  <InlineEditable
                    value={e.degree}
                    onSave={(v) => {
                      updateResume((prev) => {
                        const edu = [...prev.education];
                        edu[i].degree = v;
                        return { ...prev, education: edu };
                      });
                    }}
                    className="font-bold text-slate-900"
                    style={{ fontSize: densityStyles.fontSize }}
                    editable={editable}
                  />
                  <InlineEditable
                    value={e.dates}
                    onSave={(v) => {
                      updateResume((prev) => {
                        const edu = [...prev.education];
                        edu[i].dates = v;
                        return { ...prev, education: edu };
                      });
                    }}
                    className="font-semibold text-slate-800 whitespace-nowrap ml-2"
                    style={{ fontSize: densityStyles.fontSize }}
                    editable={editable}
                  />
                </div>
                <div className="flex items-baseline justify-between text-slate-700 mt-0.5" style={{ fontSize: densityStyles.fontSize }}>
                  <InlineEditable
                    value={e.institution}
                    onSave={(v) => {
                      updateResume((prev) => {
                        const edu = [...prev.education];
                        edu[i].institution = v;
                        return { ...prev, education: edu };
                      });
                    }}
                    className="italic"
                    editable={editable}
                  />
                  {e.location && (
                    <InlineEditable
                      value={e.location}
                      onSave={(v) => {
                        updateResume((prev) => {
                          const edu = [...prev.education];
                          edu[i].location = v;
                          return { ...prev, education: edu };
                        });
                      }}
                      className="italic text-slate-600"
                      editable={editable}
                    />
                  )}
                </div>
                {e.gpa && (
                  <div className="text-slate-700 mt-0.5" style={{ fontSize: '8.2pt' }}>
                    <strong>GPA: </strong>
                    <InlineEditable
                      value={e.gpa}
                      onSave={(v) => {
                        updateResume((prev) => {
                          const edu = [...prev.education];
                          edu[i].gpa = v;
                          return { ...prev, education: edu };
                        });
                      }}
                      editable={editable}
                    />
                  </div>
                )}
                {e.coursework && (
                  <div className="text-slate-600 italic mt-0.5" style={{ fontSize: '8.2pt' }}>
                    <strong>Relevant Coursework: </strong>
                    <InlineEditable
                      value={e.coursework}
                      onSave={(v) => {
                        updateResume((prev) => {
                          const edu = [...prev.education];
                          edu[i].coursework = v;
                          return { ...prev, education: edu };
                        });
                      }}
                      editable={editable}
                    />
                  </div>
                )}
              </div>
            ))}
          </section>
        );

      case 'skills': {
        if (!resume.skills || resume.skills.length === 0) return null;

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
            {renderSectionTitle('Technical Skills', 'skills')}
            {isTwoColumn ? (
              <div className="grid grid-cols-2 gap-x-6 mt-1">
                {/* Left Column */}
                <div className="space-y-1">
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
                        <InlineEditable
                          value={s.skills.join(', ')}
                          onSave={(v) => {
                            updateResume((prev) => {
                              const skills = [...prev.skills];
                              const actualIdx = skills.findIndex((item) => item.category === s.category);
                              if (actualIdx >= 0) {
                                skills[actualIdx].skills = v.split(',').map((x) => x.trim()).filter(Boolean);
                              }
                              return { ...prev, skills };
                            });
                          }}
                          className="text-slate-800 font-normal"
                          editable={editable}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Column */}
                <div className="space-y-1">
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
                        <InlineEditable
                          value={s.skills.join(', ')}
                          onSave={(v) => {
                            updateResume((prev) => {
                              const skills = [...prev.skills];
                              const actualIdx = skills.findIndex((item) => item.category === s.category);
                              if (actualIdx >= 0) {
                                skills[actualIdx].skills = v.split(',').map((x) => x.trim()).filter(Boolean);
                              }
                              return { ...prev, skills };
                            });
                          }}
                          className="text-slate-800 font-normal"
                          editable={editable}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-1 mt-1">
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
                      <InlineEditable
                        value={s.skills.join(', ')}
                        onSave={(v) => {
                          updateResume((prev) => {
                            const skills = [...prev.skills];
                            skills[idx].skills = v.split(',').map((x) => x.trim()).filter(Boolean);
                            return { ...prev, skills };
                          });
                        }}
                        className="text-slate-800 font-normal"
                        editable={editable}
                      />
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
            {renderSectionTitle('Positions of Responsibility', 'positions')}
            {resume.positions.map((pos, pIdx) => (
              <div key={pIdx} className="resume-entry group relative" style={{ marginBottom: densityStyles.entryMargin }}>
                <div className="flex items-baseline justify-between">
                  <InlineEditable
                    value={pos.title}
                    onSave={(v) => {
                      updateResume((prev) => {
                        const positions = [...prev.positions];
                        positions[pIdx].title = v;
                        return { ...prev, positions };
                      });
                    }}
                    className="font-bold text-slate-900"
                    style={{ fontSize: densityStyles.fontSize }}
                    editable={editable}
                  />
                  {pos.dates && (
                    <InlineEditable
                      value={pos.dates}
                      onSave={(v) => {
                        updateResume((prev) => {
                          const positions = [...prev.positions];
                          positions[pIdx].dates = v;
                          return { ...prev, positions };
                        });
                      }}
                      className="font-semibold text-slate-800 whitespace-nowrap ml-2"
                      style={{ fontSize: densityStyles.fontSize }}
                      editable={editable}
                    />
                  )}
                </div>
                {pos.organization && (
                  <div className="flex items-baseline justify-between text-slate-700 italic mt-0.5" style={{ fontSize: densityStyles.fontSize }}>
                    <InlineEditable
                      value={pos.organization}
                      onSave={(v) => {
                        updateResume((prev) => {
                          const positions = [...prev.positions];
                          positions[pIdx].organization = v;
                          return { ...prev, positions };
                        });
                      }}
                      editable={editable}
                    />
                    {pos.location && <span className="text-slate-600">{pos.location}</span>}
                  </div>
                )}
                <ul className="resume-bullets list-disc pl-4 mt-1">
                  {pos.bullets.map((b, bIdx) => (
                    <li
                      key={bIdx}
                      className="text-slate-800 text-justify relative group/bullet"
                      style={{
                        fontSize: densityStyles.fontSize,
                        lineHeight: densityStyles.lineHeight,
                        marginBottom: '1.5px',
                      }}
                    >
                      <InlineEditable
                        value={b}
                        onSave={(newB) => {
                          updateResume((prev) => {
                            const positions = [...prev.positions];
                            positions[pIdx].bullets[bIdx] = newB;
                            return { ...prev, positions };
                          });
                        }}
                        multiline
                        editable={editable}
                      />
                      {editable && (
                        <span className="no-print opacity-0 group-hover/bullet:opacity-100 inline-flex items-center gap-1.5 ml-2 transition-opacity">
                          {onEnhanceBullet && (
                            <button
                              type="button"
                              onClick={() =>
                                onEnhanceBullet(b, (enhanced) => {
                                  updateResume((prev) => {
                                    const positions = [...prev.positions];
                                    positions[pIdx].bullets[bIdx] = enhanced;
                                    return { ...prev, positions };
                                  });
                                }, pos.title)
                              }
                              title="AI Enhance bullet (STAR)"
                              className="text-primary hover:text-primary/80"
                            >
                              <Sparkles className="h-3 w-3 inline" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              updateResume((prev) => {
                                const positions = [...prev.positions];
                                positions[pIdx].bullets = positions[pIdx].bullets.filter((_, i) => i !== bIdx);
                                return { ...prev, positions };
                              });
                            }}
                            title="Delete bullet"
                            className="text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="h-3 w-3 inline" />
                          </button>
                        </span>
                      )}
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
            {renderSectionTitle('Projects', 'projects')}
            {visibleProjects.map((p, pIdx) => {
              const actualIdx = resume.projects.findIndex((proj) => proj.name === p.name);
              return (
                <div key={pIdx} className="resume-entry group relative" style={{ marginBottom: densityStyles.entryMargin }}>
                  <div className="flex items-baseline justify-between flex-wrap gap-y-0.5">
                    {/* Project Name & Tech Stack */}
                    <div className="flex items-baseline flex-wrap gap-1">
                      <InlineEditable
                        value={p.name}
                        onSave={(v) => {
                          updateResume((prev) => {
                            const projects = [...prev.projects];
                            if (actualIdx >= 0) projects[actualIdx].name = v;
                            return { ...prev, projects };
                          });
                        }}
                        className="font-bold text-slate-900 underline decoration-slate-400"
                        style={{ fontSize: densityStyles.fontSize }}
                        editable={editable}
                      />

                      {p.tech && p.tech.length > 0 && (
                        <>
                          <span className="text-slate-400 font-normal px-0.5">|</span>
                          <InlineEditable
                            value={p.tech.join(', ')}
                            onSave={(v) => {
                              updateResume((prev) => {
                                const projects = [...prev.projects];
                                if (actualIdx >= 0) {
                                  projects[actualIdx].tech = v.split(',').map((x) => x.trim()).filter(Boolean);
                                }
                                return { ...prev, projects };
                              });
                            }}
                            className="font-normal text-slate-700"
                            style={{ fontSize: densityStyles.fontSize }}
                            editable={editable}
                          />
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

                  <ul className="resume-bullets list-disc pl-4 mt-1">
                    {p.bullets.map((b, bIdx) => (
                      <li
                        key={bIdx}
                        className="text-slate-800 text-justify relative group/bullet"
                        style={{
                          fontSize: densityStyles.fontSize,
                          lineHeight: densityStyles.lineHeight,
                          marginBottom: '1.5px',
                        }}
                      >
                        <InlineEditable
                          value={b}
                          onSave={(newB) => {
                            updateResume((prev) => {
                              const projects = [...prev.projects];
                              if (actualIdx >= 0) {
                                projects[actualIdx].bullets[bIdx] = newB;
                              }
                              return { ...prev, projects };
                            });
                          }}
                          multiline
                          editable={editable}
                        />
                        {editable && (
                          <span className="no-print opacity-0 group-hover/bullet:opacity-100 inline-flex items-center gap-1.5 ml-2 transition-opacity">
                            {onEnhanceBullet && (
                              <button
                                type="button"
                                onClick={() =>
                                  onEnhanceBullet(b, (enhanced) => {
                                    updateResume((prev) => {
                                      const projects = [...prev.projects];
                                      if (actualIdx >= 0) {
                                        projects[actualIdx].bullets[bIdx] = enhanced;
                                      }
                                      return { ...prev, projects };
                                    });
                                  }, p.name)
                                }
                                title="AI Enhance bullet (STAR)"
                                className="text-primary hover:text-primary/80"
                              >
                                <Sparkles className="h-3 w-3 inline" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                updateResume((prev) => {
                                  const projects = [...prev.projects];
                                  if (actualIdx >= 0) {
                                    projects[actualIdx].bullets = projects[actualIdx].bullets.filter((_, i) => i !== bIdx);
                                  }
                                  return { ...prev, projects };
                                });
                              }}
                              title="Delete bullet"
                              className="text-rose-500 hover:text-rose-700"
                            >
                              <Trash2 className="h-3 w-3 inline" />
                            </button>
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </section>
        );
      }

      case 'certifications':
        if (!resume.certifications || resume.certifications.length === 0) return null;
        return (
          <section key="certifications" className="resume-section" style={{ marginTop: densityStyles.sectionMargin }}>
            {renderSectionTitle('Certifications', 'certifications')}
            <ul className="resume-bullets list-disc pl-4 space-y-0.5 mt-1">
              {resume.certifications.map((cert, cIdx) => (
                <li
                  key={cIdx}
                  className="text-slate-800"
                  style={{
                    fontSize: densityStyles.fontSize,
                    lineHeight: densityStyles.lineHeight,
                  }}
                >
                  <InlineEditable
                    value={cert.title}
                    onSave={(v) => {
                      updateResume((prev) => {
                        const certifications = [...prev.certifications];
                        certifications[cIdx].title = v;
                        return { ...prev, certifications };
                      });
                    }}
                    className="font-bold text-slate-900"
                    editable={editable}
                  />
                  {cert.issuer && (
                    <span className="text-slate-700">
                      {' '}—{' '}
                      <InlineEditable
                        value={cert.issuer}
                        onSave={(v) => {
                          updateResume((prev) => {
                            const certifications = [...prev.certifications];
                            certifications[cIdx].issuer = v;
                            return { ...prev, certifications };
                          });
                        }}
                        editable={editable}
                      />
                    </span>
                  )}
                  {cert.year && (
                    <span className="text-slate-600 font-medium">
                      {' '}|{' '}
                      <InlineEditable
                        value={cert.year}
                        onSave={(v) => {
                          updateResume((prev) => {
                            const certifications = [...prev.certifications];
                            certifications[cIdx].year = v;
                            return { ...prev, certifications };
                          });
                        }}
                        editable={editable}
                      />
                    </span>
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
      className={`resume-sheet template-${template} relative bg-white shadow-2xl transition-all duration-200`}
      style={{
        fontFamily,
        color: '#0f172a',
        width: '210mm',
        minHeight: '297mm',
        boxSizing: 'border-box',
        padding: '12mm 15mm',
      }}
    >
      {/* Candidate Header */}
      <div className={`resume-header template-${template}-header relative pb-1`}>
        {/* Location badge on top right */}
        {displayLocation && (
          <div
            className="resume-location-badge absolute right-0 top-0 text-slate-700 font-normal"
            style={{ fontSize: '8.4pt' }}
          >
            <InlineEditable
              value={displayLocation}
              onSave={(v) => handleUpdateContact('location', v)}
              placeholder="City, Country"
              editable={editable}
            />
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
          <InlineEditable
            value={displayName}
            onSave={(v) => handleUpdateContact('name', v)}
            placeholder="YOUR NAME"
            tag="h1"
            editable={editable}
          />
        </h1>

        {/* Optional Headline */}
        {c.headline && (
          <div
            className={`resume-headline text-slate-700 font-semibold tracking-wide uppercase ${
              template === 'modern-tech' || template === 'executive-slate' ? 'text-left' : 'text-center'
            } mt-0.5`}
            style={{ fontSize: '8.8pt', color: baseColor.secondary }}
          >
            <InlineEditable
              value={c.headline}
              onSave={(v) => handleUpdateContact('headline', v)}
              placeholder="Professional Headline"
              editable={editable}
            />
          </div>
        )}

        {/* Single Contact Row with Divider Pipes and Clickable Links */}
        <div
          className={`resume-contact-bar flex items-center ${
            template === 'modern-tech' || template === 'executive-slate' ? 'justify-start' : 'justify-center'
          } flex-wrap gap-x-2.5 gap-y-1 mt-1.5 text-slate-800`}
          style={{ fontSize: '8.6pt' }}
        >
          {c.phone && (
            <InlineEditable
              value={c.phone}
              onSave={(v) => handleUpdateContact('phone', v)}
              placeholder="+1 555-0000"
              className="resume-contact-item font-medium"
              editable={editable}
            />
          )}

          {c.phone && c.email && (
            <span className="resume-contact-pipe text-slate-400 font-light">|</span>
          )}

          {c.email && (
            <InlineEditable
              value={c.email}
              onSave={(v) => handleUpdateContact('email', v)}
              placeholder="email@domain.com"
              className="resume-contact-link font-medium text-slate-900"
              editable={editable}
            />
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
        </div>
      </div>

      {/* Render All Resume Sections in Order */}
      <div className="resume-body space-y-1">
        {sectionOrder.map((id) => renderSection(id))}
      </div>
    </div>
  );
}
