/* =========================================================
   1. CAMPO DE ESTRELLAS CON CANVAS
   ========================================================= */
const canvas = document.getElementById('galaxy');
const ctx = canvas.getContext('2d');

let stars = [];
let shootingStars = [];
let W, H;
let mouseX = 0; 
let mouseY = 0;

// Referencias al DOM
const music = document.getElementById('music');
const musicBtn = document.getElementById('music-btn');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn'); // 👈 NUEVO
const iconPlay = musicBtn.querySelector('.icon-play');
const iconPause = musicBtn.querySelector('.icon-pause');

// 🎵 PLAYLIST (Aquí pones los nombres de tus canciones)
const playlist = [
  'audio/cancion3.mp3',
  'audio/cancion1.mp3',
  'audio/cancion2.mp3'
];
let currentTrack = 0; // Empezamos en la canción 0 (la primera)

/* --- Estado de audio (declarado aquí para que exista desde el inicio) --- */
let audioCtx = null;
let analyser = null;
let frequencyData = null;
const smoothLevels = new Array(64).fill(0);

// Ajusta el canvas al tamaño real de la ventana
function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('mousemove', (e) => {// si cambia el tamaño, recalcula
// Actualizar el canvas cuando el móvil rota o la barra de direcciones cambia
window.addEventListener('orientationchange', resize);
    mouseX = (e.clientX - window.innerWidth / 2) * 0.05;
    mouseY = (e.clientY - window.innerHeight / 2) * 0.05;
});

// --- Clase Star: cada estrella es un objeto con su propia lógica ---
class Star {
  constructor() {
    this.reset();
    this.y = Math.random() * H; // arranca repartida
  }
  reset() {
    this.x = Math.random() * W;
    this.y = -10;
    this.radius = Math.random() * 1.5 + 0.3;
    this.speed = Math.random() * 0.3 + 0.05;
    this.twinkle = Math.random() * Math.PI * 2; // desfase para titileo
    this.hue = Math.random() > 0.7 ? 280 : 220; // violeta o azul
  }
  update() {
    this.y += this.speed;
    this.twinkle += 0.02;
    if (this.y > H + 10) this.reset();
  }
  draw() {
    const alpha = 0.4 + Math.sin(this.twinkle) * 0.4;
    
    // 👇 AQUÍ APLICAMOS EL PARALLAX
    // Las estrellas más grandes (más cercanas) se mueven más
    const depth = this.radius * 0.8; 
    const px = this.x + mouseX * depth;
    const py = this.y + mouseY * depth;

    ctx.beginPath();
    ctx.arc(px, py, this.radius, 0, Math.PI * 2); // Usamos px y py
    ctx.fillStyle = `hsla(${this.hue}, 90%, 85%, ${alpha})`;
    ctx.fill();
  }
}

// Crea 200 estrellas (o menos en móviles por rendimiento)
const starCount = window.innerWidth < 700 ? 100 : 200;
for (let i = 0; i < starCount; i++) stars.push(new Star());

// --- Estrella fugaz ---
class ShootingStar {
  constructor() {
    this.x = Math.random() * W * 0.8;
    this.y = Math.random() * H * 0.4;
    this.len = Math.random() * 120 + 80;
    this.speed = Math.random() * 8 + 6;
    this.angle = Math.PI / 4; // 45 grados
    this.life = 1;
  }
  update() {
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    this.life -= 0.012;
  }
  draw() {
    const tailX = this.x - Math.cos(this.angle) * this.len;
    const tailY = this.y - Math.sin(this.angle) * this.len;
    const grad = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
    grad.addColorStop(0, `rgba(255,255,255,${this.life})`);
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(tailX, tailY);
    ctx.stroke();
  }
}

// Bucle principal de animación
function animate() {
  ctx.clearRect(0, 0, W, H);
  stars.forEach(s => { s.update(); s.draw(); });
  shootingStars.forEach((s, i) => {
    s.update();
    s.draw();
    if (s.life <= 0) shootingStars.splice(i, 1);
  });

  drawEqualizer(); // dibuja el ecualizador encima de las estrellas

  requestAnimationFrame(animate);
}
animate();

