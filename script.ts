// Tunggu hingga seluruh konten HTML dimuat sebelum menjalankan skrip
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Inisialisasi Elemen DOM ---
    // Mendapatkan referensi ke elemen-elemen HTML yang akan dimanipulasi
    const formPinjaman = document.getElementById('formPinjaman') as HTMLFormElement;
    const daftarPinjamanBody = document.getElementById('daftarPinjaman') as HTMLTableSectionElement;
    const noDataMessage = document.getElementById('noDataMessage') as HTMLParagraphElement;

    // Elemen untuk menampilkan ringkasan keuangan
    const totalPinjamanIDREl = document.getElementById('totalPinjamanIDR') as HTMLParagraphElement;
    const totalBungaIDREl = document.getElementById('totalBungaIDR') as HTMLParagraphElement;
    const totalPinjamanTHBEl = document.getElementById('totalPinjamanTHB') as HTMLParagraphElement;
    const totalBungaTHBEl = document.getElementById('totalBungaTHB') as HTMLParagraphElement;

    // --- 2. Konfigurasi URL API ---
    // URL endpoint yang akan dipanggil. Vercel akan otomatis mengarahkan ini ke file yang sesuai di folder /api.
    const API_URL_GET = '/api/get';
    const API_URL_ADD = '/api/add';
    const API_URL_DELETE = '/api/delete';

    // --- 3. Fungsi Pembantu ---

    /**
     * Memformat angka menjadi string mata uang yang mudah dibaca.
     * @param amount - Jumlah uang.
     * @param currency - Kode mata uang ('IDR' atau 'THB').
     * @returns String mata uang yang sudah diformat.
     */
    function formatCurrency(amount: number, currency: string): string {
        if (currency === 'IDR') {
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
            }).format(amount);
        } else if (currency === 'THB') {
            return new Intl.NumberFormat('th-TH', {
                style: 'currency',
                currency: 'THB'
            }).format(amount);
        }
        return amount.toString();
    }

    // --- 4. Fungsi-Fungsi Utama ---

    /**
     * Mengambil semua data pinjaman dari server API.
     */
    async function fetchPinjaman(): Promise<void> {
        try {
            const response = await fetch(API_URL_GET);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const pinjaman = await response.json();
            renderTabelPinjaman(pinjaman);
            updateRingkasan(pinjaman);
        } catch (error) {
            console.error('Gagal mengambil data:', error);
            // Tampilkan pesan error di tabel jika gagal memuat data
            daftarPinjamanBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">Gagal memuat data. Periksa koneksi dan konfigurasi server.</td></tr>`;
        }
    }

    /**
     * Menampilkan data pinjaman ke dalam tabel HTML.
     * @param pinjaman - Array objek pinjaman.
     */
    function renderTabelPinjaman(pinjaman: any[]): void {
        daftarPinjamanBody.innerHTML = ''; // Kosongkan tabel terlebih dahulu
        if (pinjaman.length === 0) {
            noDataMessage.style.display = 'block';
            return;
        }
        noDataMessage.style.display = 'none';

        pinjaman.forEach(item => {
            const bunga = item.jumlah_pinjaman * (item.tingkat_bunga / 100);
            const total = parseFloat(item.jumlah_pinjaman) + bunga;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.nama_peminjam}</td>
                <td>${formatCurrency(item.jumlah_pinjaman, item.mata_uang)}</td>
                <td>${item.tingkat_bunga}%</td>
                <td>${formatCurrency(total, item.mata_uang)}</td>
                <td>
                    <button class="btn btn-danger" onclick="hapusPinjaman(${item.id})">Hapus</button>
                </td>
            `;
            daftarPinjamanBody.appendChild(row);
        });
    }

    /**
     * Memperbarui kartu ringkasan keuangan berdasarkan data pinjaman.
     * @param pinjaman - Array objek pinjaman.
     */
    function updateRingkasan(pinjaman: any[]): void {
        let totalPinjamanIDR = 0, totalBungaIDR = 0;
        let totalPinjamanTHB = 0, totalBungaTHB = 0;

        pinjaman.forEach(item => {
            const bunga = item.jumlah_pinjaman * (item.tingkat_bunga / 100);
            if (item.mata_uang === 'IDR') {
                totalPinjamanIDR += parseFloat(item.jumlah_pinjaman);
                totalBungaIDR += bunga;
            } else if (item.mata_uang === 'THB') {
                totalPinjamanTHB += parseFloat(item.jumlah_pinjaman);
                totalBungaTHB += bunga;
            }
        });

        totalPinjamanIDREl.textContent = formatCurrency(totalPinjamanIDR, 'IDR');
        totalBungaIDREl.textContent = formatCurrency(totalBungaIDR, 'IDR');
        totalPinjamanTHBEl.textContent = formatCurrency(totalPinjamanTHB, 'THB');
        totalBungaTHBEl.textContent = formatCurrency(totalBungaTHB, 'THB');
    }

    // --- 5. Event Listener ---

    // Event listener untuk form tambah pinjaman
    formPinjaman.addEventListener('submit', async (e: Event) => {
        e.preventDefault(); // Mencegah form reload halaman

        // Ambil nilai dari form
        const namaPeminjam = (document.getElementById('namaPeminjam') as HTMLInputElement).value;
        const jumlahPinjaman = parseFloat((document.getElementById('jumlahPinjaman') as HTMLInputElement).value);
        const mataUang = (document.getElementById('mataUang') as HTMLSelectElement).value;
        const tingkatBunga = parseFloat((document.getElementById('tingkatBunga') as HTMLSelectElement).value);

        const dataPinjaman = {
            nama_peminjam: namaPeminjam,
            jumlah_pinjaman: jumlahPinjaman,
            mata_uang: mataUang,
            tingkat_bunga: tingkatBunga
        };

        try {
            const response = await fetch(API_URL_ADD, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataPinjaman)
            });
            const result = await response.json();
            if (response.ok) {
                alert('Pinjaman berhasil ditambahkan!');
                formPinjaman.reset(); // Kosongkan form
                fetchPinjaman(); // Ambil data terbaru
            } else {
                alert('Gagal menambahkan pinjaman: ' + (result.error || 'Terjadi kesalahan tidak diketahui.'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Terjadi kesalahan saat menambahkan pinjaman.');
        }
    });

    /**
     * Fungsi untuk menghapus pinjaman.
     * Dibuat global (window.hapusPinjaman) agar bisa dipanggil dari atribut onclick di HTML.
     * @param id - ID pinjaman yang akan dihapus.
     */
    window.hapusPinjaman = async function(id: number) {
        if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
            try {
                const response = await fetch(`${API_URL_DELETE}?id=${id}`, {
                    method: 'DELETE'
                });
                const result = await response.json();
                if (response.ok) {
                    alert('Pinjaman berhasil dihapus.');
                    fetchPinjaman(); // Ambil data terbaru
                } else {
                    alert('Gagal menghapus pinjaman: ' + (result.error || 'Terjadi kesalahan tidak diketahui.'));
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Terjadi kesalahan saat menghapus pinjaman.');
            }
        }
    }

    // --- 6. Inisialisasi Awal ---
    // Ambil data pertama kali saat halaman dimuat
    fetchPinjaman();

});
