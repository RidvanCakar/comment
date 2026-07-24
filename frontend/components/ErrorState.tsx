import React from "react";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="bg-bg-surface border border-sentiment-negative/25 rounded-md p-5 sm:p-6 max-w-xl mx-auto my-6 text-left shadow-lg w-full min-w-0 overflow-hidden">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded border border-sentiment-negative/30 bg-sentiment-negative/10 flex items-center justify-center text-sentiment-negative text-xl shrink-0">
          ⚠️
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-display font-bold text-base text-text-primary mb-1 tracking-wide uppercase">
            Bağlantı hatası
          </h4>
          <p className="text-text-muted text-sm sm:text-base leading-relaxed mb-4 break-words">
            {message}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="min-h-11 px-4 py-2.5 bg-bg-base border border-border-subtle hover:border-accent-record/50 hover:bg-bg-surface text-accent-record text-sm font-display font-semibold uppercase tracking-wider rounded transition-all cursor-pointer"
            >
              Yeniden dene
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
