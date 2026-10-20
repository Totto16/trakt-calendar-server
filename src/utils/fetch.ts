import { fetchTraktCalendar } from "../services/trakt";
import type { User } from "./authentication";
import { addNewEntries } from "./blob";

async function getCurrentToken(user: User): Promise<string> {

    const now = new Date()

    if (now.getTime() > user.expires_at) {
        //TODO: implement the usage of the refresh token
        throw new Error("TODO: implement refresh logic")
    }

    return user.access_token;
}

export async function refreshDataForUser(user: User, days: number): Promise<void> {

    const token = await getCurrentToken(user)

    const entries = await Promise.all([
        fetchTraktCalendar(token, 'shows', days),
        fetchTraktCalendar(token, 'movies', days),
    ])

    await addNewEntries(user, entries)
}
