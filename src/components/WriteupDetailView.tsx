import React, { useState, useMemo } from 'react';
import { Writeup, getPrimaryCategory, getAllCategories, AttackTimelineEvent, formatWriteupDate } from '../types';
import { 
  ArrowLeft, 
  Share2, 
  Copy, 
  Check, 
  Download, 
  Shield, 
  Terminal, 
  FileCode, 
  Database, 
  Clock, 
  Calendar,
  AlertTriangle,
  Info,
  ShieldAlert,
  Lightbulb,
  AlertOctagon,
  Quote
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { VerticalReadingProgress, ProgressSectionItem } from './VerticalReadingProgress';
import { TerminalCodeBlock } from './TerminalCodeBlock';
import { AttackTimelineViewer } from './AttackTimelineViewer';

interface WriteupDetailViewProps {
  writeup: Writeup;
  onBack: () => void;
  onSelectOtherWriteup?: (w: Writeup) => void;
  allWriteups: Writeup[];
}

const slugify = (text: string) => {
  return 'heading-' + text
    .replace(/[*_`\[\]]/g, '')
    .replace(/\(http[^)]+\)/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const extractNodeText = (node: any): string => {
  if (!node) return '';
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractNodeText).join('');
  }
  if (typeof node === 'object' && node.props && node.props.children) {
    return extractNodeText(node.props.children);
  }
  return '';
};

// Helper: Parse markdown table into timeline events if not present in writeup object
const parseTimelineFromMarkdown = (markdown: string): AttackTimelineEvent[] => {
  if (!markdown) return [];
  const events: AttackTimelineEvent[] = [];

  let tableText = markdown;
  const blockMatch = markdown.match(/<!--\s*ATTACK_TIMELINE_START\s*-->([\s\S]*?)<!--\s*ATTACK_TIMELINE_END\s*-->/i);
  if (blockMatch) {
    tableText = blockMatch[1];
  }

  const lines = tableText.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) continue;
    if (/Timestamp/i.test(trimmed) || /:---/i.test(trimmed)) continue;

    const cols = trimmed.slice(1, -1).split('|').map(c => c.trim());
    if (cols.length >= 3) {
      const rawTime = cols[0].replace(/[`*]/g, '').trim();
      const rawPhase = cols[1];
      const rawDesc = cols[2];
      const rawSev = cols[3] ? cols[3].replace(/[`*]/g, '').trim().toLowerCase() : 'high';

      let phase = 'Execution';
      let techniqueId: string | undefined = undefined;

      const phaseMatch = rawPhase.match(/\[([^\]]+)\]/);
      if (phaseMatch) {
        phase = phaseMatch[1].trim();
      } else {
        phase = rawPhase.replace(/[`*]/g, '').trim();
      }

      const techMatch = rawPhase.match(/(T\d{4}(?:\.\d{3})?)/);
      if (techMatch) {
        techniqueId = techMatch[1];
      }

      let title = rawDesc;
      let description = '';
      if (rawDesc.includes('<br>')) {
        const parts = rawDesc.split('<br>');
        title = parts[0].replace(/[*_]/g, '').trim();
        description = parts.slice(1).join('\n').trim();
      } else if (rawDesc.includes('\n')) {
        const parts = rawDesc.split('\n');
        title = parts[0].replace(/[*_]/g, '').trim();
        description = parts.slice(1).join('\n').trim();
      } else {
        title = rawDesc.replace(/[*_]/g, '').trim();
      }

      const validSevs = ['critical', 'high', 'medium', 'low', 'info'];
      const severity = validSevs.includes(rawSev) ? (rawSev as any) : 'high';

      events.push({
        id: `evt-${events.length + 1}`,
        time: rawTime,
        phase,
        title,
        description,
        severity,
        techniqueId
      });
    }
  }

  return events;
};

