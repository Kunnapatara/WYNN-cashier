import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2 } from "lucide-react";

interface CashierFormProps {
  onSubmit: (params: { giftId: string; country: string }) => void;
  isLoading: boolean;
}

export function CashierForm({ onSubmit, isLoading }: CashierFormProps) {
  const [giftId, setGiftId] = useState("");
  const [country, setCountry] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftId.trim() || !country.trim()) return;
    onSubmit({ giftId: giftId.trim(), country: country.trim().toUpperCase() });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="giftId" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Gift Identifier
          </label>
          <input
            id="giftId"
            type="text"
            placeholder="e.g. GIFT_001"
            value={giftId}
            onChange={(e) => setGiftId(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm transition-all duration-200 outline-none placeholder:text-muted-foreground/50 hover:border-primary/30 focus:border-primary focus:ring-4 focus:ring-primary/5"
            required
            autoComplete="off"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="country" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Country Code
          </label>
          <input
            id="country"
            type="text"
            placeholder="e.g. US, UK, DE"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            maxLength={2}
            className="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm transition-all duration-200 outline-none uppercase placeholder:text-muted-foreground/50 hover:border-primary/30 focus:border-primary focus:ring-4 focus:ring-primary/5"
            required
            autoComplete="off"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !giftId.trim() || !country.trim()}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-primary-foreground font-medium text-sm rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none transition-all duration-200 ease-out"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Resolving...</span>
          </>
        ) : (
          <>
            <Search className="w-4 h-4" />
            <span>Query Cashier</span>
          </>
        )}
      </button>
    </form>
  );
}
