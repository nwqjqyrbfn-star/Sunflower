const canvas = document.getElementById('sunflower');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let sunflowers = [];
const mistParticles = [];
const mistCount = 80;
const floatingTexts = [];
const message = document.getElementById('message');

class Sunflower {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.petals = [];
    this.petalCount = 50;
    this.centerRadius = 50;
    for (let i = 0; i < this.petalCount; i++) {
      this.petals.push({
        angle: (i * 2 * Math.PI) / this.petalCount,
        radius: 0,
        pulse: Math.random() * 0.5 + 0.5
      });
    }
  }
  draw() {
    this.petals.forEach(p => {
      if (p.radius < 150) p.radius += 2;
      const pulse = Math.sin(Date.now() * 0.005 + p.angle) * 0.5 + 1;
      const x = this.x + Math.cos(p.angle) * p.radius * pulse;
      const y = this.y + Math.sin(p.angle) * p.radius * pulse;

      ctx.beginPath();
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 20);
      gradient.addColorStop(0, '#ff4500');
      gradient.addColorStop(1, '#8b0000');
      ctx.fillStyle = gradient;
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur = 30 * pulse;
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();
    });

    const centerPulse = Math.sin(Date.now() * 0.005) * 0.3 + 1;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.centerRadius * centerPulse, 0, Math.PI * 2);
    ctx.fillStyle = '#8b0000';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 50 * centerPulse;
    ctx.fill();
  }
}

class FloatingText {
  constructor(x, y, text) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.opacity = 1;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = '#ff4c4c';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
    this.y -= 0.5;
    this.opacity -= 0.005;
  }
}

for (let i = 0; i < mistCount; i++) {
  mistParticles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 50 + 50,
    speed: Math.random() * 0.5 + 0.2,
    opacity: Math.random() * 0.3 + 0.2
  });
}

sunflowers.push(new Sunflower(canvas.width/2, canvas.height/2));

document.getElementById('addSunflower').addEventListener('click', () => {
  const x = Math.random() * (canvas.width - 200) + 100;
  const y = Math.random() * (canvas.height - 200) + 100;
  sunflowers.push(new Sunflower(x, y));
  floatingTexts.push(new FloatingText(x, y - 80, 'You are my sunshine 🌻'));
});

function handleTouch(e) {
  const touch = e.touches[0];
  const dx = touch.clientX - canvas.width / 2;
  const dy = touch.clientY - canvas.height / 2;
  const angle = Math.atan2(dy, dx);
  sunflowers.forEach(s => {
    s.petals.forEach(p => p.angle += 0.005 * Math.sin(angle));
  });
}

canvas.addEventListener('touchmove', handleTouch);

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  mistParticles.forEach(p => {
    p.y -= p.speed;
    if (p.y + p.radius < 0) p.y = canvas.height + p.radius;
    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
    gradient.addColorStop(0, `rgba(255,0,0,${p.opacity})`);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  sunflowers.forEach(s => s.draw());

  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    floatingTexts[i].draw();
    if (floatingTexts[i].opacity <= 0) floatingTexts.splice(i, 1);
  }

  const centerPulse = Math.sin(Date.now() * 0.005) * 0.05 + 1;
  message.style.transform = `translate(-50%, -50%) scale(${1 * centerPulse})`;

  requestAnimationFrame(animate);
}

animate();