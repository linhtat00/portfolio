import React, { useState, useEffect } from 'react';
import { AttackTimelineEvent } from '../types';
import { Clock, Table as TableIcon, Activity } from 'lucide-react';

interface AttackTimelineViewerProps {
  events: AttackTimelineEvent[];
  className?: string;
  allowViewToggle?: boolean;
  title?: string;
  editableTitle?: boolean;
}

const SEVERITY_CONFIG: Record<string, { label: string; badge: string; dot: string; border: string; text: string }> = {
  critical: {
    label: 'CRITICAL',
    badge: 'bg-red-500/20 text-red-400 border-red-500/50 font-bold',
    dot: 'bg-red-500 shadow-[0_0_10px_#ef4444]',
    border: 'border-l-red-500',
    text: 'text-red-400'
  },
  high: {
    label: 'HIGH',
    badge: 'bg-[#ff6a00]/20 text-[#ff6a00] border-[#ff6a00]/60 font-bold',
    dot: 'bg-[#ff6a00] shadow-[0_0_10px_#ff6a00]',
    border: 'border-l-[#ff6a00]',
    text: 'text-[#ff6a00]'
  },
  medium: {
    label: 'MEDIUM',
    badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50 font-bold',
    dot: 'bg-yellow-400 shadow-[0_0_8px_#facc15]',
    border: 'border-l-yellow-400',
    text: 'text-yellow-300'
  },
  low: {
    label: 'LOW',
    badge: 'bg-sky-500/20 text-sky-400 border-sky-500/50 font-bold',
    dot: 'bg-sky-400 shadow-[0_0_8px_#38bdf8]',
    border: 'border-l-sky-400',
    text: 'text-sky-400'
  },
  info: {
    label: 'INFO',
    badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 font-bold',
    dot: 'bg-emerald-400 shadow-[0_0_8px_#10b981]',
    border: 'border-l-emerald-500',
    text: 'text-emerald-400'
  }
};