// Lanza una estrella fugaz cada 3-6 segundos
function maybeShoot() {
  if (Math.random() < 0.5) shootingStars.push(new ShootingStar());
  setTimeout(maybeShoot, Math.random() * 3000 + 3000);
}
maybeShoot();

/* =========================================================
   2. SCROLL REVEAL con IntersectionObserver
   ========================================================= */
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target); // solo una vez
    }
  });
}, { threshold: 0.15 });

reveals.forEach(el => observer.observe(el));

/* =========================================================
   3. CONTADOR DE TIEMPO JUNTOS
   ========================================================= */
// ⚠️ CAMBIA esta fecha por la de ustedes: new Date(AÑO, MES-1, DÍA, HORA, MIN)
// Ej: 14 de febrero de 2023 a las 20:30 → new Date(2023, 1, 14, 20, 30)
const startDate = new Date(2023, 7, 31, 17, 30);

function updateCounter() {
  const now = new Date();
  const diff = now - startDate;

  const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins  = Math.floor((diff / (1000 * 60)) % 60);
  const secs  = Math.floor((diff / 1000) % 60);

  document.getElementById('days').textContent  = days;
  document.getElementById('hours').textContent = hours;
  document.getElementById('mins').textContent  = mins;
  document.getElementById('secs').textContent  = secs;
}
updateCounter();
setInterval(updateCounter, 1000);

/* =========================================================
   4. REPRODUCTOR DE MÚSICA + WEB AUDIO API
   ========================================================= */
music.volume = 0.7;
let sourceNode = null;

// 1. La función que conecta el audio
function initAudioContext() {
  if (audioCtx) return; // Si ya existe, no hacer nada

  // Creamos el contexto
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 128;
  analyser.smoothingTimeConstant = 0.75;
  
  // Conectamos
  sourceNode = audioCtx.createMediaElementSource(music);
  sourceNode.connect(analyser);
  analyser.connect(audioCtx.destination);
  
  frequencyData = new Uint8Array(analyser.frequencyBinCount);
  
  console.log("✅ AudioContext conectado y listo para el ecualizador");
}

// 1. Función para cambiar de canción
function loadTrack(index) {
  music.src = playlist[index];
  music.load(); // Obliga al navegador a cargar la nueva canción
}

// 2. Evento del botón Play/Pause
musicBtn.addEventListener('click', async () => {
  initAudioContext(); // Nos aseguramos que el audio esté conectado
  
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }

  if (music.paused) {
    music.play();
  } else {
    music.pause();
  }
});

// 3. Evento del botón Siguiente
nextBtn.addEventListener('click', () => {
  currentTrack = (currentTrack + 1) % playlist.length;
  loadTrack(currentTrack);
  music.play();
});

// 👇 NUEVO: Evento del botón Anterior
prevBtn.addEventListener('click', () => {
  // La fórmula para ir hacia atrás: (índice - 1 + total) % total
  currentTrack = (currentTrack - 1 + playlist.length) % playlist.length;
  loadTrack(currentTrack);
  music.play();
});

// 4. Cuando una canción termina, salta a la siguiente
music.addEventListener('ended', () => {
  currentTrack = (currentTrack + 1) % playlist.length;
  loadTrack(currentTrack);
  music.play();
});

// 5. Sincronizar iconos
music.addEventListener('play', async () => {
  initAudioContext();
  if (audioCtx.state === 'suspended') await audioCtx.resume();
  
  iconPlay.style.display = 'none';
  iconPause.style.display = 'block';
  musicBtn.classList.add('playing');
});

music.addEventListener('pause', () => {
  iconPlay.style.display = 'block';
  iconPause.style.display = 'none';
  musicBtn.classList.remove('playing');
});


/* =========================================================
   5. DIBUJAR EL ECUALIZADOR EN EL CANVAS
   ========================================================= */
