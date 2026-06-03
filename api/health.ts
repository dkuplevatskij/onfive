/** Vercel Serverless Function: GET /api/health — проверка живости API. */
interface VercelResponse {
  status(code: number): VercelResponse;
  json(data: unknown): void;
}

export default function handler(_req: unknown, res: VercelResponse): void {
  res.status(200).json({ ok: true, service: "onfive-api" });
}
