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