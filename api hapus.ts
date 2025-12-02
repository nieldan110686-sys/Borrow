import { sql } from '@vercel/postgres';

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
        return new Response(JSON.stringify({ error: 'ID tidak ditemukan' }), { status: 400 });
    }
    await sql`DELETE FROM pinjaman WHERE id = ${id}`;
    return new Response(JSON.stringify({ success: true, message: 'Pinjaman berhasil dihapus.' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Gagal menghapus pinjaman' }), { status: 500 });
  }
}
