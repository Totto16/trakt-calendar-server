// src/services/trakt.ts
import axios from 'axios'

const TRAKT_API = 'https://api.trakt.tv'
const TRAKT_AUTH_API = 'https://auth.trakt.tv'

//TODO: better type these
export type Show = any & { _show: true }

export type Movie = any & { _movie: true }

export async function fetchTraktCalendar(
  token: string,
  type: 'shows' | 'movies',
  days: number
): Promise<typeof type extends "shows" ? Show[] : Movie[]> {

  if (!process.env.TRAKT_CLIENT_ID) {
    throw new Error("Missing TRAKT_CLIENT_ID")
  }

  const startDate = new Date().toISOString().split('T')[0]

  const response = await axios.get(
    `${TRAKT_API}/calendars/my/${type}/${startDate}/${days}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,  // manual token
        'trakt-api-key': process.env.TRAKT_CLIENT_ID,
        'trakt-api-version': '2',
      },
    }
  )

  if (response.status != 200) {
    throw new Error(response.data)
  }

  return response.data
}


export interface RefreshedAccessToken {
  "access_token": string,
  "expires_in": number,
  "refresh_token": string
}

export interface CodeVerifier {
  verifier: string
}

export interface CodeChallenge {
  challenge: string
}

export function createCodeVerifier(): CodeVerifier {
  // A random string of 43-128 characters from A-Z, a-z, 0-9, and -._~.

  function generateRandomString(length = 43) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    const randomValues = crypto.getRandomValues(new Uint8Array(length));

    return Array.from(randomValues, value => chars[value % chars.length]).join("");
  }
  const amount = Math.floor(Math.random() * (128 - 43 + 1)) + 43;

  const code_verifier = generateRandomString(amount);

  return { verifier: code_verifier }
}

export async function getCodeChallenge(code_verifier: CodeVerifier): Promise<CodeChallenge> {

  const data = new TextEncoder().encode(code_verifier.verifier);
  const hash = await crypto.subtle.digest("SHA-256", data);

  const bytes = new Uint8Array(hash);
  const binary = Array.from(bytes, byte => String.fromCharCode(byte)).join("");
  const base64 = btoa(binary);

  const challenge = base64
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return { challenge }

}

export function getConnectUserUrl(code_challenge: CodeChallenge, redirect_url: string, state: string): string {

  if (!process.env.TRAKT_CLIENT_ID) {
    throw new Error("Missing TRAKT_CLIENT_ID")
  }


  return `${TRAKT_AUTH_API}/oauth/authorize?response_type=code&client_id=${process.env.TRAKT_CLIENT_ID}&redirect_uri=${redirect_url}&code_challenge=${code_challenge}&code_challenge_method=S256&state=${state}`

}


export async function getTokenFromCode(
  code: string, code_verifier: CodeVerifier, redirect_url: string,
): Promise<RefreshedAccessToken> {

  if (!process.env.TRAKT_CLIENT_ID) {
    throw new Error("Missing TRAKT_CLIENT_ID")
  }

  const response = await axios.post(
    `${TRAKT_AUTH_API}/oauth/token`, {
    "code": code,
    "code_verifier": code_verifier.verifier,
    "client_id": process.env.TRAKT_CLIENT_ID,
    "redirect_uri": redirect_url,
    "grant_type": "authorization_code"
  }
  )


  if (response.status != 200) {
    throw new Error(response.data)
  }

  return response.data
}



export async function refreshAccessToken(
  token: string,
): Promise<RefreshedAccessToken> {

  if (!process.env.TRAKT_CLIENT_ID) {
    throw new Error("Missing TRAKT_CLIENT_ID")
  }

  const response = await axios.post(
    `${TRAKT_AUTH_API}/oauth/token`, {
    todo: "TODO"
  },
    {
      headers: {
        Authorization: `Bearer ${token}`,  // manual token
        'trakt-api-key': process.env.TRAKT_CLIENT_ID,
        'trakt-api-version': '2',
      },
    },
  )


  if (response.status != 200) {
    throw new Error(response.data)
  }

  return response.data
}
