// api/cron.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAllUsers, type User } from "../../src/utils/authentication";
import { refreshDataForUser } from "../../src/utils/fetch";



async function refreshDataForAllUsers(days: number): Promise<void> {

  const users = await getAllUsers()

  await Promise.all([users.map(user => {
    return refreshDataForUser(user, days);
  })])


}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<VercelResponse> {
  try {

    if (!process.env.CRON_SECRET) {
      throw new Error("Missing CRON_SECRET")
    }


    const authHeader = req.headers['Authorization'];
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      console.error({ err: 'Unauthorized', hdrs: req.headers })
      return res.status(401).send({ err: 'Unauthorized', hdrs: req.headers });
    }


    const { days = '30' } = req.query


    const daysNum = Number(days)
    if (Number.isNaN(daysNum) || daysNum <= 0) {
      return res.status(400).send('Invalid days parameter')
    }

    await refreshDataForAllUsers(daysNum)

    return res.status(200).send("Success")
  } catch (err) {
    console.error(err)
    res.setHeader('X-ERROR', `${err}`)
    return res.status(500).send('Internal Server Error')
  }
}


//TODO: somehow we need to delete old aut state in some itervals, if a user doesn't finish the state, the code expires after 5 minutes!
