
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
            const heightInMeter = height / 100;
            const bmi = weight / (heightInMeter * heightInMeter);

            // Calculate risk score
            const riskScore = calculateRiskScore(age, gender, weight, height, bmi);
            
            // Determine status
            let status, statusIcon, progressColor;
            
            if (riskScore < 30) {
                status = "Normal";
                statusIcon = "fa-check-circle";
                progressColor = "var(--success)";
            } else if (riskScore < 60) {
                status = "Beresiko";
                statusIcon = "fa-exclamation-triangle";
                progressColor = "var(--warning)";
            } else {
                status = "Stunting";
                statusIcon = "fa-exclamation-circle";
                progressColor = "var(--danger)";
            }

            // Update UI
            statusText.innerHTML = `Status: <span>${status}</span>`;
            document.querySelector(".status-indicator i").className = `fas ${statusIcon}`;
            riskPercentage.textContent = `Risiko Stunting: ${riskScore}%`;
            riskProgress.style.width = `${riskScore}%`;
            riskProgress.style.backgroundColor = progressColor;

            // Generate recommendations
            const recommendations = generateRecommendations(riskScore, age, gender, bmi);
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

    // Function to calculate risk score (simplified simulation)
    function calculateRiskScore(age, gender, weight, height, bmi) {
        let risk = 0;

        // Expected height based on age (WHO simplified)
        const expectedHeight = getExpectedHeight(age, gender);
        const heightDiff = height - expectedHeight;

        // Height factor
        if (heightDiff < -10) risk += 60;
        else if (heightDiff < -5) risk += 40;
        else if (heightDiff < 0) risk += 20;

        // BMI factor
        if (bmi < 14) risk += 30;
        else if (bmi < 16) risk += 20;
        else if (bmi < 18) risk += 10;

        // Age factor
        risk += age * 0.2;

        // Gender factor
        if (gender === "female") risk *= 0.95;

        // Add some randomness to make it feel more AI-like
        risk += (Math.random() * 5);

        return Math.min(Math.round(risk), 100);
    }

    // Function to get expected height based on age and gender
    function getExpectedHeight(age, gender) {
        if (gender === "male") {
            if (age <= 12) return 75;
            if (age <= 24) return 87;
            if (age <= 36) return 96;
            if (age <= 48) return 103;
            return 110;
        } else {
            if (age <= 12) return 74;
            if (age <= 24) return 86;
            if (age <= 36) return 95;
            if (age <= 48) return 102;
            return 109;
        }
    }

    // Function to generate recommendations based on risk
    function generateRecommendations(riskScore, age, gender, bmi) {
        const recommendations = [];

        if (riskScore < 30) {
            recommendations.push(
                "Pertahankan pola makan bergizi seimbang",
                "Lakukan pemeriksaan rutin setiap bulan di Posyandu",
                "Pastikan anak aktif bergerak dan bermain"
            );
        } else if (riskScore < 60) {
            recommendations.push(
                "Tingkatkan asupan protein hewani (telur, ikan, daging)",
                "Konsultasi dengan tenaga kesehatan",
                "Pantau pertumbuhan setiap 2 minggu",
                "Tambahkan makanan kaya zinc dan zat besi"
            );
        } else {
            recommendations.push(
                "Segera konsultasi dengan dokter spesialis anak",
                "Perbaiki kualitas & kuantitas makanan harian",
                "Lakukan stimulasi perkembangan secara intensif",
                "Pastikan lingkungan bersih dan sanitasi baik",
                "Ikuti program intervensi gizi terpadu dari pemerintah"
            );
        }

        // Age-specific recommendations
        if (age < 6) {
            recommendations.push("Pastikan pemberian ASI eksklusif");
        } else if (age < 12) {
            recommendations.push("Mulai perkenalkan MPASI dengan gizi seimbang");
        } else if (age < 24) {
            recommendations.push("Variasikan makanan keluarga dengan protein, sayur, dan buah");
        } else {
            recommendations.push("Ajarkan kebiasaan makan sehat & kebersihan diri sejak dini");
        }

        return recommendations;
    }

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
