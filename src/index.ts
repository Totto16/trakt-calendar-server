// index.ts
import fsAsync from "node:fs/promises"
import { fetchTraktCalendar } from './services/trakt'
import { generateCalendar } from './utils/ical'
import { ArgumentParser } from 'argparse'
import dotenv from 'dotenv'

async function process(token: string, file: string, days: number): Promise<void> {

  const [shows, movies] = await Promise.all([
    fetchTraktCalendar(token, 'shows', days),
    fetchTraktCalendar(token, 'movies', days),
  ])

  console.log(shows, movies)
  return

  const ics = generateCalendar(shows, movies)

  await fsAsync.writeFile(file, ics)

}

async function main(): Promise<void> {

  const parser = new ArgumentParser({ description: 'Generate ical' })


  parser.add_argument('--days', {
    dest: 'days', type: 'int',
    help: 'the amount of days',
    default: "30"
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

  const token = args.token;

  if (!token || typeof token !== 'string') {
    throw new Error('Missing or invalid token')
  }

  const days = Number(args.days)
  if (Number.isNaN(days) || days <= 0) {
    throw new Error('Invalid days parameter')
  }

  const file = args.output

  if (!file || typeof file !== 'string') {
    throw new Error('Missing or invalid file')
  }

  try {
    dotenv.config({ path: ['.env.local', '.env'] })

    await process(token, file, days)

  } catch (error) {
    console.error(error)
    console.error((error as Error).message)
  }


}

void main()
