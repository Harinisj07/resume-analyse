import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-md text-center space-y-4 p-8">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">404 - Page Not Found</h2>
        <p className="text-xs text-slate-400">
          The requested path does not exist on this platform.
        </p>
        <Button variant="primary" size="md" onClick={() => navigate('/')} icon={Home}>
          Return to Dashboard
        </Button>
      </Card>
    </div>
  );
};

export default NotFoundPage;
