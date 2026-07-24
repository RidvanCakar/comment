"use client";

import React, { useEffect, useState } from "react";

interface TopicMeterProps {
  topic: string;
  percent: number;
  sentiment: "positive" | "negative" | "mixed";
  insight: string;
  exampleComments?: string[];
}

export default function TopicMeter({ topic, percent, sentiment, insight, exampleComments }: TopicMeterProps) {
  const totalSegments = 12;
  const [currentActive, setCurrentActive] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const targetActive = Math.max(1, Math.round((percent / 100) * totalSegments));
    let cur = 0;
    const interval = setInterval(() => {
      if (cur < targetActive) {
        cur++;
        setCurrentActive(cur);
      } else {
        clearInterval(interval);
      }
    }, 60);

    return () => clearInterval(interval);
  }, [percent]);

  const getSentimentColors = () => {
    switch (sentiment) {
      case "positive":
        return {
          text: "text-sentiment-positive",
          bg: "bg-sentiment-positive/10",
          border: "border-sentiment-positive/20",
          led: "bg-sentiment-positive",
          label: "Olumlu",
          leftBorder: "border-l-sentiment-positive",
        };
      case "negative":
        return {
          text: "text-sentiment-negative",
          bg: "bg-sentiment-negative/10",
          border: "border-sentiment-negative/20",
          led: "bg-sentiment-negative",
          label: "Olumsuz",
          leftBorder: "border-l-sentiment-negative",
        };
      default:
        return {
          text: "text-accent-record",
          bg: "bg-accent-record/10",
          border: "border-accent-record/20",
          led: "bg-accent-record",
          label: "Karışık",
          leftBorder: "border-l-accent-record",
        };
    }
  };

  const colors = getSentimentColors();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => setIsOpen(!isOpen)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setIsOpen(!isOpen);
        }
      }}
      aria-expanded={isOpen}
      className={`bg-bg-surface border border-border-subtle border-l-3 ${colors.leftBorder} rounded-sm p-4 sm:p-5 shadow-lg flex flex-col justify-between hover:border-accent-record/20 focus:outline-none focus:ring-1 focus:ring-accent-record/40 transition-all cursor-pointer text-left select-none min-w-0 w-full overflow-hidden`}
    >
      <div className="min-w-0">
        <div className="flex justify-between items-start gap-2 mb-3">
          <h5 className="font-display font-bold text-sm sm:text-base tracking-wide text-text-primary break-words min-w-0">
            {topic}
          </h5>
          <span className={`text-xs font-sans font-bold px-2 py-1 rounded-sm uppercase border shrink-0 ${colors.text} ${colors.bg} ${colors.border}`}>
            {colors.label}
          </span>
        </div>

        <div className="flex flex-col gap-1.5 mb-4">
          <div className="flex justify-between items-center gap-2 text-sm font-sans text-text-muted">
            <span className="truncate">Pay</span>
            <span className="font-bold text-text-primary shrink-0">%{percent}</span>
          </div>

          <div className="flex gap-[3px] h-3 bg-bg-base/70 p-[2.5px] rounded-sm border border-border-subtle w-full min-w-0">
            {[...Array(totalSegments)].map((_, idx) => {
              const isActive = idx < currentActive;
              return (
                <div
                  key={idx}
                  className={`flex-1 h-full rounded-[1px] transition-colors duration-200 min-w-0 ${
                    isActive ? colors.led : "bg-fill-muted"
                  }`}
                />
              );
            })}
          </div>
        </div>

        <div className="text-sm text-text-muted leading-relaxed font-sans border-t border-border-subtle pt-3 mt-1 break-words">
          {insight}
        </div>
      </div>

      <div className="min-w-0">
        <div className="flex justify-between items-center gap-2 text-sm font-sans text-text-muted mt-4 pt-2 border-t border-border-subtle min-h-11">
          <span className="truncate">Örnek yorumlar</span>
          <span className={`transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`}>▼</span>
        </div>

        <div
          onClick={(e) => e.stopPropagation()}
          className={`overflow-hidden transition-all duration-200 ease-in-out ${
            isOpen ? "max-h-[320px] opacity-100 mt-3 border-t border-border-subtle pt-3" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-col gap-2.5 max-h-[240px] overflow-y-auto overflow-x-hidden pr-1">
            {!exampleComments || exampleComments.length === 0 ? (
              <div className="text-sm font-sans text-text-muted italic py-1">
                Örnek yorum bulunamadı
              </div>
            ) : (
              exampleComments.map((comment, i) => (
                <div key={i} className="flex gap-2.5 items-start text-sm leading-relaxed min-w-0">
                  <span className="font-mono text-accent-record/80 select-none bg-bg-base px-1.5 py-0.5 rounded-[2px] border border-border-subtle shrink-0 text-xs">
                    #{String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-text-primary/90 font-sans break-words min-w-0">
                    {comment}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
