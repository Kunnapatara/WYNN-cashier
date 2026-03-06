import React, { useState } from "react";
import { motion } from "framer-motion";
import { Database, Shield } from "lucide-react";

import { CashierForm } from "@/components/CashierForm";
import { CashierResult } from "@/components/CashierResult";
import { useResolveGift } from "@/hooks/use-cashier";

export default function Home() {

  const [searchParams, setSearchParams] = useState<{
    giftId: string
    country: string
  } | null>(null)

  const { data, error, isFetching } = useResolveGift(searchParams)

  const handleSearch = (params: { giftId: string; country: string }) => {
    setSearchParams(params)
  }

  /**
   * Adapter: SmartRoutingResult → LegacyResult
   */
  const legacyData =
    data && "primary" in data
      ? {
          giftId: data.giftId,
          country: data.country,
          provider: data.primary.provider,
          highestCommissionRate: data.primary.commission
        }
      : null

  return (
    <div className="min-h-screen flex flex-col pt-12 md:pt-24 px-4 sm:px-6 lg:px-8 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto w-full space-y-12"
      >

        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center px-3 py-1 mb-4 rounded-full bg-primary/5 border border-primary/10 text-primary/80 text-xs font-semibold tracking-widest uppercase">
            <Shield className="w-3 h-3 mr-2" />
            Dry Mode Enabled
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-primary">
            THE CASHIER
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl mx-auto font-light">
            Revenue Brain of WYNN. Static mapping resolution system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-stretch">

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="md:col-span-5 lg:col-span-4"
          >

            <div className="glass-card rounded-2xl p-6 md:p-8 h-full flex flex-col relative overflow-hidden group">

              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Database className="w-24 h-24" />
              </div>

              <div className="relative z-10 mb-8">
                <h2 className="text-xl font-semibold mb-2">
                  Query Node
                </h2>
                <p className="text-sm text-muted-foreground">
                  Input mapping keys to resolve the best provider.
                </p>
              </div>

              <div className="relative z-10 mt-auto">
                <CashierForm
                  onSubmit={handleSearch}
                  isLoading={isFetching}
                />
              </div>

            </div>

          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="md:col-span-7 lg:col-span-8 min-h-[400px]"
          >

            <CashierResult
              data={legacyData}
              error={error as Error}
              isLoading={isFetching}
              hasSearched={searchParams !== null}
            />

          </motion.div>

        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground/60 font-mono">
            SYS_MEMORY_LOCKED // STATIC_MAP_ONLY
          </p>
        </div>

      </motion.div>
    </div>
  )
}