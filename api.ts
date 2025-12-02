import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    const result = await sql`SELECT * FROM pinjaman ORDER BY tanggal_pinjaman DESC`;
    const pinjaman = result.rows;
    return new Response(JSON.stringify(pinjaman), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
