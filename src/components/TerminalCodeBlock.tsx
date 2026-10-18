import React, { useState } from 'react';
import { Copy, Check, WrapText } from 'lucide-react';

export interface TerminalCodeBlockProps {
  code: string;
  title?: string;
  language?: string;
  defaultWrap?: boolean;
  className?: string;
}

export const TerminalCodeBlock: React.FC<TerminalCodeBlockProps> = ({
  code,
  title,
  language,
  defaultWrap = false,
  className = ''
}) => {
  const [isWrapped, setIsWrapped] = useState<boolean>(defaultWrap);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleCopy = async () => {
    try {
      // Copy clean raw code without line numbers or artificial shell prefixes
      await navigator.clipboard.writeText(code.trim());
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Fallback if clipboard API is restricted
      const textarea = document.createElement('textarea');
      textarea.value = code.trim();
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Determine display label for centered header title
  const displayTitle = title
    ? title
    : language
    ? `${language.toLowerCase()} [cli]`
    : 'terminal [cli]';

  return (
    <div
      className={`rounded-xl bg-[#0c0c0e] border border-[#27272a] overflow-hidden shadow-xl my-4 text-xs font-mono transition-all ${className}`}
    >
      {/* Terminal Title Bar */}
      <div className="relative px-3.5 py-2.5 bg-[#141417] border-b border-[#27272a] flex items-center justify-between gap-3 select-none">
        {/* Left Zone: 3 macOS/Linux Window Controls */}
        <div className="flex items-center gap-1.5 shrink-0 z-10">
          <span
            className="w-2.5 h-2.5 rounded-full bg-[#ef4444] inline-block shadow-sm"
            aria-hidden="true"
          />
          <span
            className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] inline-block shadow-sm"
            aria-hidden="true"
          />
          <span
            className="w-2.5 h-2.5 rounded-full bg-[#10b981] inline-block shadow-sm"
            aria-hidden="true"
          />
        </div>

        {/* Center Zone: Mathematically Centered Terminal Title */}
        <div className="absolute inset-x-0 mx-auto w-fit max-w-[55%] sm:max-w-[70%] text-center pointer-events-none px-2">
          <span className="truncate inline-block text-zinc-400 font-mono text-[11px] sm:text-xs tracking-tight">
            {displayTitle}
          </span>
        </div>

        {/* Right Zone: Icon-only Wrap Lines and Copy Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0 z-10">
          {/* Wrap Lines Toggle */}
          <button
            type="button"
            onClick={() => setIsWrapped(prev => !prev)}
            title={isWrapped ? 'Disable wrap (horizontal scroll)' : 'Wrap long lines'}
            className={`w-7 h-7 inline-flex items-center justify-center rounded border transition-colors cursor-pointer ${
              isWrapped
                ? 'bg-amber-400/10 border-amber-400/40 text-primary-val shadow-xs'
                : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
            aria-label={isWrapped ? 'Disable line wrap' : 'Enable line wrap'}
          >
            <WrapText className="w-3.5 h-3.5" />
          </button>

          {/* Copy Entire Code Block */}
          <button
            type="button"
            onClick={handleCopy}
            title={isCopied ? 'Copied to clipboard!' : 'Copy command to clipboard'}
            className={`w-7 h-7 inline-flex items-center justify-center rounded border transition-all cursor-pointer ${
              isCopied
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-primary-val hover:border-amber-400/30'
            }`}
            aria-label={isCopied ? 'Copied' : 'Copy code block'}
          >
            {isCopied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Terminal Code Body */}
      <pre
        className={`p-4 font-mono text-xs text-zinc-200 leading-relaxed overflow-y-auto max-h-[36rem] selection:bg-amber-400/20 selection:text-amber-200 ${
          isWrapped
            ? 'whitespace-pre-wrap break-all overflow-x-hidden'
            : 'whitespace-pre overflow-x-auto'
        }`}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
};
export default TerminalCodeBlock;
