import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  MessageCircle, 
  Newspaper, 
  Zap, 
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  BrainCircuit,
  DollarSign,
  Activity,
  Search,
  X,
  Lock,
  Shield
} from 'lucide-react';

export const IconTrendingUp = ({ className }: { className?: string }) => <TrendingUp className={className} />;
export const IconTrendingDown = ({ className }: { className?: string }) => <TrendingDown className={className} />;
export const IconMessage = ({ className }: { className?: string }) => <MessageCircle className={className} />;
export const IconNews = ({ className }: { className?: string }) => <Newspaper className={className} />;
export const IconZap = ({ className }: { className?: string }) => <Zap className={className} />;
export const IconRefresh = ({ className }: { className?: string }) => <RefreshCw className={className} />;
export const IconAlert = ({ className }: { className?: string }) => <AlertTriangle className={className} />;
export const IconExternalLink = ({ className }: { className?: string }) => <ExternalLink className={className} />;
export const IconBrain = ({ className }: { className?: string }) => <BrainCircuit className={className} />;
export const IconDollar = ({ className }: { className?: string }) => <DollarSign className={className} />;
export const IconActivity = ({ className }: { className?: string }) => <Activity className={className} />;
export const IconSearch = ({ className }: { className?: string }) => <Search className={className} />;
export const IconX = ({ className }: { className?: string }) => <X className={className} />;
export const IconLock = ({ className }: { className?: string }) => <Lock className={className} />;
export const IconShield = ({ className }: { className?: string }) => <Shield className={className} />;


export const IconAlertTriangle: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={2} 
    stroke="currentColor" 
    className={className}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" 
    />
  </svg>
);

export const IconCheckCircle: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={2} 
    stroke="currentColor" 
    className={className}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
    />
  </svg>
);


