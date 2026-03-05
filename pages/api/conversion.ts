import type { Request, Response } from 'express';
import { trackConversion } from "../../shared/tracker";

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { clickId, revenue } = req.body;

  if (!clickId || revenue === undefined) {
    return res.status(400).json({ error: "Missing clickId or revenue" });
  }

  trackConversion({ clickId, revenue: Number(revenue) });
  
  console.log("CONVERSION RECORDED", { clickId, revenue });
  
  return res.status(200).json({ status: "recorded" });
}
