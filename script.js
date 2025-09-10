
document.addEventListener('DOMContentLoaded', function() {
    const themeSwitch = document.getElementById('theme-switch');
    const body = document.body;
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    // Set initial theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    body.setAttribute('data-theme', savedTheme);
    themeSwitch.checked = savedTheme === 'dark';

    // Theme toggle
    themeSwitch.addEventListener('change', function() {
        if (this.checked) {
            body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            body.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    });

    // Mobile menu toggle
    hamburger.addEventListener('click', function() {
        this.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                if (window.innerWidth <= 768) {
                    hamburger.classList.remove('active');
                    navLinks.classList.remove('active');
                }
            }
        });
    });

    // Form submission for stunting detection
    const stuntingForm = document.getElementById('stunting-form');
    const resultContent = document.querySelector('.result-content');
    const resultPlaceholder = document.querySelector('.result-placeholder');
    const statusText = document.getElementById('status-text');
    const riskPercentage = document.getElementById('risk-percentage');
    const riskProgress = document.getElementById('risk-progress');
    const recommendationList = document.getElementById('recommendation-list');

    // Inisialisasi custom select untuk gender
    document.querySelectorAll(".custom-select").forEach(select => {
        const selected = select.querySelector(".selected span");
        const options = select.querySelector(".options");
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'gender';
        hiddenInput.id = 'gender';
        select.appendChild(hiddenInput);

        // Toggle buka/tutup
        select.querySelector(".selected").addEventListener("click", (e) => {
            e.stopPropagation();
            select.classList.toggle("active");
        });

        // Pilih opsi
        options.querySelectorAll("li").forEach(option => {
            option.addEventListener("click", (e) => {
                e.stopPropagation();
                selected.textContent = option.textContent;
                hiddenInput.value = option.getAttribute('data-value');
                select.classList.remove("active");
            });
        });
    });

    // Tutup dropdown kalau klik di luar
    document.addEventListener("click", () => {
        document.querySelectorAll(".custom-select.active").forEach(select => {
            select.classList.remove("active");
        });
    });

    stuntingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('name').value;
        const age = parseInt(document.getElementById('age').value);
        const gender = document.getElementById('gender').value;
        const weight = parseFloat(document.getElementById('weight').value);
        const height = parseFloat(document.getElementById('height').value);
        
        // Validate inputs
        if (!name || !age || !gender || !weight || !height) {
            showNotification('Harap isi semua field dengan benar.', 'error');
            return;
        }
        
        // Simulate AI processing
        simulateAIAnalysis(name, age, gender, weight, height);
    });

    // Function to show notification
    function showNotification(message, type = 'info') {
        // Remove existing notification if any
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <p>${message}</p>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        document.body.appendChild(notification);
        
        // Add show class after a delay for animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Close notification on button click
        const closeButton = notification.querySelector('.notification-close');
        closeButton.addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, 5000);
    }

    function simulateAIAnalysis(name, age, gender, weight, height) {
        resultPlaceholder.innerHTML = '<i class="fas fa-spinner fa-spin"></i><p>Menganalisis data dengan AI...</p>';
        resultPlaceholder.classList.remove('hidden');
        resultContent.classList.add('hidden');

        setTimeout(() => {
            // Hitung Z-score berdasarkan standar WHO
            const zScore = calculateHeightForAgeZScore(age, gender, height);
            
            // Tentukan status berdasarkan Z-score
            let status, statusIcon, progressColor, riskScore;
            
            if (zScore >= -2) {
                status = "Normal";
                statusIcon = "fa-check-circle";
                progressColor = "var(--success)";
                riskScore = Math.min(Math.max(0, Math.round((-zScore / 4) * 100)), 30);
            } else if (zScore >= -3) {
                status = "Stunting Ringan";
                statusIcon = "fa-exclamation-triangle";
                progressColor = "var(--warning)";
                riskScore = Math.min(Math.max(31, Math.round(((-zScore - 2) / 1) * 35 + 30)), 65);
            } else {
                status = "Stunting Berat";
                statusIcon = "fa-exclamation-circle";
                progressColor = "var(--danger)";
                riskScore = Math.min(Math.max(66, Math.round(((-zScore - 3) / 2) * 34 + 65)), 100);
            }

            // Update UI
            statusText.innerHTML = `Status: <span>${status}</span>`;
            document.querySelector(".status-indicator i").className = `fas ${statusIcon}`;
            riskPercentage.textContent = `Z-score: ${zScore.toFixed(2)} | Risiko: ${riskScore}%`;
            riskProgress.style.width = `${riskScore}%`;
            riskProgress.style.backgroundColor = progressColor;

            // Generate recommendations
            const recommendations = generateRecommendations(zScore, age, gender);
            recommendationList.innerHTML = "";
            recommendations.forEach(rec => {
                const li = document.createElement("li");
                li.textContent = rec;
                recommendationList.appendChild(li);
            });

            resultPlaceholder.classList.add("hidden");
            resultContent.classList.remove("hidden");
            showNotification("Analisis berhasil! Hasil telah ditampilkan.", "success");
            
            // Smooth scroll to results
            resultContent.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 1500);
    }

    // Fungsi untuk menghitung Z-score berdasarkan standar WHO
    function calculateHeightForAgeZScore(ageInMonths, gender, height) {
        // Data median dan standar deviasi berdasarkan standar pertumbuhan WHO
        // Data ini hanya contoh, untuk implementasi nyata perlu data lengkap dari WHO
        const whoStandards = {
            male: {
                // Median height (cm) untuk anak laki-laki per bulan (0-60 bulan)
                median: [49.9, 54.7, 58.4, 61.4, 63.9, 65.9, 67.6, 69.2, 70.6, 71.8, 72.9, 74.0, 
                        74.9, 75.8, 76.6, 77.4, 78.1, 78.8, 79.5, 80.2, 80.8, 81.4, 82.0, 82.6,
                        83.1, 83.7, 84.2, 84.7, 85.2, 85.7, 86.2, 86.7, 87.2, 87.6, 88.1, 88.5,
                        88.9, 89.3, 89.7, 90.1, 90.5, 90.9, 91.3, 91.7, 92.1, 92.4, 92.8, 93.2,
                        93.5, 93.9, 94.2, 94.6, 94.9, 95.3, 95.6, 96.0, 96.3, 96.7, 97.0, 97.3],
                // Standard deviation untuk anak laki-laki
                sd: [1.9, 2.1, 2.2, 2.3, 2.4, 2.5, 2.5, 2.6, 2.6, 2.7, 2.7, 2.8, 
                     2.8, 2.8, 2.9, 2.9, 2.9, 3.0, 3.0, 3.0, 3.0, 3.1, 3.1, 3.1,
                     3.1, 3.1, 3.2, 3.2, 3.2, 3.2, 3.2, 3.3, 3.3, 3.3, 3.3, 3.3,
                     3.3, 3.4, 3.4, 3.4, 3.4, 3.4, 3.4, 3.5, 3.5, 3.5, 3.5, 3.5,
                     3.5, 3.5, 3.6, 3.6, 3.6, 3.6, 3.6, 3.6, 3.6, 3.7, 3.7, 3.7]
            },
            female: {
                // Median height (cm) untuk anak perempuan per bulan (0-60 bulan)
                median: [49.1, 53.7, 57.1, 59.8, 62.1, 64.0, 65.7, 67.3, 68.7, 70.1, 71.5, 72.8,
                        74.0, 75.2, 76.4, 77.5, 78.6, 79.7, 80.7, 81.7, 82.7, 83.7, 84.6, 85.5,
                        86.4, 87.3, 88.1, 88.9, 89.7, 90.5, 91.2, 91.9, 92.6, 93.3, 94.0, 94.6,
                        95.2, 95.8, 96.4, 97.0, 97.6, 98.1, 98.6, 99.2, 99.7, 100.2, 100.7, 101.2,
                        101.7, 102.2, 102.7, 103.2, 103.7, 104.2, 104.6, 105.1, 105.5, 106.0, 106.4, 106.8],
                // Standard deviation untuk anak perempuan
                sd: [1.8, 2.0, 2.1, 2.2, 2.3, 2.4, 2.5, 2.5, 2.6, 2.7, 2.7, 2.8,
                     2.8, 2.9, 2.9, 2.9, 3.0, 3.0, 3.0, 3.1, 3.1, 3.1, 3.1, 3.2,
                     3.2, 3.2, 3.2, 3.3, 3.3, 3.3, 3.3, 3.3, 3.4, 3.4, 3.4, 3.4,
                     3.4, 3.5, 3.5, 3.5, 3.5, 3.5, 3.5, 3.6, 3.6, 3.6, 3.6, 3.6,
                     3.6, 3.7, 3.7, 3.7, 3.7, 3.7, 3.7, 3.8, 3.8, 3.8, 3.8, 3.8]
            }
        };

        // Pastikan usia dalam rentang yang valid (0-60 bulan)
        const age = Math.max(0, Math.min(ageInMonths, 60));
        
        // Dapatkan median dan SD berdasarkan usia dan gender
        const median = whoStandards[gender].median[age];
        const sd = whoStandards[gender].sd[age];
        
        // Hitung Z-score: (nilai observasi - median) / standar deviasi
        const zScore = (height - median) / sd;
        
        return zScore;
    }

    // Function to generate recommendations based on Z-score
    function generateRecommendations(zScore, age, gender) {
        const recommendations = [];

        if (zScore >= -2) {
            recommendations.push(
                "Pertahankan pola makan bergizi seimbang",
                "Lakukan pemeriksaan rutin setiap bulan di Posyandu",
                "Pastikan anak aktif bergerak dan bermain",
                "Berikan ASI eksklusif hingga 6 bulan (jika masih dalam usia)",
                "Pastikan kecukupan tidur dan istirahat"
            );
        } else if (zScore >= -3) {
            recommendations.push(
                "Tingkatkan asupan protein hewani (telur, ikan, daging)",
                "Konsultasi dengan tenaga kesehatan di Puskesmas",
                "Pantau pertumbuhan setiap 2 minggu",
                "Tambahkan makanan kaya zinc dan zat besi",
                "Pastikan kebersihan lingkungan untuk mencegah infeksi",
                "Berikan MPASI dengan gizi lengkap dan seimbang (jika sudah usia 6+ bulan)"
            );
        } else {
            recommendations.push(
                "Segera konsultasi dengan dokter spesialis anak",
                "Perbaiki kualitas & kuantitas makanan harian",
                "Lakukan stimulasi perkembangan secara intensif",
                "Pastikan lingkungan bersih dan sanitasi baik",
                "Ikuti program intervensi gizi terpadu dari pemerintah",
                "Lakukan pemeriksaan kesehatan menyeluruh untuk deteksi dini penyakit penyerta"
            );
        }

        // Age-specific recommendations
        if (age < 6) {
            recommendations.push("Prioritaskan pemberian ASI eksklusif");
        } else if (age < 24) {
            recommendations.push("Berikan MPASI dengan frekuensi dan porsi sesuai usia");
            recommendations.push("Variasi makanan dengan tekstur yang sesuai perkembangan");
        } else {
            recommendations.push("Ajarkan kebiasaan makan sehat & kebersihan diri sejak dini");
            recommendations.push("Libatkan anak dalam aktivitas fisik yang menyenangkan");
        }

        return recommendations;
    }


    // Function to generate recommendations based on risk

    // Function to download result as text file
    function downloadResult() {
        try {
            // Get all the data
            const status = document.getElementById('status-text').textContent;
            const risk = document.getElementById('risk-percentage').textContent;
            const recommendations = Array.from(document.querySelectorAll('#recommendation-list li'))
                .map(li => li.textContent).join('\n• ');
            
            const name = document.getElementById('name').value;
            const age = document.getElementById('age').value;
            const gender = document.getElementById('gender').value;
            const genderText = gender === 'male' ? 'Laki-laki' : 'Perempuan';
            const weight = document.getElementById('weight').value;
            const height = document.getElementById('height').value;
            
            // Format nama file: Hasil-Laporan-[NamaAnak].txt
            // Bersihkan nama dari karakter yang tidak valid untuk nama file
            const cleanName = name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-');
            const fileName = `Hasil-Laporan-${cleanName}.txt`;
            
            // Create text content
            const content = `HASIL LAPORAN ANALISIS STUNTING - DIGITAL POSYANDU
=====================================================

DATA ANAK:
-----------
Nama: ${name}
Usia: ${age} bulan
Jenis Kelamin: ${genderText}
Berat Badan: ${weight} kg
Tinggi Badan: ${height} cm

HASIL ANALISIS:
---------------
${status}
${risk}

REKOMENDASI:
------------
• ${recommendations}

=====================================================
Dicetak dari Digital Posyandu
Tanggal: ${new Date().toLocaleDateString('id-ID', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
})}
Waktu: ${new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
})}
=====================================================`;
            
            // Create download link
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            
            a.href = url;
            a.download = fileName;
            a.style.display = 'none';
            
            document.body.appendChild(a);
            a.click();
            
            // Clean up
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
            
            showNotification('Hasil berhasil diunduh!', 'success');
        } catch (error) {
            console.error('Error downloading result:', error);
            showNotification('Error saat mengunduh hasil', 'error');
        }
    }

    // Add event listener to download button
    const downloadBtn = document.getElementById('download-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadResult);
    }

    // Intersection Observer for animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, observerOptions);

    // Observe elements with animation classes
    document.querySelectorAll('.animate-fade-in, .animate-slide-in').forEach(el => {
        observer.observe(el);
    });

    // Adjust for mobile view on resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            navLinks.style.display = 'flex';
        } else {
            navLinks.style.display = 'none';
        }
    });
});