// api/user.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<VercelResponse> {
  try {

    const { code, state } = req.query

    if (!code || typeof code !== 'string') {
      return res.status(400).send('Missing or invalid code')
    }

    //TODO: associate this with some other state

    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    return res.status(200).send({ code, hdr: req.headers, query: req.query, state })

  } catch (err) {
    console.error(err)
    return res.status(500).send('Internal Server Error')
  }
}
