// api/user.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { addUser, getAuthState } from "../../../src/utils/authentication";
import { getTokenFromCode } from "../../../src/services/trakt";
import { fixDate } from "../../../src/utils/date";

export function getUserSecret(): string {

  function generateRandomString(length: number) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const randomValues = crypto.getRandomValues(new Uint8Array(length));

    return Array.from(randomValues, value => chars[value % chars.length]).join("");
  }

  const secret = generateRandomString(16);

  return secret
}

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
    const redirect_url = `https://${process.env.HOSTNAME}/api/v2/auth/callback`

    const result = await getTokenFromCode(code, { verifier: auth_state.code_verifier }, redirect_url)

    const expires_at = new Date(fixDate(result.expires_at))

    const user_secret = await getUserSecret()

    const user = await addUser(user_secret, result.access_token, expires_at, result.refresh_token)

    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    return res.status(200).send({ code, hdr: req.headers, query: req.query, state, result, user })

  } catch (err) {
    console.error(err)
    res.setHeader('X-ERROR', `${err}`)
    return res.status(500).send('Internal Server Error')
  }
}
