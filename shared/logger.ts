export interface RedirectEvent {
  timestamp: string;
  giftId: string;
  country: string;
  selectedProvider: string;
  commissionWeight: number;
  isFallback?: boolean;
}

export function logRedirect(event: RedirectEvent) {
  console.log(JSON.stringify(event));
}
