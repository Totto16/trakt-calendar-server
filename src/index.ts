// index.ts
import process from 'node:process'
import fsAsync from "node:fs/promises"
import { fetchTraktCalendar } from './services/trakt'
import { generateCalendar } from './utils/ical'
import { ArgumentParser } from 'argparse'

export default async function main(token: string | undefined, file: string | undefined, days: string | number | undefined = 30): Promise<void> {


  if (!token || typeof token !== 'string') {
    throw new Error('Missing or invalid token')
  }

  const numDays = Number(days)
  if (Number.isNaN(numDays) || numDays <= 0) {
    throw new Error('Invalid days parameter')
  }

  const [shows, movies] = await Promise.all([
    fetchTraktCalendar(token, 'shows', numDays),
    fetchTraktCalendar(token, 'movies', numDays),
  ])

  const ics = generateCalendar(shows, movies)


  if (!file || typeof file !== 'string') {
    throw new Error('Missing or invalid file')
  }

  await fsAsync.writeFile(file, ics)

}


const parser = new ArgumentParser({ description: 'Generate ical' })


parser.add_argument('--days', {
  dest: 'days', type: 'int',
  help: 'the amount of days'
})

parser.add_argument('--token', {
  dest: 'token',
  help: 'the API token',
  required: true
})

parser.add_argument('--output', {
  dest: 'output',
  help: 'the output file',
  required: true
})

let args = parser.parse_args()
void main(args.token, args.file, args.days)
