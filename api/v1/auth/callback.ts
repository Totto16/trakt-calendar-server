// api/user.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAuthState } from "../../../src/utils/authentication";
import { getTokenFromCode } from "../../../src/services/trakt";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<VercelResponse> {
  try {

    if (!process.env.HOSTNAME) {
      throw new Error("Missing HOSTNAME")
    }

    const { code, state } = req.query

    if (!code || typeof code !== 'string') {
      return res.status(400).send('Missing or invalid code')
    }

    if (!state || typeof state !== 'string') {
      return res.status(400).send('Missing or invalid state')
    }


    const auth_state = await getAuthState(state)
    if (auth_state == null) {
      return res.status(401).send('Invalid state')
    }

    //TODO: should i use another one?
    const redirect_url = `https://${process.env.HOSTNAME}/api/v1/auth/callback`

    const result = await getTokenFromCode(code, { verifier: auth_state.code_verifier }, redirect_url)

    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    return res.status(200).send({ code, hdr: req.headers, query: req.query, state, result })

  } catch (err) {
    console.error(err)
        res.setHeader('X-ERROR', `${err}`)
    return res.status(500).send('Internal Server Error')
  }
}
