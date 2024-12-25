import {drizzle} from 'drizzle-orm/postgres-js'

export const dynamic = 'force-dynamic'

export async function GET() {

  const db = drizzle('postgresql://postgres:password@127.0.0.1/postgres')
  const result = await db.execute('select 1')
  console.log('result', result)

  return new Response(JSON.stringify({result}))
}
