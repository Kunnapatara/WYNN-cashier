import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle, Percent, Server, MapPin, Tag } from "lucide-react";

interface CashierResultProps {
  data: {
    giftId: string;
    country: string;
    highestCommissionRate: number;
    provider: string;
  } | null | undefined;
  error: Error | null;
  isLoading: boolean;
  hasSearched: boolean;
}

export function CashierResult({ data, error, isLoading, hasSearched }: CashierResultProps) {
  if (!hasSearched && !isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border rounded-2xl bg-white/50">
        <Server className="w-8 h-8 text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">
          Enter a Gift ID and Country Code to resolve routing data.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full relative">
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10 rounded-2xl border border-transparent"
          >
            <Loader2 className="w-6 h-6 text-primary animate-spin mb-2" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Processing Request</p>
          </motion.div>
        )}

        {error && !isLoading && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="h-full flex flex-col items-center justify-center p-8 bg-destructive/5 border border-destructive/20 rounded-2xl text-center"
          >
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <h3 className="font-semibold text-destructive mb-1">Resolution Failed</h3>
            <p className="text-sm text-destructive/80">{error.message}</p>
          </motion.div>
        )}

        {data === null && !error && !isLoading && hasSearched && (
          <motion.div
            key="not-found"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="h-full flex flex-col items-center justify-center p-8 bg-muted/50 border border-border rounded-2xl text-center"
          >
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">No Route Found</h3>
            <p className="text-sm text-muted-foreground">
              The cashier could not find a valid provider for this combination.
            </p>
          </motion.div>
        )}

        {data && !isLoading && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="h-full flex flex-col p-6 bg-white border border-border rounded-2xl shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Route Resolved</h3>
                <p className="text-xs text-muted-foreground">Optimal commission path found</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 flex-1">
              <div className="space-y-1.5 p-4 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Tag className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium uppercase tracking-wider">Gift ID</span>
                </div>
                <p className="font-mono text-sm font-semibold text-foreground">{data.giftId}</p>
              </div>

              <div className="space-y-1.5 p-4 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium uppercase tracking-wider">Country</span>
                </div>
                <p className="font-mono text-sm font-semibold text-foreground">{data.country}</p>
              </div>

              <div className="space-y-1.5 p-4 rounded-xl bg-primary/5 border border-primary/10 col-span-2">
                <div className="flex items-center gap-2 text-primary/70 mb-2">
                  <Server className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium uppercase tracking-wider">Target Provider</span>
                </div>
                <p className="text-lg font-semibold text-primary">{data.provider}</p>
              </div>
              
              <div className="space-y-1.5 p-4 rounded-xl bg-muted/30 border border-border/50 col-span-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Percent className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium uppercase tracking-wider">Commission Rate</span>
                </div>
                <div className="bg-white px-3 py-1 rounded-md border border-border shadow-sm">
                  <p className="font-mono text-sm font-bold text-emerald-600">
                    {(data.highestCommissionRate * 100).toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
