CREATE TABLE pinjaman (
  id SERIAL PRIMARY KEY,
  nama_peminjam VARCHAR(255) NOT NULL,
  jumlah_pinjaman DECIMAL(15, 2) NOT NULL,
  mata_uang VARCHAR(3) NOT NULL CHECK (mata_uang IN ('IDR', 'THB')),
  tingkat_bunga DECIMAL(5, 2) NOT NULL,
  tanggal_pinjaman DATE NOT NULL
);