'use client';

import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useUIStore } from '../store/useStore';

export default function ProgressOverlay() {
  const { currentJob } = useUIStore();
  const [collapsed, setCollapsed] = useState(false);

  // --- TEST ONLY: Create dummy job if none exists ---
  // let currentJob = currentJob;

  const [mobileCollapsed, setMobileCollapsed] = useState(true);


  if (!currentJob)
    return null

  const currentStep = () => {
    const { progress } = currentJob

    if (progress < 30) return 1;
    if (progress < 65) return 2;
    if (progress < 85) return 3;

    return 4;
  };


  const getProgressDescription = () => {
    const { progress, status } = currentJob;

    if (status === 'queued') {
      return 'Waiting in queue...';
    }

    if (progress < 30) {
      return 'Initializing AI generation...';
    }

    if (progress < 65) {
      return 'Generating questions & answers...';
    }

    if (progress < 85) {
      return 'Formatting printable PDF...';
    }

    return 'Finalizing assessment...';
  };

  return (
    <>
      {/* Desktop / Tablet Floating Card */}
      <div className="fixed bottom-5 right-5 z-[1000] hidden md:block">
        <div
          className={`overflow-hidden rounded-[24px] border border-[var(--border-color)] bg-[rgba(255,255,255,0.92)] shadow-[0_10px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl transition-all duration-300 ${collapsed ? 'w-[120px]' : 'w-[360px]'
            }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4">
            <div
              className={`flex items-center gap-3 transition-all duration-300 ${collapsed ? 'w-full justify-center' : ''
                }`}
            >
              {/* Loader */}
              <div className="relative flex h-10 w-10 items-center justify-center">
                <div className="absolute h-10 w-10 rounded-full border-2 border-[var(--border-color)]" />

                <div
                  className="absolute h-10 w-10 rounded-full border-2 border-transparent border-t-[var(--primary-accent)]"
                  style={{
                    animation: 'spin 1s linear infinite',
                  }}
                />

                <span className="text-[10px] font-bold text-[var(--text-main)]">
                  {currentJob.progress}%
                </span>
              </div>

              {!collapsed && (
                <div className="flex flex-col">
                  <h3 className="text-[15px] font-semibold text-[var(--text-main)]">
                    Generating Assessment
                  </h3>

                  <span className="text-[12px] text-[var(--text-muted)]">
                    {getProgressDescription()}
                  </span>
                </div>
              )}
            </div>

            {!collapsed && (
              <button
                onClick={() => setCollapsed(true)}
                className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-black/5"
              >
                <ChevronRight size={16} />
              </button>
            )}
          </div>

          {/* Expanded Content */}
          {!collapsed && (
            <div className="flex flex-col gap-4 px-4 pb-4">
              {/* Progress Bar */}
              <div className="flex flex-col gap-2">
                <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--bg-input)]">
                  <div
                    className="h-full rounded-full bg-[var(--primary-accent)] transition-all duration-500"
                    style={{
                      width: `${currentJob.progress}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                  <span>Step {currentStep()}/4</span>
                  <span>{currentJob.progress}% completed</span>
                </div>
              </div>

              {/* Steps */}
              <div className="flex flex-col gap-2">
                {[
                  'Initialize',
                  'Generate Questions',
                  'Format PDF',
                  'Finalize',
                ].map((step, index) => {
                  const stepNumber = index + 1;
                  const active = currentStep() === stepNumber;
                  const done = currentStep() > stepNumber;

                  return (
                    <div
                      key={step}
                      className="flex items-center gap-3 text-[12px]"
                    >
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold transition-all ${done
                          ? 'border-[var(--primary-accent)] bg-[var(--primary-accent)] text-white'
                          : active
                            ? 'border-[var(--primary-accent)] text-[var(--primary-accent)]'
                            : 'border-[var(--border-color)] text-[var(--text-muted)]'
                          }`}
                      >
                        {done ? '✓' : stepNumber}
                      </div>

                      <span
                        className={`transition-colors ${active
                          ? 'text-[var(--text-main)]'
                          : 'text-[var(--text-muted)]'
                          }`}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>

              <span className="text-[11px] text-[var(--text-muted)]">
                You can continue using the platform while generation completes.
              </span>
            </div>
          )}

          {/* Collapsed Button */}
          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              className="absolute left-[-4px] top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--border-color)] bg-white shadow-md transition hover:scale-105"
            >
              <ChevronLeft size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Bottom Bar */}

      <div className="fixed bottom-24 left-4 z-[1000] md:hidden">
        <div
          className={`overflow-hidden rounded-[22px] border border-[var(--border-color)] bg-[rgba(255,255,255,0.94)] shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl transition-all duration-300 ${mobileCollapsed ? 'w-[74px]' : 'w-[320px]'
            }`}
        >
          {/* Collapsed State */}
          {mobileCollapsed ? (
            <button
              onClick={() => setMobileCollapsed(false)}
              className="flex w-full items-center justify-center px-3 py-3"
            >
              <div className="relative flex h-11 w-11 items-center justify-center">
                <div className="absolute h-11 w-11 rounded-full border-2 border-[var(--border-color)]" />

                <div
                  className="absolute h-11 w-11 rounded-full border-2 border-transparent border-t-[var(--primary-accent)]"
                  style={{
                    animation: 'spin 1s linear infinite',
                  }}
                />

                <span className="text-[10px] font-bold text-[var(--text-main)]">
                  {currentJob.progress}%
                </span>
              </div>
            </button>
          ) : (
            <div className="flex items-start gap-4 px-4 py-4">
              {/* Loader */}
              <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center">
                <div className="absolute h-10 w-10 rounded-full border-2 border-[var(--border-color)]" />

                <div
                  className="absolute h-10 w-10 rounded-full border-2 border-transparent border-t-[var(--primary-accent)]"
                  style={{
                    animation: 'spin 1s linear infinite',
                  }}
                />

                <span className="text-[10px] font-bold text-[var(--text-main)]">
                  {currentJob.progress}%
                </span>
              </div>

              {/* Content */}
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-[14px] font-semibold text-[var(--text-main)]">
                      Generating Assessment
                    </span>

                    <span className="mt-0.5 text-[12px] text-[var(--text-muted)]">
                      {getProgressDescription()}
                    </span>
                  </div>

                  <button
                    onClick={() => setMobileCollapsed(true)}
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full transition hover:bg-black/5"
                  >
                    <ChevronLeft size={16} />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 h-[6px] w-full overflow-hidden rounded-full bg-[var(--bg-input)]">
                  <div
                    className="h-full rounded-full bg-[var(--primary-accent)] transition-all duration-500"
                    style={{
                      width: `${currentJob.progress}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}