// api/ical.ts
import { getUser } from '../../src/utils/authentication';
import { generateCalendar } from '../../src/utils/ical'
import { getAllEntries } from '../../src/utils/blob'
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<VercelResponse> {
  try {
    const { secret, user_id } = req.query

    if (!secret || typeof secret !== 'string') {
      return res.status(400).send('Missing or invalid secret')
    }

    if (!user_id || (typeof user_id !== 'string' && typeof user_id !== 'number')) {
      return res.status(400).send('Missing or invalid id')
    }

    const idNum = Number(user_id)
    if (Number.isNaN(idNum) || idNum <= 0) {
      return res.status(400).send('Invalid id parameter')
    }

    const user = await getUser(idNum, secret)

    if (user == null) {
      return res.status(401).send('Invalid credentials')
    }

    const [shows, movies] = await getAllEntries(user)

    const ics = generateCalendar(shows, movies)

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=3600')

    return res.status(200).send(ics)
  } catch (err) {
    console.error(err)
        res.setHeader('X-ERROR', `${err}`)
    return res.status(500).send('Internal Server Error')
  }
}