function drawEqualizer() {
  // Si por alguna razón no hay analizador aún, no intentes dibujar
  if (!analyser || !frequencyData) return;

  const barCount = 64;
  const barWidth = W / barCount;
  const maxHeight = Math.min(160, H * 0.22);

  // 🔍 PRUEBA DE DIAGNÓSTICO: Lee las frecuencias
  analyser.getByteFrequencyData(frequencyData);
  
  // Si quieres ver si los datos llegan, descomenta la siguiente línea:
  // if (frequencyData[10] > 0) console.log("Datos llegando! Fuerza:", frequencyData[10]);

  for (let i = 0; i < barCount; i++) {
    const target = frequencyData[i] / 255; // Valor real entre 0 y 1
    
    // Interpolación suave
    smoothLevels[i] += (target - smoothLevels[i]) * 0.18;
    const level = smoothLevels[i];

    // Si la barra es muy bajita, sáltala para no dibujar basura
    if (level < 0.01) continue;

    const barHeight = level * maxHeight;
    const x = i * barWidth + barWidth * 0.15;
    const w = barWidth * 0.7;
    const baseY = H - 60; 
    const y = baseY - barHeight;

    // Gradiente de color
    const gradient = ctx.createLinearGradient(0, baseY, 0, y);
    gradient.addColorStop(0,   `rgba(120,  80, 220, ${0.4 + level * 0.6})`);
    gradient.addColorStop(0.5, `rgba(200, 120, 255, ${0.4 + level * 0.6})`);
    gradient.addColorStop(1,   `rgba(255, 210, 255, ${0.3 + level * 0.7})`);

    ctx.fillStyle = gradient;
    ctx.shadowColor = 'rgba(190, 130, 255, 0.9)';
    ctx.shadowBlur = level * 25; 
    ctx.fillRect(x, y, w, barHeight);
    ctx.shadowBlur = 0; 
  }
}
// Intento de autoplay silencioso → algunos navegadores lo permiten si está muteado.
// Si no, el usuario pulsa el botón. Buena práctica: NUNCA molestar con sonido sin permiso.
music.play().catch(() => {
  // Bloqueado por el navegador → no pasa nada, el botón está disponible
  console.log('Autoplay bloqueado, el usuario puede activar la música con el botón 🎵');
});

// Arranca la música al primer toque/clic en cualquier parte
function startMusicOnce() {
  music.play().catch(() => {});
  document.removeEventListener('click', startMusicOnce);
  document.removeEventListener('touchstart', startMusicOnce);
}
document.addEventListener('click', startMusicOnce);
document.addEventListener('touchstart', startMusicOnce);

/* =========================================================
   6. MODAL DE IMÁGENES (LIGHTBOX) Y ESTRELLAS EXTRA
   ========================================================= */
const modal = document.getElementById('image-modal');
const modalImg = document.getElementById('modal-img');
const closeModalBtn = document.querySelector('.close-modal');
const cards = document.querySelectorAll('.star-card');

cards.forEach(card => {
  card.addEventListener('click', (e) => {
    const img = card.querySelector('img');
    if (img) {
      // Abrimos el modal
      modal.classList.add('active');
      modalImg.src = img.src;

      // Lanzamos 5 estrellas fugaces de golpe como efecto especial
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          shootingStars.push(new ShootingStar());
        }, i * 200);
      }
    }
  });
});

closeModalBtn.addEventListener('click', () => {
  modal.classList.remove('active');
});

modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.remove('active');
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('active')) {
    modal.classList.remove('active');
  }
});


/* =========================================================
   7. EFECTO TILT 3D EN LAS TARJETAS
   ========================================================= */
const tiltCards = document.querySelectorAll('.star-card');

tiltCards.forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    
    // Calculamos la posición del mouse dentro de la tarjeta
    const x = e.clientX - rect.left; 
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Rotación máxima de 15 grados
    const rotateX = ((y - centerY) / centerY) * -15; 
    const rotateY = ((x - centerX) / centerX) * 15;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale(1)`;
    card.style.transition = `transform 0.5s ease`;
  });
  
  card.addEventListener('mouseenter', () => {
    card.style.transition = 'none';
  });
});