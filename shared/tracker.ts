import { v4 as uuidv4 } from 'uuid';

export interface ClickEvent {
  clickId: string;
  giftId: string;
  provider: string;
  country: string;
  timestamp: string;
}

export interface ConversionEvent {
  clickId: string;
  revenue: number;
}

const clickStore = new Map<string, ClickEvent>();
const revenueStore = new Map<string, number>();

export function trackClick(event: ClickEvent) {
  clickStore.set(event.clickId, event);
}

export function trackConversion(event: ConversionEvent) {
  const currentRevenue = revenueStore.get(event.clickId) || 0;
  revenueStore.set(event.clickId, currentRevenue + event.revenue);
}

export function calculateEPC(provider: string) {
  const providerClicks = Array.from(clickStore.values()).filter(c => c.provider === provider);
  const totalClicks = providerClicks.length;
  
  if (totalClicks === 0) return 0;

  const totalRevenue = providerClicks.reduce((sum, click) => {
    return sum + (revenueStore.get(click.clickId) || 0);
  }, 0);

  return totalRevenue / totalClicks;
}

export function getProviderStats(provider: string) {
  const providerClicks = Array.from(clickStore.values()).filter(c => c.provider === provider);
  const clicks = providerClicks.length;
  const revenue = providerClicks.reduce((sum, click) => {
    return sum + (revenueStore.get(click.clickId) || 0);
  }, 0);
  const epc = clicks > 0 ? revenue / clicks : 0;

  return {
    provider,
    clicks,
    revenue,
    epc
  };
}
