/**
 * Particle System for Visual Effects
 * Handles anti-gravity hearts, sparkles, and confetti
 */

class ParticleSystem {
    constructor(container, options = {}) {
        this.container = container || document.querySelector('.particles-container');
        this.options = {
            maxParticles: options.maxParticles || 50,
            spawnRate: options.spawnRate || 500,
            particleLifespan: options.particleLifespan || 10000,
            riseSpeed: options.riseSpeed || 0.5,
            drift: options.drift || 0.2,
            minSize: options.minSize || 10,
            maxSize: options.maxSize || 30
        };
        this.active = false;
        this.particles = [];
        this.spawnTimer = null;
    }

    // Start generating particles
    start() {
        if (this.active) return;
        this.active = true;

        const spawn = () => {
            if (!this.active) return;

            // Random position at bottom of screen
            const x = Math.random() * window.innerWidth;
            const y = window.innerHeight + 20;

            this.createParticle(x, y, 'heart');

            // Schedule next spawn based on rate
            const rate = 60000 / this.options.spawnRate; // particles per minute to ms delay
            this.spawnTimer = setTimeout(spawn, rate);
        };

        spawn();
    }

    // Stop generating particles
    stop() {
        this.active = false;
        if (this.spawnTimer) {
            clearTimeout(this.spawnTimer);
            this.spawnTimer = null;
        }
    }

    // Create a burst of particles
    burst(x, y, count = 15, options = {}) {
        const spread = options.spread || 100;

        // Map app.js 'duration' to 'particleLifespan'
        if (options.duration) {
            options.particleLifespan = options.duration;
        }

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * spread;
            const burstX = x + Math.cos(angle) * (Math.random() * 20); // Start close to center
            const burstY = y + Math.sin(angle) * (Math.random() * 20);

            // Override options for this particle
            const particleOptions = { ...this.options, ...options };

            // Calculate velocity based on speed option or default
            const speed = options.speed || (Math.random() * 5 + 2);

            this.createParticle(burstX, burstY, 'heart', particleOptions, {
                velocity: {
                    x: Math.cos(angle) * speed,
                    y: Math.sin(angle) * speed
                }
            });
        }
    }

    // Create a single particle
    createParticle(x, y, type = 'heart', options = this.options, physics = {}) {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        // Apply size
        const size = options.minSize + Math.random() * (options.maxSize - options.minSize);

        if (type === 'heart') {
            particle.classList.add('heart');
            // Random color variation for hearts
            const colors = ['#FFB6C1', '#FFC0CB', '#DC143C', '#FFF0F5', '#E74C6D'];
            const color = colors[Math.floor(Math.random() * colors.length)];

            // For SVG heart, we might need to set color, or just rely on filter if using image
            // In CSS, .particle.heart uses filter/hue-rotate or background image.
            // Let's check css... css uses a data:image svg with fill color.
            // We can change color using mask or just simple filter.
            particle.style.filter = `hue-rotate(${Math.random() * 60 - 30}deg)`;
        } else {
            // Sparkle
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
        }

        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        // Set initial position
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;

        this.container.appendChild(particle);

        // Movement Physics
        let vx = physics.velocity?.x || (Math.random() - 0.5) * 2;
        let vy = physics.velocity?.y || -options.riseSpeed * (Math.random() + 0.5) * 3;

        let opacity = 1;
        let scale = 0;
        let life = 100;
        const decay = 100 / (options.particleLifespan / 16); // Decay per frame

        const animate = () => {
            if (life <= 0) {
                particle.remove();
                return;
            }

            life -= decay;

            // Fade out near end
            opacity = life < 20 ? life / 20 : 1;

            // Scale up at start
            if (scale < 1) scale += 0.05;

            const currentLeft = parseFloat(particle.style.left);
            const currentTop = parseFloat(particle.style.top);

            // Apply movement
            vx += (Math.random() - 0.5) * options.drift;
            vy -= 0.05; // Slight gravity/buoyancy adjustment? No, hearts usually rise.
            // But for burst, they explode out then maybe drift down or up?
            // If it's a burst, we want explosion.

            // If it was a burst (velocity provided), apply gravity/drag
            if (physics.velocity) {
                vx *= 0.95; // Drag
                vy *= 0.95;
                vy += 0.1; // Gravity pulls down
            } else {
                // Background rising particles
                vy = -options.riseSpeed;
            }

            particle.style.left = `${currentLeft + vx}px`;
            particle.style.top = `${currentTop + vy}px`;
            particle.style.opacity = opacity;
            particle.style.transform = `scale(${scale}) rotate(${life}deg)`;

            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }
}

// Export
window.ParticleSystem = ParticleSystem;
