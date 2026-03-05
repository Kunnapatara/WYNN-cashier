import type { Request, Response } from 'express';
import { getProviderStats } from "../../shared/tracker";

export default async function handler(req: Request, res: Response) {
  const { provider } = req.query;

  if (!provider) {
    return res.status(400).json({ error: "Provider is required" });
  }

  const stats = getProviderStats(provider as string);
  
  return res.status(200).json(stats);
}
