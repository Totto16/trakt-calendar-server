// api/user.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createCodeVerifier, getCodeChallenge, getConnectUserUrl } from "../../../src/services/trakt";
import { addUserAuthState } from "../../../src/utils/authentication";




export default async function handler(req: VercelRequest, res: VercelResponse): Promise<VercelResponse> {
  try {

    if (!process.env.HOSTNAME) {
      throw new Error("Missing HOSTNAME")
    }

    const code_verifier = createCodeVerifier()
    const code_challenge = await getCodeChallenge(code_verifier)

    const redirect_url = `https://${process.env.HOSTNAME}/api/v1/auth/callback`

    const state = await addUserAuthState(code_verifier.verifier)

    const url = getConnectUserUrl(code_challenge.challenge, redirect_url, state.state)

    return res.status(500).send(url)

  } catch (err) {
    console.error(err)
    return res.status(500).send('Internal Server Error')
  }
}