export const WriteupDetailView: React.FC<WriteupDetailViewProps> = ({
  writeup,
  onBack,
  onSelectOtherWriteup,
  allWriteups
}) => {
  const [activeTab, setActiveTab] = useState<'dossier' | 'detection' | 'iocs' | 'telemetry'>('dossier');
  const [copiedQuery, setCopiedQuery] = useState<string | null>(null);
  const [copiedIOC, setCopiedIOC] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const primaryCategory = getPrimaryCategory(writeup);
  const allCategories = getAllCategories(writeup);
  const secondaryCategories = allCategories.filter(c => c !== primaryCategory);
  const dateInfo = formatWriteupDate(writeup);

  const parsedTimelineEvents = useMemo(() => {
    if (writeup.timeline && writeup.timeline.length > 0) {
      return writeup.timeline;
    }
    return parseTimelineFromMarkdown(writeup.content || '');
  }, [writeup]);

  const handleCopyQuery = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedQuery(id);
    setTimeout(() => setCopiedQuery(null), 2000);
  };

  const handleCopyIOC = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedIOC(val);
    setTimeout(() => setCopiedIOC(null), 2000);
  };

  const handleExportMarkdown = () => {
    const mdContent = `# ${writeup.code} - ${writeup.title}
Domain: ${primaryCategory}
Categories: ${allCategories.join(', ')}
Platform: ${writeup.platform}
Difficulty: ${writeup.difficulty}
Date: ${writeup.date}
MITRE ATT&CK: ${writeup.mitreAttack.join(', ')}
Tools: ${writeup.tools.join(', ')}

${writeup.summary}

---

${writeup.content}
`;
    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${writeup.slug || writeup.id}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const currentIndex = allWriteups.findIndex(w => w.id === writeup.id);
  const prevWriteup = currentIndex > 0 ? allWriteups[currentIndex - 1] : null;
  const nextWriteup = currentIndex < allWriteups.length - 1 ? allWriteups[currentIndex + 1] : null;

  // Compute navigation sections for the vertical progress bar based strictly on markdown headings
  const progressSections: ProgressSectionItem[] = useMemo(() => {
    const list: ProgressSectionItem[] = [];

    if (activeTab === 'dossier') {
      const headingMatches = writeup.content
        ? Array.from(writeup.content.matchAll(/^(#{1,3})\s+(.+)$/gm))
        : [];

      if (headingMatches.length > 0) {
        headingMatches.forEach((match, idx) => {
          const rawText = match[2].trim();
          const cleanText = rawText
            .replace(/[*_`\[\]]/g, '')
            .replace(/\(http[^)]+\)/g, '')
            .trim();

          const slug = slugify(cleanText);

          // If heading text already starts with numbering like "1. Case Overview" or "01. Case Overview"
          const numMatch = cleanText.match(/^(\d+)[\.\-\)]\s*(.*)$/);
          let itemNumber: string;
          let itemLabel: string;

          if (numMatch) {
            itemNumber = numMatch[1].padStart(2, '0');
            itemLabel = numMatch[2].trim() || cleanText;
          } else {
            itemNumber = String(idx + 1).padStart(2, '0');
            itemLabel = cleanText;
          }

          list.push({
            id: slug,
            label: itemLabel.length > 24 ? itemLabel.substring(0, 22) + '...' : itemLabel,
            number: itemNumber
          });
        });
      }
    }

    return list;
  }, [writeup, activeTab]);

  const renderCalloutCard = (type: string, rawText: string, defaultChildren: React.ReactNode) => {
    const t = type.toUpperCase();
    const alertConfig: Record<string, { label: string; badge: string; border: string; bg: string; text: string; icon: React.ReactNode }> = {
      WARNING: {
        label: 'WARNING',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        border: 'border-l-4 border-l-amber-500 border-amber-500/30',
        bg: 'bg-amber-950/20',
        text: 'text-amber-200/90',
        icon: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
      },
      NOTE: {
        label: 'NOTE',
        badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
        border: 'border-l-4 border-l-sky-500 border-sky-500/30',
        bg: 'bg-sky-950/20',
        text: 'text-sky-200/90',
        icon: <Info className="w-4 h-4 text-sky-400 shrink-0" />
      },
      IMPORTANT: {
        label: 'IMPORTANT',
        badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        border: 'border-l-4 border-l-purple-500 border-purple-500/30',
        bg: 'bg-purple-950/20',
        text: 'text-purple-200/90',
        icon: <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0" />
      },
      TIP: {
        label: 'TIP',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        border: 'border-l-4 border-l-emerald-500 border-emerald-500/30',
        bg: 'bg-emerald-950/20',
        text: 'text-emerald-200/90',
        icon: <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0" />
      },
      CAUTION: {
        label: 'CAUTION',
        badge: 'bg-red-500/20 text-red-300 border-red-500/40',
        border: 'border-l-4 border-l-red-500 border-red-500/30',
        bg: 'bg-red-950/20',
        text: 'text-red-200/90',
        icon: <AlertOctagon className="w-4 h-4 text-red-400 shrink-0" />
      }
    };

    const cfg = alertConfig[t] || alertConfig.WARNING;
    const cleanBody = rawText.replace(/^\s*(?:>\s*)?\[!(?:NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i, '').trim();

    return (
      <div className={`my-5 p-4 sm:p-5 rounded-xl border ${cfg.border} ${cfg.bg} shadow-lg not-italic font-sans`}>
        <div className="flex items-center gap-2 mb-2">
          {cfg.icon}
          <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold border ${cfg.badge}`}>
            {cfg.label}
          </span>
        </div>
        <div className={`text-sm sm:text-base ${cfg.text} leading-relaxed`}>
          {cleanBody || defaultChildren}
        </div>
      </div>
    );
  };

  return (
    <article className="writeup-detail-root">
      {/* Right Vertical Reading Progress Bar */}
      {progressSections.length > 0 && (
        <VerticalReadingProgress
          sections={progressSections}
          title="DOSSIER"
        />
      )}

      <div className="writeup-detail-container">
        {/* Navigation & Breadcrumb */}
        <div className="writeup-detail-nav">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="writeup-back-btn"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Overview</span>
            </button>

            <span className="text-zinc-600 font-mono text-xs hidden sm:inline">/</span>

            <div className="font-mono text-xs text-muted-val truncate">
              <span className="text-primary-val">~/linh@analyst:$</span> cat /writeups/{writeup.slug || writeup.id}.md
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportMarkdown}
              className="writeup-action-btn"
              title="Download raw markdown file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .md</span>
            </button>

            <button
              onClick={handleShare}
              className="writeup-action-btn"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-primary-val" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Dossier Header Card */}
        <header id="writeup-header" className="writeup-detail-header">
          {/* Subtle amber backdrop glow */}
          <div className="writeup-detail-glow"></div>

          {/* Badges row: Primary tag prominently displayed, secondary tags alongside */}
          <div className="writeup-badges-row">
            <span className="writeup-badge-primary">
              {primaryCategory}
            </span>

            {secondaryCategories.map(cat => (
              <span key={cat} className="px-2 py-0.5 rounded bg-container-val border border-surface-val text-zinc-300 font-mono text-xs">
                {cat}
              </span>
            ))}

            <span className="writeup-badge-code">
              {writeup.code}
            </span>

            <span className="writeup-badge-platform">
              Platform: <strong className="text-zinc-100">{writeup.platform}</strong>
            </span>

            {writeup.difficulty === 'HARD' && (
              <span className="px-2 py-0.5 rounded bg-red-950/60 text-error-val font-mono text-xs font-bold border border-red-900/40">
                HARD
              </span>
            )}
            {writeup.difficulty === 'MED' && (
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-primary-val font-mono text-xs font-bold border border-amber-500/30">
                MED
              </span>
            )}
            {writeup.difficulty === 'EASY' && (
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-xs font-bold border border-zinc-700">
                EASY
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="writeup-detail-title">
            {writeup.title}
          </h1>

          {/* Summary */}
          <p className="writeup-detail-summary">
            {writeup.summary}
          </p>

          {/* Meta & Tags */}
          <div className="writeup-detail-meta-bar">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5 text-zinc-400 font-mono text-xs">
                <Calendar className="w-3.5 h-3.5 text-primary-val" />
                <span>{dateInfo.display}</span>
                {dateInfo.isRecent && (
                  <span className="text-zinc-500">({dateInfo.fullDate})</span>
                )}
              </span>
              <span className="flex items-center gap-1.5 text-zinc-400 font-mono text-xs">
                <Clock className="w-3.5 h-3.5 text-primary-val" />
                <span>{writeup.readTime}</span>
              </span>
            </div>

            {/* MITRE ATT&CK and Tools Tags */}
            <div className="flex flex-wrap items-center gap-1.5">
              {writeup.mitreAttack.map(t => (
                <span key={t} className="px-2 py-0.5 rounded bg-container-val border border-surface-val text-zinc-300 text-xs font-mono">
                  ATT&CK: {t}
                </span>
              ))}
              {writeup.tools.map(tool => (
                <span key={tool} className="px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-400 text-xs font-mono">
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </header>

        {/* Section Tabs */}
        <div id="writeup-tabs-bar" className="writeup-tabs-bar">
          <button
            onClick={() => setActiveTab('dossier')}
            className={`writeup-tab-btn ${activeTab === 'dossier' ? 'writeup-tab-btn-active' : ''}`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Investigation Dossier</span>
          </button>

          <button
            onClick={() => setActiveTab('detection')}
            className={`writeup-tab-btn ${activeTab === 'detection' ? 'writeup-tab-btn-active' : ''}`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>SIEM Detection & Rules ({writeup.detectionQueries?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('iocs')}
            className={`writeup-tab-btn ${activeTab === 'iocs' ? 'writeup-tab-btn-active' : ''}`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>IOC Artifacts ({writeup.iocs?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('telemetry')}
            className={`writeup-tab-btn ${activeTab === 'telemetry' ? 'writeup-tab-btn-active' : ''}`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Raw Telemetry Feed {writeup.rawTelemetry?.trim() ? '(Available)' : '(None)'}</span>
          </button>
        </div>

        {/* Tab 1: Dossier Body */}
        {activeTab === 'dossier' && (
          <div id="writeup-tab-card" className="writeup-tab-content-card">
            {writeup.content?.trim() ? (
              <div className="prose prose-invert max-w-none space-y-6 text-main-val leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  urlTransform={(url) => url}
                  components={({
                    h1: ({ node, children, ...props }) => {
                      const text = extractNodeText(children);
                      const slug = slugify(text);
                      return (
                        <h1
                          id={slug}
                          className="text-2xl sm:text-3xl font-bold font-sans text-zinc-100 border-b border-surface-val pb-3 mb-5 mt-4"
                          {...props}
                        >
                          {children}
                        </h1>
                      );
                    },
                    h2: ({ node, children, ...props }) => {
                      const text = extractNodeText(children);
                      const slug = slugify(text);
                      return (
                        <h2
                          id={slug}
                          className="text-xl sm:text-2xl font-bold font-sans text-primary-val border-b border-surface-val/60 pb-2.5 mb-4 mt-8 flex items-center gap-2"
                          {...props}
                        >
                          {children}
                        </h2>
                      );
                    },
                    h3: ({ node, children, ...props }) => {
                      const text = extractNodeText(children);
                      const slug = slugify(text);
                      return (
                        <h3
                          id={slug}
                          className="text-lg sm:text-xl font-bold font-sans text-amber-400 mt-6 mb-3"
                          {...props}
                        >
                          {children}
                        </h3>
                      );
                    },
                    p: ({ node, children, ...props }) => {
                      const fullText = extractNodeText(children);
                      const match = /^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i.exec(fullText);
                      if (match) {
                        return renderCalloutCard(match[1], fullText, children);
                      }
                      return (
                        <p className="text-zinc-200 font-sans leading-relaxed mb-4 text-sm sm:text-base" {...props}>
                          {children}
                        </p>
                      );
                    },
                    blockquote: ({ node, children, ...props }) => {
                      const fullText = extractNodeText(children);
                      const match = /^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i.exec(fullText);
                      if (match) {
                        return renderCalloutCard(match[1], fullText, children);
                      }
                      return (
                        <blockquote className="my-5 pl-5 pr-4 py-3 bg-[#141418] border-l-4 border-amber-400 border-y border-r border-[#27272a] rounded-r-lg text-zinc-200 italic font-sans shadow-sm">
                          <div className="flex items-start gap-3">
                            <Quote className="w-4 h-4 text-amber-400 shrink-0 mt-1 not-italic" />
                            <div className="flex-1 not-italic text-sm sm:text-base">{children}</div>
                          </div>
                        </blockquote>
                      );
                    },
                    hr: ({ node, ...props }) => (
                      <hr className="my-6 border-0 h-px bg-[#f59e0b] w-full" {...props} />
                    ),
                    table: ({ node, children, ...props }) => {
                      const tableText = extractNodeText(children);
                      const isTimeline = /Timestamp/i.test(tableText) && (/Phase/i.test(tableText) || /TTP/i.test(tableText));

                      if (isTimeline && parsedTimelineEvents.length > 0) {
                        return (
                          <AttackTimelineViewer
                            events={parsedTimelineEvents}
                            title={writeup.timelineTitle || 'Attack Chronology & Forensic Timeline'}
                            allowViewToggle={true}
                            editableTitle={false}
                          />
                        );
                      }

                      return (
                        <div className="my-6 overflow-x-auto rounded-xl border border-[#27272a] bg-[#0d0d10] shadow-lg">
                          <table className="w-full text-left text-sm sm:text-base font-mono border-collapse" {...props}>
                            {children}
                          </table>
                        </div>
                      );
                    },
                    thead: ({ node, ...props }) => (
                      <thead className="bg-[#18181c] border-b border-[#27272a] text-zinc-200" {...props} />
                    ),
                    th: ({ node, ...props }) => (
                      <th className="px-5 py-3 font-bold text-amber-400 uppercase text-xs sm:text-sm tracking-wider border-r border-[#27272a] last:border-r-0 whitespace-nowrap" {...props} />
                    ),
                    tbody: ({ node, ...props }) => (
                      <tbody className="divide-y divide-[#27272a]" {...props} />
                    ),
                    tr: ({ node, ...props }) => (
                      <tr className="hover:bg-[#18181c]/70 transition-colors even:bg-[#121215]/50" {...props} />
                    ),
                    td: ({ node, ...props }) => (
                      <td className="px-5 py-3 text-zinc-200 border-r border-[#27272a] last:border-r-0 leading-relaxed font-sans text-sm sm:text-base" {...props} />
                    ),
                    input: ({ node, type, checked, ...props }) => {
                      if (type === 'checkbox') {
                        return (
                          <input
                            type="checkbox"
                            checked={!!checked}
                            readOnly
                            className="w-4 h-4 rounded bg-black/80 border border-amber-400/60 text-amber-400 accent-amber-400 align-middle mr-2"
                          />
                        );
                      }
                      return <input type={type} {...props} />;
                    },
                    span: ({ node, style, className, children, ...props }: any) => {
                      let parsedStyle: React.CSSProperties | undefined = undefined;
                      if (typeof style === 'string') {
                        parsedStyle = {};
                        style.split(';').forEach(rule => {
                          const [k, v] = rule.split(':');
                          if (k && v) {
                            const camelK = k.trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
                            (parsedStyle as any)[camelK] = v.trim();
                          }
                        });
                      } else if (typeof style === 'object') {
                        parsedStyle = style;
                      }
                      return (
                        <span style={parsedStyle} className={className} {...props}>
                          {children}
                        </span>
                      );
                    },
                    font: ({ node, color, children, ...props }: any) => {
                      return <span style={{ color }} {...props}>{children}</span>;
                    },
                    ul: ({ node, ...props }) => (
                      <ul className="list-disc pl-5 space-y-2 text-zinc-200 font-sans my-3 text-sm sm:text-base" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol className="list-decimal pl-5 space-y-2 text-zinc-200 font-sans my-3 text-sm sm:text-base" {...props} />
                    ),
                    li: ({ node, ...props }) => (
                      <li className="leading-relaxed text-zinc-200 font-sans my-1 text-sm sm:text-base" {...props} />
                    ),
                    img: ({ node, src, alt, ...props }) => (
                      <figure className="my-6 rounded-xl overflow-hidden border border-[#27272a] bg-[#121215] shadow-2xl p-2 group">
                        <img
                          {...props}
                          src={src}
                          alt={alt || 'Forensic Evidence Exhibit'}
                          className="w-full h-auto rounded-lg object-contain max-h-[600px] mx-auto border border-[#27272a]/60 shadow-md transition-transform duration-200 group-hover:scale-[1.01]"
                          loading="lazy"
                        />
                        <figcaption className="text-center font-mono text-xs text-zinc-400 py-2 px-3 bg-[#18181c] rounded-b-lg border-t border-[#27272a]/60 mt-2 flex flex-wrap items-center justify-between gap-2">
                          <span className="flex items-center gap-2">
                            <Shield className="w-3.5 h-3.5 text-[#fbbf24]" />
                            <span>Evidence: {alt || 'Forensic Evidence Exhibit'}</span>
                          </span>
                          <span className="text-[11px] text-zinc-500 font-mono">
                            {src}
                          </span>
                        </figcaption>
                      </figure>
                    ),
                    code: ({ className, children, ...props }) => {
                      const isInline = !className && typeof children === 'string' && !children.includes('\n');
                      if (isInline) {
                        return (
                          <code
                            className="px-1.5 py-0.5 rounded bg-container-val border border-surface-val text-primary-val font-mono text-xs"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      }
                      const match = /language-(\w+)/.exec(className || '');
                      const language = match ? match[1] : '';
                      const rawCode = String(children).replace(/\n$/, '');
                      return (
                        <TerminalCodeBlock
                          code={rawCode}
                          language={language || 'bash'}
                        />
                      );
                    }
                  } as any)}
                >
                  {writeup.content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="p-12 text-center space-y-3 font-sans">
                <Shield className="w-8 h-8 text-zinc-600 mx-auto" />
                <div className="text-zinc-200 font-medium text-sm">
                  Investigation Dossier In Progress
                </div>
                <p className="text-xs text-muted-val max-w-md mx-auto leading-relaxed">
                  The step-by-step forensic walkthrough and technical analysis for this investigation are currently being compiled. Refer to the executive summary above for initial incident triage findings.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: SIEM Detection Rules */}
        {activeTab === 'detection' && (
          <div id="writeup-tab-card" className="space-y-6">
            {writeup.detectionQueries && writeup.detectionQueries.length > 0 ? (
              writeup.detectionQueries.map((dq, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="px-1">
                    <h3 className="font-semibold text-zinc-100 font-sans text-sm sm:text-base">{dq.title}</h3>
                    {dq.description && <p className="text-xs text-muted-val font-sans mt-0.5">{dq.description}</p>}
                  </div>
                  <TerminalCodeBlock
                    code={dq.code}
                    title={`${dq.title} [${(dq.language || 'SPL').toUpperCase()}]`}
                    language={dq.language || 'spl'}
                  />
                </div>
              ))
            ) : (
              <div className="p-10 text-center rounded-xl bg-surface-val border border-surface-val space-y-3 font-sans">
                <FileCode className="w-8 h-8 text-zinc-600 mx-auto" />
                <div className="text-zinc-200 font-medium text-sm">
                  No Dedicated SIEM Detection Rules Archived
                </div>
                <p className="text-xs text-muted-val max-w-md mx-auto leading-relaxed">
                  No standalone Splunk SPL, Elastic KQL, or Sigma rules were archived for this scenario. Query strings and filter parameters are documented directly in the main Investigation Dossier.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: IOC Artifacts*/}
        {activeTab === 'iocs' && (
          <div id="writeup-tab-card" className="rounded-xl bg-surface-val border border-surface-val overflow-hidden">
            <div className="p-4 bg-container-val border-b border-surface-val flex items-center justify-between">
              <h3 className="font-semibold text-zinc-100 font-sans text-sm">
                Threat Artifacts & Indicators of Compromise
              </h3>
            </div>

            {writeup.iocs && writeup.iocs.length > 0 ? (
              <div className="divide-y divide-surface-val">
                {writeup.iocs.map((ioc, idx) => (
                  <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-container-val transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-container-val border border-surface-val text-primary-val font-mono text-2xs font-bold uppercase">
                          {ioc.type}
                        </span>
                        <code className="font-mono text-xs text-zinc-200 select-all">
                          {ioc.value}
                        </code>
                      </div>
                      <p className="text-xs text-muted-val font-sans">{ioc.description}</p>
                    </div>

                    <button
                      onClick={() => handleCopyIOC(ioc.value)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-primary-val text-xs font-mono transition-colors self-start sm:self-auto cursor-pointer"
                    >
                      {copiedIOC === ioc.value ? (
                        <>
                          <Check className="w-3 h-3 text-primary-val" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Value</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center space-y-3 font-sans">
                <Database className="w-8 h-8 text-zinc-600 mx-auto" />
                <div className="text-zinc-200 font-medium text-sm">
                  No External IOC Records Registered
                </div>
                <p className="text-xs text-muted-val max-w-md mx-auto leading-relaxed">
                  No external file hashes, command-and-control IP nodes, or malicious registry keys were flagged for this lab or internal range challenge.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Raw Telemetry */}
        {activeTab === 'telemetry' && (
          <div id="writeup-tab-card" className="space-y-4">
            {writeup.rawTelemetry?.trim() ? (
              <div className="space-y-2">
                <div className="px-1 flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-val">
                    Forensic Hex / Stream Capture Logs
                  </span>
                </div>
                <TerminalCodeBlock
                  code={writeup.rawTelemetry.trim()}
                  title="raw_stream_capture.log [telemetry]"
                  language="log"
                  defaultWrap={true}
                />
              </div>
            ) : (
              <div className="p-10 text-center rounded-xl bg-surface-val border border-surface-val space-y-3 font-sans">
                <Terminal className="w-8 h-8 text-zinc-600 mx-auto" />
                <div className="text-zinc-200 font-medium text-sm">
                  No Raw Telemetry Stream Logged
                </div>
                <p className="text-xs text-muted-val max-w-md mx-auto leading-relaxed">
                  This investigation did not archive raw hex stream dumps or volatile memory packet captures. All relevant artifacts, evidence logs, and triage steps are cataloged under the Investigation Dossier and IOC Artifacts tabs.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Previous / Next Writeup Footer Navigation */}
        <div id="writeup-footer-nav" className="pt-6 border-t border-surface-val grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prevWriteup ? (
            <button
              onClick={() => onSelectOtherWriteup && onSelectOtherWriteup(prevWriteup)}
              className="p-4 rounded-lg bg-surface-val border border-surface-val hover:border-amber-400/40 text-left transition-colors cursor-pointer group"
            >
              <div className="text-2xs font-mono text-dim-val uppercase">← Previous Dossier</div>
              <div className="font-sans text-sm font-semibold text-zinc-200 group-hover:text-primary-val truncate mt-1">
                {prevWriteup.title}
              </div>
            </button>
          ) : <div />}

          {nextWriteup ? (
            <button
              onClick={() => onSelectOtherWriteup && onSelectOtherWriteup(nextWriteup)}
              className="p-4 rounded-lg bg-surface-val border border-surface-val hover:border-amber-400/40 text-right transition-colors cursor-pointer group sm:col-start-2"
            >
              <div className="text-2xs font-mono text-dim-val uppercase">Next Dossier →</div>
              <div className="font-sans text-sm font-semibold text-zinc-200 group-hover:text-primary-val truncate mt-1">
                {nextWriteup.title}
              </div>
            </button>
          ) : <div />}
        </div>
      </div>
    </article>
  );
};