export const AttackTimelineViewer: React.FC<AttackTimelineViewerProps> = ({
  events,
  className = '',
  allowViewToggle = true,
  title = 'Attack Chronology & Forensic Timeline'
}) => {
  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline');
  const [currentTitle, setCurrentTitle] = useState(title);

  useEffect(() => {
    setCurrentTitle(title || 'Attack Chronology & Forensic Timeline');
  }, [title]);

  if (!events || events.length === 0) {
    return null;
  }

  return (
    <div className={`my-6 rounded-xl bg-[#0a0a0d] border border-[#27272a] shadow-xl overflow-hidden font-sans ${className}`}>
      {/* Header bar: Compact, read-only title on Render/Live, no overlapping UI */}
      <div className="px-4 sm:px-5 py-3 bg-[#121216] border-b border-[#27272a] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="p-1.5 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-400 shrink-0">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <h3 className="font-mono text-xs sm:text-sm font-bold text-zinc-100 tracking-wide truncate">
              {currentTitle}
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] bg-amber-400/10 text-amber-300 border border-amber-400/20 font-mono font-semibold shrink-0">
              {events.length} Milestones
            </span>
          </div>
        </div>

        {/* View Mode Toggle: Icon + "Timeline" & Icon + "Table" */}
        {allowViewToggle && (
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-black/80 border border-zinc-800 text-xs font-mono shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer text-xs ${
                viewMode === 'timeline'
                  ? 'bg-amber-400/20 text-amber-300 font-bold border border-amber-400/40 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Switch to Visual Timeline"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Timeline</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer text-xs ${
                viewMode === 'table'
                  ? 'bg-amber-400/20 text-amber-300 font-bold border border-amber-400/40 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Switch to Data Table"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        {viewMode === 'timeline' ? (
          /* Visual Vertical Cyber DFIR Timeline */
          <div className="relative pl-6 sm:pl-8 space-y-5">
            {/* Continuous illuminated cyber rail connecting top milestone to bottom milestone */}
            <div 
              className="absolute left-[10px] sm:left-[14px] top-3.5 bottom-3.5 w-[2px] bg-amber-400/80 shadow-[0_0_6px_rgba(251,191,36,0.35)]"
              style={{ pointerEvents: 'none' }}
            />

            {events.map((evt, idx) => {
              const sev = SEVERITY_CONFIG[evt.severity?.toLowerCase() || 'medium'] || SEVERITY_CONFIG.medium;
              return (
                <div key={evt.id || idx} className="relative group">
                  {/* Glowing Node Dot on Illuminated Track */}
                  <div
                    className={`absolute -left-[19px] sm:-left-[23px] top-3.5 w-3.5 h-3.5 rounded-full border-2 border-[#0a0a0d] ${sev.dot} transition-all duration-200 group-hover:scale-125 z-10`}
                    title={`${evt.time} - ${sev.label}`}
                  />

                  {/* Event Milestone Card: Original compact clean sizing */}
                  <div
                    className={`p-3.5 sm:p-4 rounded-xl bg-[#141418] border border-[#27272a] hover:border-zinc-700 transition-all space-y-2 shadow-lg border-l-4 ${sev.border}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-amber-300 font-mono text-[11px] font-bold">
                          {evt.time}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-black/60 text-zinc-300 border border-zinc-700 font-mono text-[11px] font-medium">
                          {evt.phase}
                        </span>
                        {evt.techniqueId && (
                          <span className="px-1.5 py-0.5 rounded bg-red-950/40 border border-red-500/30 text-red-300 font-mono text-[10px] font-semibold">
                            {evt.techniqueId}
                          </span>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-mono font-bold ${sev.badge}`}>
                        {sev.label}
                      </span>
                    </div>

                    <h4 className="font-sans text-xs sm:text-sm font-bold text-zinc-100 group-hover:text-amber-300 transition-colors leading-snug">
                      {evt.title}
                    </h4>

                    {evt.description && (
                      <p className="font-sans text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
                        {evt.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View in English with compact font sizing */
          <div className="overflow-x-auto rounded-xl border border-[#27272a]">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead className="bg-[#18181c] border-b border-[#27272a] text-zinc-200">
                <tr>
                  <th className="px-3.5 py-2.5 font-bold text-amber-400 text-[11px] uppercase tracking-wider border-r border-[#27272a]">Timestamp</th>
                  <th className="px-3.5 py-2.5 font-bold text-amber-400 text-[11px] uppercase tracking-wider border-r border-[#27272a]">Phase & TTP</th>
                  <th className="px-3.5 py-2.5 font-bold text-amber-400 text-[11px] uppercase tracking-wider border-r border-[#27272a]">Threat Event / Telemetry</th>
                  <th className="px-3.5 py-2.5 font-bold text-amber-400 text-[11px] uppercase tracking-wider">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272a] bg-[#0d0d10]">
                {events.map((evt, idx) => {
                  const sev = SEVERITY_CONFIG[evt.severity?.toLowerCase() || 'medium'] || SEVERITY_CONFIG.medium;
                  return (
                    <tr key={evt.id || idx} className="hover:bg-[#18181c]/70 transition-colors even:bg-[#121215]/50">
                      <td className="px-3.5 py-2.5 font-bold text-amber-300 border-r border-[#27272a] whitespace-nowrap text-xs">
                        {evt.time}
                      </td>
                      <td className="px-3.5 py-2.5 border-r border-[#27272a] whitespace-nowrap text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-zinc-200 font-semibold">{evt.phase}</span>
                          {evt.techniqueId && (
                            <span className="px-1.5 py-0.5 rounded bg-red-950/40 text-red-300 border border-red-500/20 text-[10px]">
                              {evt.techniqueId}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3.5 py-2.5 border-r border-[#27272a]">
                        <div className="font-bold text-zinc-100 text-xs sm:text-sm">{evt.title}</div>
                        {evt.description && (
                          <div className="text-zinc-400 text-[11px] font-sans mt-0.5 leading-relaxed">{evt.description}</div>
                        )}
                      </td>
                      <td className="px-3.5 py-2.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${sev.badge}`}>
                          {sev.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttackTimelineViewer;
