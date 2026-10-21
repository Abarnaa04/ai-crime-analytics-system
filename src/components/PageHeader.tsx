import React from 'react';
import { ArrowLeft, ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  view?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  onBack: () => void;
  breadcrumbs?: BreadcrumbItem[];
  onNavigate?: (view: string) => void;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  onBack,
  breadcrumbs = [],
  onNavigate,
  actions,
}) => {
  return (
    <div className="space-y-3 pb-3 border-b border-slate-800">
      {/* Navigation & Breadcrumb Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          {/* Visible Back Button */}
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Return to previous screen"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-blue-400" />
            <span>Back</span>
          </button>

          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-slate-400">
              {breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <React.Fragment key={crumb.label}>
                    {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-600" />}
                    {crumb.view && onNavigate && !isLast ? (
                      <button
                        type="button"
                        onClick={() => onNavigate(crumb.view!)}
                        className="hover:text-blue-400 transition-colors"
                      >
                        {crumb.label}
                      </button>
                    ) : (
                      <span className={isLast ? 'text-slate-200 font-medium' : ''}>
                        {crumb.label}
                      </span>
                    )}
                  </React.Fragment>
                );
              })}
            </nav>
          )}
        </div>

        {badge && <div>{badge}</div>}
      </div>

      {/* Main Title and Optional Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
