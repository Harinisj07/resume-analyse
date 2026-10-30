import React from 'react';

export const Card = ({
  children,
  className = '',
  hover = false,
  glass = true,
  glow = false,
  ...props
}) => {
  return (
    <div
      className={`rounded-2xl p-6 transition-all duration-300 ${
        glass ? 'glass-card' : 'bg-slate-900 border border-slate-800'
      } ${hover ? 'glass-card-hover cursor-pointer' : ''} ${
        glow ? 'glow-purple' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, action, icon: Icon, className = '' }) => (
  <div className={`flex items-start justify-between mb-5 ${className}`}>
    <div className="flex items-center gap-3">
      {Icon && (
        <div className="p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div>
        <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {action && <div>{action}</div>}
  </div>
);

export default Card;
