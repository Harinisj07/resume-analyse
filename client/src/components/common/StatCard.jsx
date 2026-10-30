import React from 'react';
import Card from './Card';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'brand',
}) => {
  const colorStyles = {
    brand: 'text-brand-400 bg-brand-500/10 border-brand-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  };

  return (
    <Card hover={true} className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 tracking-wider uppercase">{title}</p>
          <h3 className="text-2xl font-bold text-slate-100 mt-1">{value}</h3>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              {trend && (
                <span className={trend > 0 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                  {trend > 0 ? `+${trend}%` : `${trend}%`}
                </span>
              )}
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl border ${colorStyles[color] || colorStyles.brand}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatCard;
