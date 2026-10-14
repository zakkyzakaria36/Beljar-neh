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
    // Implementasi theme toggle
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

// 3D Map with Three.js
function init3DMap() {
    const container = document.getElementById('map3d');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0A0E1A);
    
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 15, 25);
    camera.lookAt(0, 0, 0);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Base plane (DIY region)
    const planeGeometry = new THREE.PlaneGeometry(30, 20);
    const planeMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x16213E, 
        side: THREE.DoubleSide 
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    scene.add(plane);
    
    // Location data with 3D bars
    const locations = [
        { name: 'Kulon Progo', x: -8, z: -3, count: 41, color: 0xFF6B6B },
        { name: 'Sleman', x: -2, z: -6, count: 25, color: 0xA855F7 },
        { name: 'Gunungkidul', x: 8, z: 2, count: 22, color: 0x3B82F6 },
        { name: 'Bantul', x: 2, z: 5, count: 13, color: 0x4ADE80 },
        { name: 'Kota YK', x: 0, z: 0, count: 11, color: 0xF59E0B }
    ];
    
    const bars = [];
    locations.forEach(loc => {
        const height = loc.count / 2;
        const geometry = new THREE.BoxGeometry(3, height, 3);
        const material = new THREE.MeshStandardMaterial({ 
            color: loc.color,
            metalness: 0.3,
            roughness: 0.4,
            emissive: loc.color,
            emissiveIntensity: 0.2
        });
        const bar = new THREE.Mesh(geometry, material);
        bar.position.set(loc.x, height / 2, loc.z);
        bar.castShadow = true;
        bar.userData = loc;
        scene.add(bar);
        bars.push(bar);
        
        // Glow ring at base
        const ringGeometry = new THREE.RingGeometry(1.5, 2, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({ 
            color: loc.color, 
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.3
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(loc.x, 0.1, loc.z);
        scene.add(ring);
    });
    
    // Mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    
    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });
    
    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        
        if (isDragging) {
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;
            
            camera.position.x -= deltaX * 0.05;
            camera.position.y += deltaY * 0.05;
            camera.lookAt(0, 0, 0);
            
            previousMousePosition = { x: e.clientX, y: e.clientY };
        }
    });
    
    container.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        camera.position.z += e.deltaY * 0.01;
        camera.position.z = Math.max(15, Math.min(40, camera.position.z));
    });
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Rotate scene slowly
        bars.forEach((bar, i) => {
            bar.rotation.y += 0.002;
            bar.position.y = (bar.userData.count / 4) + Math.sin(Date.now() * 0.001 + i) * 0.2;
        });
        
        renderer.render(scene, camera);
    }
    animate();
    
    // Responsive
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
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
                y: { beginAtZero: true, grid: { color: 'rgba(128, 128, 128, 0.1)' }, ticks: { color: '#B8C4D9' } },
                x: { grid: { display: false }, ticks: { color: '#B8C4D9' } }
            }
        }
    });
}

function createYearChart() {
    const ctx = document.getElementById('yearChart');
    if (!ctx) return;
    if (yearChartInstance) yearChartInstance.destroy();
    
    const data = [12, 14, 12, 6, 7, 17, 4, 24, 5, 9, 2];
    
    // Gradient
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(255, 107, 107, 0.4)');
    gradient.addColorStop(1, 'rgba(168, 85, 247, 0.1)');
    
    yearChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'],
            datasets: [{
                label: 'Kejadian',
                data: data,
                borderColor: '#FF6B6B',
                backgroundColor: gradient,
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 6,
                pointBackgroundColor: '#FF6B6B',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(10, 14, 26, 0.9)',
                    titleColor: '#F5F5F5',
                    bodyColor: '#B8C4D9',
                    borderColor: '#FF6B6B',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: (context) => `${context.parsed.y} kejadian`
                    }
                }
            },
            scales: {
                y: { 
                    beginAtZero: true, 
                    grid: { color: 'rgba(128, 128, 128, 0.1)' },
                    ticks: { color: '#B8C4D9' }
                },
                x: { 
                    grid: { display: false },
                    ticks: { color: '#B8C4D9' }
                }
            }
        }
    });
}

window.addEventListener('load', () => {
    init3DMap();
    createMonthChart();
    createYearChart();
});
