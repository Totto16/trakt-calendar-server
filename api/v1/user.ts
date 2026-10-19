// api/user.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<VercelResponse> {
  try {
    throw new Error("TODO")
  } catch (err) {
    console.error(err)
    return res.status(500).send('Internal Server Error')
  }
}
