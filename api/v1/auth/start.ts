// api/user.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createCodeVerifier, getCodeChallenge, getConnectUserUrl } from "../../../src/services/trakt";




export default async function handler(req: VercelRequest, res: VercelResponse): Promise<VercelResponse> {
  try {

    if (!process.env.HOSTNAME) {
      throw new Error("Missing HOSTNAME")
    }

    const code_verifier = createCodeVerifier()
    const code_challenge = await getCodeChallenge(code_verifier)

    const redirect_url = `https://${process.env.HOSTNAME}/api/v1/auth/callback`

    const url = getConnectUserUrl(redirect_url, code_challenge)


    // return res.redirect(302, url)
    return res.status(500).send(url)

  } catch (err) {
    console.error(err)
    return res.status(500).send('Internal Server Error')
  }
}
