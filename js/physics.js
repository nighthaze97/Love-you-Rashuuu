/**
 * Physics Engine for Anti-Gravity Effects
 * Handles lightweight particle physics without heavy libraries
 */

class PhysicsEngine {
    constructor() {
        this.particles = [];
        this.lastTime = 0;
        this.gravity = -0.05; // Negative for anti-gravity (upward float)
        this.airResistance = 0.99;
        this.wind = 0;
        this.isRunning = false;
    }

    // Add a particle to the system
    addParticle(particle) {
        this.particles.push(particle);
    }

    // Remove a particle
    removeParticle(particle) {
        const index = this.particles.indexOf(particle);
        if (index > -1) {
            this.particles.splice(index, 1);
        }
    }

    // Start the physics loop
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastTime = performance.now();
            requestAnimationFrame((time) => this.loop(time));
        }
    }

    // Stop the loop
    stop() {
        this.isRunning = false;
    }

    // Main physics loop
    loop(currentTime) {
        if (!this.isRunning) return;

        const deltaTime = (currentTime - this.lastTime) / 16.7; // Normalize to ~60fps
        this.lastTime = currentTime;

        // Update wind occasionally
        if (Math.random() < 0.01) {
            this.wind = (Math.random() - 0.5) * 0.02;
        }

        // Update all particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            // Apply forces
            p.vx += this.wind;
            p.vy += this.gravity * p.mass;

            // Apply air resistance
            p.vx *= this.airResistance;
            p.vy *= this.airResistance;

            // Update position
            p.x += p.vx * deltaTime;
            p.y += p.vy * deltaTime;

            // Update rotation
            p.rotation += p.rotationSpeed * deltaTime;

            // Bounds check (remove if off screen significantly)
            if (p.y < -100 || p.x < -50 || p.x > window.innerWidth + 50) {
                if (p.element && p.element.parentNode) {
                    p.element.parentNode.removeChild(p.element);
                }
                this.particles.splice(i, 1);
                continue;
            }

            // Update DOM element
            if (p.element) {
                p.element.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) rotate(${p.rotation}deg) scale(${p.scale})`;
                p.element.style.opacity = p.life < 0.1 ? p.life * 10 : p.opacity;
            }

            // Reduce life
            p.life -= p.decay * deltaTime;
            if (p.life <= 0) {
                if (p.element && p.element.parentNode) {
                    p.element.parentNode.removeChild(p.element);
                }
                this.particles.splice(i, 1);
            }
        }

        requestAnimationFrame((time) => this.loop(time));
    }
}

// Export for use
window.PhysicsEngine = PhysicsEngine;
