import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Server,
  Database,
  Cpu,
  Monitor,
  ArrowRight,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import Card, { CardHeader } from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { api } from '../../api/client';

export const SystemHealth = ({ onStatusChange }) => {
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState(null);
  const [systemData, setSystemData] = useState(null);
  const [aiData, setAiData] = useState(null);
  const [error, setError] = useState(null);
  const [showJson, setShowJson] = useState(false);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Check Backend & DB Health
      const sysRes = await api.getSystemHealth();
      setSystemData(sysRes);

      // 2. Check AI Service Health via Backend
      const aiRes = await api.getAIHealth();
      setAiData(aiRes);

      setLastChecked(new Date().toLocaleTimeString());
      if (onStatusChange) {
        onStatusChange(true);
      }
    } catch (err) {
      setError(err.message);
      if (onStatusChange) {
        onStatusChange(false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    // Periodic refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const isBackendOk = systemData?.status === 'healthy';
  const isDbOk = systemData?.services?.database?.isConnected;
  const isAiOk = aiData?.status === 'online' || systemData?.services?.aiService?.status === 'online';

  const services = [
    {
      name: 'Client Frontend',
      tech: 'React 18 + Vite + Tailwind',
      port: '5173',
      icon: Monitor,
      status: 'online',
      latency: '< 1ms',
      message: 'Running & responsive',
      color: 'emerald',
    },
    {
      name: 'Express Backend',
      tech: 'Node.js + Express + JWT',
      port: '5000',
      icon: Server,
      status: isBackendOk ? 'online' : error ? 'offline' : 'connecting',
      latency: systemData?.uptimeSeconds ? `uptime: ${systemData.uptimeSeconds}s` : 'N/A',
      message: isBackendOk ? 'Handling API requests' : error || 'Connecting...',
      color: isBackendOk ? 'emerald' : 'rose',
    },
    {
      name: 'MongoDB Database',
      tech: 'Mongoose ODM',
      port: '27017',
      icon: Database,
      status: isDbOk ? 'online' : 'offline',
      latency: systemData?.services?.database?.name ? `db: ${systemData.services.database.name}` : 'N/A',
      message: isDbOk ? 'Connected & Collections Ready' : 'Database disconnected',
      color: isDbOk ? 'emerald' : 'rose',
    },
    {
      name: 'AI Microservice',
      tech: 'Python + FastAPI + Pydantic',
      port: '8000',
      icon: Cpu,
      status: isAiOk ? 'online' : 'offline',
      latency: aiData?.latencyMs ? `${aiData.latencyMs}ms latency` : 'N/A',
      message: isAiOk ? 'NLP Microservice Ready' : 'FastAPI service offline',
      color: isAiOk ? 'emerald' : 'rose',
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden border-brand-500/20 glow-purple">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                System Connectivity & Architecture Status
              </h2>
              <Badge variant={isBackendOk && isDbOk && isAiOk ? 'success' : 'warning'} dot={true}>
                {isBackendOk && isDbOk && isAiOk ? 'All Systems Operational' : 'Degraded State'}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Verifying 3-tier communication mesh: Frontend ↔ Backend ↔ MongoDB & AI Service.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowJson(!showJson)}
              icon={Terminal}
            >
              {showJson ? 'Hide Raw' : 'View Raw'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={loading}
              onClick={fetchHealth}
              icon={RefreshCw}
            >
              Run Connectivity Ping
            </Button>
          </div>
        </div>

        {/* 4 Microservice Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {services.map((svc) => {
            const Icon = svc.icon;
            const isOnline = svc.status === 'online';

            return (
              <div
                key={svc.name}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300">
                      <Icon className="w-5 h-5" />
                    </div>
                    {isOnline ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-400" />
                    )}
                  </div>

                  <h3 className="font-semibold text-slate-100 text-sm">{svc.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{svc.tech}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-slate-400">Port {svc.port}</span>
                  <span className={isOnline ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
                    {svc.latency}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Visual Pipeline Flow Diagram */}
        <div className="mt-6 p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>End-to-End Handshake Pipeline</span>
          </div>

          <div className="flex items-center flex-wrap gap-2 text-[11px] text-slate-400">
            <span className="px-2 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700">Client :5173</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="px-2 py-1 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">Express :5000</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="px-2 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">MongoDB :27017</span>
            <span className="text-slate-600 font-bold">&</span>
            <span className="px-2 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">FastAPI :8000</span>
          </div>

          <div className="text-slate-400 text-[11px]">
            Last Sync: <span className="text-slate-200">{lastChecked || 'Checking now...'}</span>
          </div>
        </div>

        {/* Raw JSON inspection toggle */}
        {showJson && (
          <div className="mt-6 p-4 rounded-xl bg-black/80 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto max-h-60">
            <p className="text-brand-400 font-bold mb-2">// Server & AI Service Combined Diagnostic Payload</p>
            <pre>{JSON.stringify({ backend: systemData, aiService: aiData }, null, 2)}</pre>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SystemHealth;
