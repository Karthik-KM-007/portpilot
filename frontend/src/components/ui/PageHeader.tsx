import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  actions,
  breadcrumbs,
}) => {
  return (
    <div className="mb-6 pb-4 border-b border-[#192742] flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5 font-medium">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span>/</span>}
                {crumb.href ? (
                  <a href={crumb.href} className="hover:text-slate-300 transition-colors">
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-slate-400">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">{title}</h1>
          {badge && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#121E38] text-slate-300 border border-[#1E2E4A] uppercase tracking-wider font-mono-num">
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>

      {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
    </div>
  );
};
