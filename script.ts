document.addEventListener('DOMContentLoaded', () => {
    const formPinjaman = document.getElementById('formPinjaman');
    const daftarPinjamanBody = document.getElementById('daftarPinjaman');
    const noDataMessage = document.getElementById('noDataMessage');

    // Elemen untuk ringkasan
    const totalPinjamanIDREl = document.getElementById('totalPinjamanIDR');
    const totalBungaIDREl = document.getElementById('totalBungaIDR');
    const totalPinjamanTHBEl = document.getElementById('totalPinjamanTHB');
    const totalBungaTHBEl = document.getElementById('totalBungaTHB');

    // === INI ADALAH PENGENALAN API YANG AKAN DIPANGGIL ===
    // Vercel akan otomatis mengarahkan permintaan ini ke file di folder /api
    const API_URL_GET = '/api/get';
    const API_URL_ADD = '/api/add';
    const API_URL_DELETE = '/api/delete';

    // Fungsi untuk memformat mata uang
    function formatCurrency(amount, currency) {
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
        return amount;
    }

    // Fungsi untuk mengambil semua data pinjaman dari API
    async function fetchPinjaman() {
        try {
            const response = await fetch(API_URL_GET); // Memanggil API /api/get
            if (!response.ok) throw new Error('Network response was not ok');
            const pinjaman = await response.json();
            renderTabelPinjaman(pinjaman);
            updateRingkasan(pinjaman);
        } catch (error) {
            console.error('Gagal mengambil data:', error);
            daftarPinjamanBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">Gagal memuat data. Periksa koneksi dan konfigurasi server.</td></tr>`;
        }
    }

    // Fungsi untuk menampilkan data di tabel
    function renderTabelPinjaman(pinjaman) {
        daftarPinjamanBody.innerHTML = '';
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

    // Fungsi untuk memperbarui ringkasan keuangan
    function updateRingkasan(pinjaman) {
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

    // Event listener untuk form tambah pinjaman
    formPinjaman.addEventListener('submit', async (e) => {
        e.preventDefault();

        const namaPeminjam = document.getElementById('namaPeminjam').value;
        const jumlahPinjaman = parseFloat(document.getElementById('jumlahPinjaman').value);
        const mataUang = document.getElementById('mataUang').value;
        const tingkatBunga = parseFloat(document.getElementById('tingkatBunga').value);

        const dataPinjaman = {
            nama_peminjam: namaPeminjam,
            jumlah_pinjaman: jumlahPinjaman,
            mata_uang: mataUang,
            tingkat_bunga: tingkatBunga
        };

        try {
            const response = await fetch(API_URL_ADD, { // Memanggil API /api/add
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataPinjaman)
            });
            const result = await response.json();
            if (response.ok) {
                alert('Pinjaman berhasil ditambahkan!');
                formPinjaman.reset();
                fetchPinjaman();
            } else {
                alert('Gagal menambahkan pinjaman: ' + (result.error || 'Terjadi kesalahan tidak diketahui.'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Terjadi kesalahan saat menambahkan pinjaman.');
        }
    });

    // Fungsi untuk menghapus pinjaman
    window.hapusPinjaman = async function(id) {
        if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
            try {
                const response = await fetch(`${API_URL_DELETE}?id=${id}`, { // Memanggil API /api/delete
                    method: 'DELETE'
                });
                const result = await response.json();
                if (response.ok) {
                    alert('Pinjaman berhasil dihapus.');
                    fetchPinjaman();
                } else {
                    alert('Gagal menghapus pinjaman: ' + (result.error || 'Terjadi kesalahan tidak diketahui.'));
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Terjadi kesalahan saat menghapus pinjaman.');
            }
        }
    }

    // Ambil data pertama kali saat halaman dimuat
    fetchPinjaman();
});