import React, { useState } from 'react';
import { UploadCloud, Sparkles, FileText, CheckCircle } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { useNavigate } from 'react-router-dom';

export const QuickActions = () => {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);

  return (
    <Card className="border border-brand-500/30 bg-gradient-to-br from-brand-950/40 via-slate-900 to-slate-900">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2">
            <Badge variant="primary" dot={true}>
              Pipeline Ready
            </Badge>
            <span className="text-xs text-slate-400">Next Feature Module</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            AI Resume Analyzer & ATS Benchmark Engine
          </h3>
          <p className="text-sm text-slate-400 max-w-xl">
            Test the live bridge between Express and FastAPI by submitting resume content in the Analyzer workspace.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            variant="primary"
            size="lg"
            className="w-full md:w-auto"
            onClick={() => navigate('/analyzer')}
            icon={Sparkles}
          >
            Open Resume Analyzer
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default QuickActions;
