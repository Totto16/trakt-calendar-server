// src/services/trakt.ts
import axios from 'axios'

const TRAKT_API = 'https://api.trakt.tv'

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

const TRAKT_AUTH_API = 'https://auth.trakt.tv'


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
