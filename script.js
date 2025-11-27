window.addEventListener('load', () => {
  const apologyScreen = document.getElementById('apologyScreen');
  const startButton = document.getElementById('startButton');
  const addButton = document.getElementById('addSunflower');
  const container = document.getElementById('container');
  const canvas = document.getElementById('sunflower');
  const ctx = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let sunflowers = [];
  let clouds = [];
  let birds = [];
  let floatingTexts = [];
  let butterflies = [];

  const compliments = [
    "Sleepy head 😴",
    "Your Urdu ray is off 😆",
    "Funny as always 😂",
    "Beautiful 🌸",
    "Your smile is magic ✨",
    "Queen of jokes 👑",
    "You are my sunshine 🌻",
    "Sassy and lovely 😎",
    "Brains & beauty 💖",
    "Cute troublemaker 😜"
  ];

  const grassMargin = 50;

  // ----- Grass -----
  function getGrassTop() {
    const buttonRect = addButton.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    return (buttonRect.top - canvasRect.top) - grassMargin;
  }

  function drawGrass(ctx) {
    const grassTop = getGrassTop();
    const grassHeight = canvas.height - grassTop;
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, grassTop, canvas.width, grassHeight);
    return grassTop;
  }

  // ----- Sunflower -----
  class Sunflower {
    constructor(x, grassTop) {
      this.x = x;
      this.stemTop = grassTop;
      this.stemHeight = 120;
      this.stemWidth = 6;
      this.maxRadius = 30;
      this.currentRadius = 5;
      this.opacity = 0;
      this.fadeSpeed = 0.0033;
      this.petalCount = 25;
      this.petalLength = 35;
      this.petalWidth = 12;
      this.centerColor = '#8B4513';
      this.petalColor = '#FFD700';
      this.leafCount = 2;
    }

    draw(ctx) {
      if (this.opacity < 1) this.opacity += this.fadeSpeed;
      ctx.globalAlpha = Math.min(this.opacity, 1);

      // Stem
      ctx.beginPath();
      ctx.strokeStyle = 'green';
      ctx.lineWidth = this.stemWidth;
      ctx.moveTo(this.x, this.stemTop);
      ctx.lineTo(this.x, this.stemTop - this.stemHeight);
      ctx.stroke();

      // Leaves
      for (let i = 1; i <= this.leafCount; i++) {
        let leafY = this.stemTop - (i * this.stemHeight / (this.leafCount + 1));
        ctx.beginPath();
        ctx.fillStyle = 'green';
        ctx.ellipse(this.x - 10, leafY, 8, 20, -Math.PI / 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(this.x + 10, leafY, 8, 20, Math.PI / 6, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Flower
      if (this.currentRadius < this.maxRadius) this.currentRadius += 0.2;
      const centerY = this.stemTop - this.stemHeight - this.currentRadius;

      for (let i = 0; i < this.petalCount; i++) {
        const angle = (i * 2 * Math.PI) / this.petalCount;
        const px = this.x + Math.cos(angle) * this.currentRadius;
        const py = centerY + Math.sin(angle) * this.currentRadius;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(angle);
        const petalGradient = ctx.createLinearGradient(0, -this.petalLength/2, 0, this.petalLength/2);
        petalGradient.addColorStop(0, '#FFD700');
        petalGradient.addColorStop(1, '#FFA500');
        ctx.fillStyle = petalGradient;
        ctx.ellipse(0, this.petalLength / 2, this.petalWidth / 2, this.petalLength, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
      }

      // Center
      ctx.beginPath();
      ctx.arc(this.x, centerY, this.currentRadius, 0, 2 * Math.PI);
      ctx.fillStyle = this.centerColor;
      ctx.fill();

      ctx.globalAlpha = 1;
    }
  }

  // ----- Clouds -----
  class Cloud {
    constructor(x, y, scale = 1) { this.x = x; this.y = y; this.scale = scale; this.speed = 0.2 + Math.random() * 0.3; }
    draw(ctx) {
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.ellipse(this.x, this.y, 60 * this.scale, 30 * this.scale, 0, 0, Math.PI * 2);
      ctx.ellipse(this.x + 40 * this.scale, this.y + 10 * this.scale, 50 * this.scale, 25 * this.scale, 0, 0, Math.PI * 2);
      ctx.ellipse(this.x - 40 * this.scale, this.y + 10 * this.scale, 50 * this.scale, 25 * this.scale, 0, 0, Math.PI * 2);
      ctx.fill();
      this.x += this.speed;
      if (this.x - 100 * this.scale > canvas.width) this.x = -100 * this.scale;
    }
  }

  // ----- Birds -----
  class Bird { constructor(x, y) { this.x = x; this.y = y; this.speed = 2 + Math.random() * 2; }
    draw(ctx) { ctx.beginPath(); ctx.strokeStyle = '#555'; ctx.lineWidth = 2; ctx.moveTo(this.x, this.y); ctx.lineTo(this.x + 10, this.y - 5); ctx.lineTo(this.x + 20, this.y); ctx.stroke(); this.x += this.speed; if (this.x > canvas.width + 20) this.x = -20; }
  }

  // ----- Floating Text -----
  class FloatingText {
    constructor(x, y, text) { this.x = x; this.y = y; this.text = text; this.life = 0; this.totalLife = 180; this.opacity = 0; }
    draw(ctx) {
      if (this.life < 30) this.opacity = this.life / 30;
      else if (this.life > this.totalLife - 30) this.opacity = 1 - (this.life - (this.totalLife - 30)) / 30;
      else this.opacity = 1;
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = '#333';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(this.text, this.x, this.y);
      ctx.restore();
      this.y -= 0.5;
      this.life++;
    }
  }

  // ----- Butterflies -----
  class Butterfly {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.speedX = (Math.random() - 0.5) * 2;
      this.speedY = -1 - Math.random();
      this.angle = 0;
    }
    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(Math.sin(this.angle) * 0.5);
      ctx.fillStyle = 'pink';
      ctx.beginPath();
      ctx.ellipse(-5, 0, 5, 10, Math.PI / 4, 0, 2*Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(5, 0, 5, 10, -Math.PI / 4, 0, 2*Math.PI);
      ctx.fill();
      ctx.font = '18px Arial';
      ctx.fillText('❤️', 0, -10);
      ctx.restore();
      this.x += this.speedX;
      this.y += this.speedY;
      this.angle += 0.1;
      return this.y > -20;
    }
  }

  // ----- Initialize clouds & birds -----
  for (let i = 0; i < 5; i++) clouds.push(new Cloud(Math.random() * canvas.width, 50 + Math.random() * 50, 0.5 + Math.random() * 0.5));
  for (let i = 0; i < 3; i++) birds.push(new Bird(Math.random() * canvas.width, 100 + Math.random() * 100));

  // ----- Buttons -----
  startButton.addEventListener('click', () => {
    apologyScreen.style.display = 'none';
    container.style.display = 'block';
    const grassTop = getGrassTop();
    sunflowers.push(new Sunflower(canvas.width / 2, grassTop));
    floatingTexts.push(new FloatingText(canvas.width / 2, grassTop - 80, "You're amazing! 🌻"));
  });

  addButton.addEventListener('click', () => {
    const x = Math.random() * (canvas.width - 100) + 50;
    const grassTop = getGrassTop();
    sunflowers.push(new Sunflower(x, grassTop));
    const compliment = compliments[Math.floor(Math.random() * compliments.length)];
    floatingTexts.push(new FloatingText(x, grassTop - 80, compliment));
    butterflies.push(new Butterfly(x, grassTop - 10));
  });

  canvas.addEventListener('touchmove', e => { e.preventDefault(); });

  // ----- Animate -----
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const grassTop = drawGrass(ctx);

    clouds.forEach(c => c.draw(ctx));
    birds.forEach(b => b.draw(ctx));
    sunflowers.forEach(s => s.draw(ctx));
    floatingTexts.forEach((t, i) => { t.draw(ctx); if(t.life > t.totalLife) floatingTexts.splice(i,1); });
    butterflies = butterflies.filter(b => b.draw(ctx));

    requestAnimationFrame(animate);
  }

  animate();
});