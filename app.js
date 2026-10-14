// Audio
function playSound(id) {
    const s = document.getElementById(id);
    if (s) {
        s.currentTime = 0;
        s.volume = 0.1;
        s.play().catch(() => {});
    }
}

// Theme Toggle
function toggleTheme() {
    playSound('clickSound');
    const html = document.documentElement;
    const isDark = html.style.getPropertyValue('--bg-primary') === '#0A0E1A' || !html.style.getPropertyValue('--bg-primary');
    
    if (isDark) {
        html.style.setProperty('--bg-primary', '#FFF8F0');
        html.style.setProperty('--bg-secondary', '#FFFFFF');
        html.style.setProperty('--text-primary', '#2D3142');
        html.style.setProperty('--text-secondary', '#5A6376');
        html.style.setProperty('--accent-red', '#D95D39');
        html.style.setProperty('--accent-purple', '#F18F01');
        document.querySelector('.theme-icon').textContent = '☀️';
        updateMapTiles('light');
    } else {
        html.style.setProperty('--bg-primary', '#0A0E1A');
        html.style.setProperty('--bg-secondary', '#0F1419');
        html.style.setProperty('--text-primary', '#F5F5F5');
        html.style.setProperty('--text-secondary', '#B8C4D9');
        html.style.setProperty('--accent-red', '#FF6B6B');
        html.style.setProperty('--accent-purple', '#A855F7');
        document.querySelector('.theme-icon').textContent = '🌙';
        updateMapTiles('dark');
    }
    
    createMonthChart();
    createYearChart();
}

// Page Transition
window.addEventListener('load', () => {
    const t = document.querySelector('.page-transition');
    t.classList.add('active');
    setTimeout(() => { t.style.display = 'none'; }, 600);
});

// Particles
for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.top = Math.random() * 100 + '%';
    p.style.animation = `float ${10 + Math.random() * 20}s infinite ease-in-out`;
    p.style.animationDelay = -Math.random() * 20 + 's';
    document.body.appendChild(p);
}

// Counter Animation
function animateCounter(el, target, suffix = '', duration = 2000) {
    let current = 0;
    const inc = target / (duration / 16);
    const timer = setInterval(() => {
        current += inc;
        if (current >= target) {
            el.textContent = Math.round(target) + suffix;
            clearInterval(timer);
        } else {
            el.textContent = Math.round(current) + suffix;
        }
    }, 16);
}

// Scroll Observer
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            entry.target.querySelectorAll('.stat-number').forEach(stat => {
                if (!stat.classList.contains('animated')) {
                    const target = parseInt(stat.getAttribute('data-target'));
                    const isPct = stat.textContent.includes('%');
                    animateCounter(stat, target, isPct ? '%' : '');
                    stat.classList.add('animated');
                }
            });
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });

document.querySelectorAll('section').forEach(s => observer.observe(s));

setTimeout(() => animateCounter(document.getElementById('heroStat'), 86, '%', 2500), 500);

// 3D Tilt Effect
document.querySelectorAll('.card-3d').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    });

    card.addEventListener('click', () => playSound('clickSound'));
});

// Map
let map, tileLayer;
function initMap() {
    map = L.map('map').setView([-7.8, 110.37], 10);
    updateMapTiles('dark');
    
    const locs = [
        { name: 'Kulon Progo', lat: -7.82, lng: 110.16, count: 41, pct: '36.6%' },
        { name: 'Sleman', lat: -7.70, lng: 110.35, count: 25, pct: '22.3%' },
        { name: 'Gunungkidul', lat: -7.95, lng: 110.70, count: 22, pct: '19.6%' },
        { name: 'Bantul', lat: -7.95, lng: 110.35, count: 13, pct: '11.6%' },
        { name: 'Kota Yogyakarta', lat: -7.80, lng: 110.37, count: 11, pct: '9.8%' }
    ];
    
    locs.forEach(loc => {
        L.circleMarker([loc.lat, loc.lng], {
            radius: Math.sqrt(loc.count) * 3,
            fillColor: '#FF6B6B',
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.7
        }).addTo(map).bindPopup(`
            <div style="text-align: center;">
                <strong style="font-size: 1.1rem;">${loc.name}</strong><br>
                <span style="font-size: 1.5rem; font-weight: 700; color: #FF6B6B;">${loc.count}</span> kejadian<br>
                <span style="font-size: 0.9rem;">(${loc.pct})</span>
            </div>
        `);
    });
}

function updateMapTiles(theme) {
    if (!map) return;
    if (tileLayer) map.removeLayer(tileLayer);
    const url = theme === 'dark' 
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    tileLayer = L.tileLayer(url, { attribution: '© OpenStreetMap' }).addTo(map);
}

// Charts
Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
let monthChartInstance, yearChartInstance;

function createMonthChart() {
    const ctx = document.getElementById('monthChart');
    if (!ctx) return;
    if (monthChartInstance) monthChartInstance.destroy();
    
    const data = [14, 29, 17, 9, 2, 1, 1, 1, 2, 8, 19, 9];
    const bg = data.map((val, idx) => 
        [0, 1, 2, 9, 10, 11].includes(idx) ? '#FF6B6B' : 'rgba(150, 150, 150, 0.3)'
    );
    
    monthChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
            datasets: [{
                label: 'Kejadian',
                data: data,
                backgroundColor: bg,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(128, 128, 128, 0.1)' } },
                x: { grid: { display: false } }
            }
        }
    });
}

function createYearChart() {
    const ctx = document.getElementById('yearChart');
    if (!ctx) return;
    if (yearChartInstance) yearChartInstance.destroy();
    
    yearChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026*'],
            datasets: [{
                label: 'Kejadian',
                data: [12, 14, 12, 6, 7, 17, 4, 24, 5, 9, 2],
                backgroundColor: '#A855F7',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(128, 128, 128, 0.1)' } },
                x: { grid: { display: false } }
            }
        }
    });
}

window.addEventListener('load', () => {
    initMap();
    createMonthChart();
    createYearChart();
});
