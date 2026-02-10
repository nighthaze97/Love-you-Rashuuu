/**
 * Valentine's Day Website - Main Application
 * Orchestrates all pages, interactions, and animations
 */

document.addEventListener('DOMContentLoaded', () => {
    // ============================================
    // Initialize Systems
    // ============================================

    const particlesContainer = document.getElementById('particles-container');
    const floatingHearts = new ParticleSystem(particlesContainer, {
        maxParticles: 80,
        spawnRate: 600,
        particleLifespan: 14000,
        riseSpeed: 0.4,
        drift: 0.15,
        minSize: 10,
        maxSize: 35
    });

    // ============================================
    // Music Logic
    // ============================================
    const music = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-toggle');
    const iconMusic = musicBtn.querySelector('.icon-music');
    const iconMute = musicBtn.querySelector('.icon-mute');
    let isPlaying = false;

    // Function to update UI based on playing state
    function updateMusicUI(playing) {
        if (playing) {
            iconMusic.style.display = 'block';
            iconMute.style.display = 'none';
        } else {
            iconMusic.style.display = 'none';
            iconMute.style.display = 'block';
        }
    }

    function toggleMusic() {
        if (isPlaying) {
            music.pause();
            isPlaying = false;
            updateMusicUI(false);
        } else {
            playMusic();
        }
    }

    function playMusic() {
        music.play().then(() => {
            isPlaying = true;
            updateMusicUI(true);
            // Remove auto-play listeners once successful
            document.removeEventListener('click', tryAutoPlay);
            document.removeEventListener('touchstart', tryAutoPlay);
            document.removeEventListener('keydown', tryAutoPlay);
            document.removeEventListener('scroll', tryAutoPlay);
        }).catch(e => {
            console.log("Audio play failed (will retry on interaction):", e);
            isPlaying = false;
            updateMusicUI(false);
        });
    }

    // Try to play immediately (often blocked, but worth a try)
    playMusic();

    // Interaction handler to start music if auto-play was blocked
    function tryAutoPlay() {
        if (!isPlaying) {
            playMusic();
        }
    }

    // Add listeners for any user interaction
    document.addEventListener('click', tryAutoPlay, { once: true });
    document.addEventListener('touchstart', tryAutoPlay, { once: true });
    document.addEventListener('keydown', tryAutoPlay, { once: true });
    document.addEventListener('scroll', tryAutoPlay, { once: true });

    musicBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMusic();
    });

    // ============================================
    // Navigation Logic
    // ============================================

    const transitionManager = new TransitionManager();

    const pages = {
        mailbox: document.getElementById('page-mailbox'),
        envelope: document.getElementById('page-envelope'),
        note: document.getElementById('page-note'),
        proposal: document.getElementById('page-proposal'),
        memories: document.getElementById('page-memories')
    };

    // Page order for navigation
    const pageOrder = ['mailbox', 'envelope', 'note', 'proposal', 'memories'];
    let currentPageIndex = 0;

    // Navigation buttons
    const navPrev = document.getElementById('nav-prev');
    const navNext = document.getElementById('nav-next');

    function updateNavButtons() {
        // Hide prev on first page
        if (currentPageIndex === 0) {
            navPrev.classList.add('hidden');
        } else {
            navPrev.classList.remove('hidden');
        }
        // Hide next on last page
        if (currentPageIndex === pageOrder.length - 1) {
            navNext.classList.add('hidden');
        } else {
            navNext.classList.remove('hidden');
        }
    }

    navPrev.addEventListener('click', () => {
        if (currentPageIndex > 0) {
            currentPageIndex--;
            transitionManager.transitionTo(pageOrder[currentPageIndex]);
            updateNavButtons();
        }
    });

    navNext.addEventListener('click', () => {
        if (currentPageIndex < pageOrder.length - 1) {
            currentPageIndex++;
            transitionManager.transitionTo(pageOrder[currentPageIndex]);
            updateNavButtons();
        }
    });

    // Initialize nav buttons visibility
    updateNavButtons();

    // Helper to navigate and update index (used by seal clicks etc)
    function navigateToPage(pageName) {
        const index = pageOrder.indexOf(pageName);
        if (index !== -1) {
            currentPageIndex = index;
            updateNavButtons();
        }
    }

    // ============================================
    // Register Pages with Transition Manager
    // ============================================

    transitionManager.registerPage('mailbox', pages.mailbox, {
        enterAnimation: 'fade',
        leaveAnimation: 'fadeBlur',
        onEnter: () => {
            floatingHearts.start();
            initMailboxPage();
        },
        onLeave: () => {
            // Keep particles running
        }
    });

    transitionManager.registerPage('envelope', pages.envelope, {
        enterAnimation: 'fadeBlur',
        leaveAnimation: 'zoomIn',
        onEnter: () => {
            initEnvelopePage();
        },
        onLeave: () => {
            floatingHearts.stop();
        }
    });

    transitionManager.registerPage('note', pages.note, {
        enterAnimation: 'floatUp',
        leaveAnimation: 'floatUp',
        onEnter: () => {
            floatingHearts.options.maxParticles = 8;
            floatingHearts.options.spawnRate = 4000;
            floatingHearts.start();
            initNotePage();
        },
        onLeave: () => {
            floatingHearts.stop();
        }
    });

    transitionManager.registerPage('proposal', pages.proposal, {
        enterAnimation: 'floatUp',
        leaveAnimation: 'fade',
        onEnter: () => {
            floatingHearts.options.maxParticles = 12;
            floatingHearts.options.spawnRate = 3000;
            floatingHearts.start();
            initProposalPage();
        }
    });

    transitionManager.registerPage('memories', pages.memories, {
        enterAnimation: 'floatUp',
        leaveAnimation: 'fade',
        onEnter: () => {
            // Stop YAY celebration if running (stop spawning new ones)
            if (window.celebrationInterval) {
                clearInterval(window.celebrationInterval);
                window.celebrationInterval = null;
            }
            // Let existing emojis naturally complete their fall animation
            // They will be removed by their own timeout after ~5 seconds

            floatingHearts.options.maxParticles = 8; // Reduced from 15 for performance
            floatingHearts.options.spawnRate = 2500;
            floatingHearts.start();
            initMemoriesPage();
        }
    });

    // ============================================
    // PAGE 5: Memories Page Logic
    // ============================================

    let memoriesObserver = null;

    function initMemoriesPage() {
        const memoryCards = document.querySelectorAll('.memory-card');
        const collageItems = document.querySelectorAll('.collage-item');
        const footer = document.querySelector('.memories-footer');

        const elementsToAnimate = [...memoryCards, ...collageItems];
        if (footer) elementsToAnimate.push(footer);

        // Add initial class for animation
        elementsToAnimate.forEach(el => {
            el.classList.add('scroll-animate');
        });

        // specific delays for gallery items to create a wave effect
        memoryCards.forEach((card, index) => {
            card.style.transitionDelay = `${index * 0.1}s`;
        });

        if (memoriesObserver) {
            memoriesObserver.disconnect();
        }

        memoriesObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Optional: Stop observing once visible to save performance
                    memoriesObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px' // Trigger slightly before bottom
        });

        elementsToAnimate.forEach(el => {
            memoriesObserver.observe(el);
        });
    }

    // ============================================
    // PAGE 1: Mailbox Landing
    // ============================================

    function initMailboxPage() {
        const letterContainer = document.querySelector('.letter-container');
        const letter = document.querySelector('.letter');
        const clickHint = document.querySelector('.click-hint');

        // Reset state
        if (letterContainer) {
            letterContainer.classList.remove('emerged', 'floating');
        }

        // Trigger letter emergence after delay
        setTimeout(() => {
            if (letterContainer) {
                letterContainer.classList.add('emerged');

                // Add floating animation after emergence completes
                // Removed per user request - letter stays static at emerged position
                // setTimeout(() => {
                //     letterContainer.classList.add('floating');
                // }, 2500); 
            }
            // Show hint with delay
            if (clickHint) {
                setTimeout(() => {
                    clickHint.style.opacity = '1';
                }, 2000);
            }
        }, 1500);

        // Letter click handler (attach to letter for easier clicking, or specific seal)
        if (letter) {
            letter.removeEventListener('click', handleLetterClick);
            letter.addEventListener('click', handleLetterClick);
        }
    }

    function handleLetterClick() {
        const letter = document.querySelector('.letter');

        // Animate letter lifting/opening effect
        letter.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease';
        letter.style.transform = 'translateY(-100px) scale(1.1) rotate(0deg)';
        letter.style.opacity = '0'; // Fade out as it effectively "opens" into the next page

        // Add blur to background
        pages.mailbox.style.transition = 'filter 0.8s ease';
        pages.mailbox.style.filter = 'blur(8px)';

        setTimeout(() => {
            navigateToPage('envelope');
            transitionManager.transitionTo('envelope', {
                duration: 1000,
                enterAnimation: 'fadeBlur'
            });

            // Reset styles after transition
            setTimeout(() => {
                pages.mailbox.style.filter = '';
                letter.style.transform = '';
                letter.style.opacity = '';
            }, 1000);
        }, 600);
    }

    // ============================================
    // PAGE 2: Envelope Opening
    // ============================================

    let envelopeOpened = false;

    function initEnvelopePage() {
        envelopeOpened = false;
        const waxSeal = document.querySelector('.page-envelope .wax-seal');
        const envelopeFlap = document.querySelector('.envelope-flap');

        if (envelopeFlap) {
            envelopeFlap.classList.remove('open');
        }

        if (waxSeal) {
            waxSeal.removeEventListener('click', handleSealClick);
            waxSeal.addEventListener('click', handleSealClick);
        }
    }

    function handleSealClick(e) {
        e.stopPropagation();
        if (envelopeOpened) return;
        envelopeOpened = true;

        const envelope = document.querySelector('.envelope');
        const envelopeFlap = document.querySelector('.envelope-flap');
        const waxSeal = document.querySelector('.page-envelope .wax-seal');
        const clickHint = document.querySelector('.page-envelope .click-anywhere');

        envelope.classList.add('opening');
        if (clickHint) clickHint.style.opacity = '0';

        // Animate the seal breaking/fading
        if (waxSeal) {
            waxSeal.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
            waxSeal.style.transform = 'translate(-50%, -50%) scale(1.5)';
            waxSeal.style.opacity = '0';
        }

        // Open flap after seal breaks
        setTimeout(() => {
            envelopeFlap.classList.add('open');
        }, 400);

        // Release particles after flap opens
        setTimeout(() => {
            releaseEnvelopeParticles();
        }, 1200);

        // Transition to next page
        setTimeout(() => {
            navigateToPage('note');
            transitionManager.transitionTo('note', {
                duration: 1200,
                enterAnimation: 'zoomIn'
            });
        }, 2800);
    }

    function releaseEnvelopeParticles() {
        const envelope = document.querySelector('.envelope');
        const rect = envelope.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 3;

        // Create floating hearts that rise up
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const heart = createFloatingHeart();
                heart.style.left = `${centerX + (Math.random() - 0.5) * 100}px`;
                heart.style.top = `${centerY + (Math.random() - 0.5) * 50}px`;
                particlesContainer.appendChild(heart);

                // Animate rising
                const startY = centerY + (Math.random() - 0.5) * 50;
                const drift = (Math.random() - 0.5) * 100;

                heart.animate([
                    {
                        transform: 'translateY(0) rotate(0deg) scale(0)',
                        opacity: 0
                    },
                    {
                        transform: 'translateY(-20px) rotate(5deg) scale(1)',
                        opacity: 0.8,
                        offset: 0.1
                    },
                    {
                        transform: `translateY(-200px) translateX(${drift}px) rotate(${Math.random() * 30 - 15}deg) scale(0.8)`,
                        opacity: 0
                    }
                ], {
                    duration: 2000 + Math.random() * 1000,
                    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    fill: 'forwards'
                }).onfinish = () => {
                    heart.remove();
                };
            }, i * 80);
        }
    }

    function createFloatingHeart() {
        const size = 15 + Math.random() * 15;
        const colors = ['#E74C6D', '#FFB6C1', '#FF91A4', '#C41E3A'];
        const color = colors[Math.floor(Math.random() * colors.length)];

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        svg.style.position = 'fixed';
        svg.style.pointerEvents = 'none';
        svg.style.zIndex = '1001';

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z');
        path.setAttribute('fill', color);

        svg.appendChild(path);
        return svg;
    }

    // ============================================
    // PAGE 3: Note & Bouquet
    // ============================================

    function initNotePage() {
        const continueBtn = document.querySelector('.continue-btn');

        if (continueBtn) {
            continueBtn.addEventListener('click', handleContinueClick);
        }

        // Add subtle idle animation to bouquet
        const bouquet = document.querySelector('.bouquet-container');
        if (bouquet) {
            bouquet.classList.add('sway');
        }
    }

    function handleContinueClick() {
        const loveNote = document.querySelector('.love-note');
        const bouquet = document.querySelector('.bouquet-section');

        // Float elements upward
        [loveNote, bouquet].forEach((el, i) => {
            if (el) {
                el.animate([
                    { transform: el.style.transform || 'none', opacity: 1 },
                    { transform: 'translateY(-30px)', opacity: 0 }
                ], {
                    duration: 800,
                    delay: i * 100,
                    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                    fill: 'forwards'
                });
            }
        });

        setTimeout(() => {
            navigateToPage('proposal');
            transitionManager.transitionTo('proposal', {
                duration: 1000,
                enterAnimation: 'floatUp'
            });
        }, 600);
    }

    // ============================================
    // PAGE 4: Valentine Proposal
    // ============================================

    let noButtonPhysics = null;

    function initProposalPage() {
        const yesBtn = document.querySelector('.btn-yes');
        const noBtn = document.querySelector('.btn-no');
        const buttonsContainer = document.querySelector('.buttons-container');

        if (yesBtn) {
            yesBtn.addEventListener('click', handleYesClick);
        }

        if (noBtn && buttonsContainer) {
            initNoButtonPhysics(noBtn, buttonsContainer);
        }
    }

    function initNoButtonPhysics(noBtn, container) {
        let isActive = false;
        let posX, posY;
        let isMoving = false; // Throttle flag
        let textTimeout = null; // Track text reset timeout

        const activatePhysics = () => {
            if (isActive) return;
            isActive = true;

            const btnRect = noBtn.getBoundingClientRect();

            // Create a spacer to maintain Grid layout
            const spacer = document.createElement('div');
            spacer.style.width = `${btnRect.width}px`;
            spacer.style.height = `${btnRect.height}px`;
            spacer.style.margin = getComputedStyle(noBtn).margin;
            spacer.style.display = 'block';
            spacer.style.visibility = 'hidden';

            noBtn.parentNode.insertBefore(spacer, noBtn);

            // Position the NO button FIXED
            posX = btnRect.left;
            posY = btnRect.top;

            noBtn.style.position = 'fixed';
            noBtn.style.left = `${posX}px`;
            noBtn.style.top = `${posY}px`;
            noBtn.style.width = 'auto';
            noBtn.style.margin = '0';
            noBtn.style.zIndex = '9999';
            noBtn.style.transition = 'left 0.25s ease-out, top 0.25s ease-out, transform 0.25s ease-out';

            // Start proximity detection
            document.addEventListener('mousemove', checkProximity);
        };

        // Funny text options
        const funnyTexts = [
            "NOPE!", "TOO SLOW!", "TRY AGAIN!", "MISSED!",
            "CATCH ME!", "NOT TODAY!", "ASALU KUDARADU!", "CHANCE EH LEDU!",
            "NICE TRY!", "HAHA!", "PAKKA VELLIPO!", "IMPOSSIBLE!"
        ];

        const originalText = noBtn.innerText;

        const moveButton = () => {
            // Activate on first interaction
            if (!isActive) {
                activatePhysics();
            }

            // Throttle - prevent rapid movements
            if (isMoving) return;

            isMoving = true;
            setTimeout(() => { isMoving = false; }, 300); // 300ms cooldown

            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const currentBtnRect = noBtn.getBoundingClientRect();
            const padding = 80;

            const maxX = viewportWidth - currentBtnRect.width - padding;
            const maxY = viewportHeight - currentBtnRect.height - padding;

            let newX, newY;
            let attempts = 0;

            const currentX = parseFloat(noBtn.style.left) || 0;
            const currentY = parseFloat(noBtn.style.top) || 0;

            do {
                newX = padding + Math.random() * (maxX - padding);
                newY = padding + Math.random() * (maxY - padding);
                attempts++;
            } while (
                (Math.abs(newX - currentX) < 200 && Math.abs(newY - currentY) < 200) &&
                attempts < 15
            );

            noBtn.style.left = `${newX}px`;
            noBtn.style.top = `${newY}px`;

            // Subtle rotation
            const rotate = (Math.random() - 0.5) * 20;
            noBtn.style.transform = `rotate(${rotate}deg)`;

            // Clear any pending text reset
            if (textTimeout) clearTimeout(textTimeout);

            // Show funny text
            const randomText = funnyTexts[Math.floor(Math.random() * funnyTexts.length)];
            noBtn.innerText = randomText;

            // Reset text after delay
            textTimeout = setTimeout(() => {
                noBtn.innerText = originalText;
            }, 600);
        };

        // Proximity detection with throttle built-in
        const checkProximity = (e) => {
            if (!isActive || isMoving) return;

            const btnRect = noBtn.getBoundingClientRect();
            const btnCenterX = btnRect.left + btnRect.width / 2;
            const btnCenterY = btnRect.top + btnRect.height / 2;

            const distance = Math.hypot(e.clientX - btnCenterX, e.clientY - btnCenterY);

            if (distance < 120) {
                moveButton();
            }
        };

        noBtn.addEventListener('mouseenter', moveButton);

        noBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            moveButton();
        });

        noBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            moveButton();
        });
    }

    function handleYesClick() {
        const yesBtn = document.querySelector('.btn-yes');
        const btnRect = yesBtn.getBoundingClientRect();
        const centerX = btnRect.left + btnRect.width / 2;
        const centerY = btnRect.top + btnRect.height / 2;

        // Trigger small immediate blast of hearts for feedback
        floatingHearts.burst(centerX, centerY, 20, {
            spread: 80,
            duration: 1000,
            minSize: 10,
            maxSize: 20,
            speed: 8
        });

        // Trigger massive heart burst slightly later
        setTimeout(() => {
            floatingHearts.burst(centerX, centerY, 60, {
                spread: 400,
                duration: 2500,
                minSize: 20,
                maxSize: 45
            });
        }, 150);

        // Show final message
        setTimeout(() => {
            const finalMessage = document.querySelector('.final-message');
            if (finalMessage) {
                finalMessage.classList.add('visible');

                // EMPHASIS: Create Shower of Emojis
                const emojis = ['🥰', '🥳', '🎉', '💖', '💝', '💑', '💌', '💍', '🥹', '✨'];

                // Clear any existing interval to prevent stacking
                if (window.celebrationInterval) clearInterval(window.celebrationInterval);

                window.celebrationInterval = setInterval(() => {
                    // Hearts
                    const randomX = Math.random() * window.innerWidth;
                    const randomY = window.innerHeight;
                    floatingHearts.burst(randomX, randomY, 8, {
                        duration: 4000,
                        speed: 5 + Math.random() * 5,
                        spread: 120
                    });

                    // Cap active celebration emojis to prevent DOM overflow
                    const activeEmojis = document.querySelectorAll('.celebration-emoji');
                    if (activeEmojis.length > 40) return;

                    // Emoji Rain (spawn 4 emojis per tick)
                    for (let i = 0; i < 4; i++) {
                        const emoji = document.createElement('div');
                        emoji.classList.add('celebration-emoji'); // Tag for cleanup
                        emoji.innerText = emojis[Math.floor(Math.random() * emojis.length)];
                        emoji.style.cssText = `position:fixed;left:${Math.random() * 100}vw;top:-50px;font-size:${Math.random() * 30 + 20}px;z-index:1002;pointer-events:none;transition:top ${Math.random() * 2 + 3}s linear, opacity 0.5s ease-in;opacity:0;`;

                        document.body.appendChild(emoji);

                        // Trigger animation
                        requestAnimationFrame(() => {
                            emoji.style.opacity = '1';
                            emoji.style.top = '110vh'; // Fall off screen
                            emoji.style.transform = `translateX(${(Math.random() - 0.5) * 100}px) rotate(${Math.random() * 360}deg)`;
                        });

                        // Clean up
                        setTimeout(() => {
                            emoji.remove();
                        }, 5000);
                    }
                }, 500); // 500ms interval for dense shower
            }
        }, 800);
    }

    // ============================================
    // Start Application
    // ============================================

    // Handle "Forever starts now" button click - navigate to memories
    // Handle "Forever starts now" button click - navigate to memories
    const memoriesBtn = document.getElementById('btn-memories');
    if (memoriesBtn) {
        memoriesBtn.addEventListener('click', () => {
            // Add blast of hearts
            const btnRect = memoriesBtn.getBoundingClientRect();
            const centerX = btnRect.left + btnRect.width / 2;
            const centerY = btnRect.top + btnRect.height / 2;

            floatingHearts.burst(centerX, centerY, 30, {
                spread: 120,
                duration: 1500,
                minSize: 15,
                maxSize: 30,
                speed: 7
            });

            navigateToPage('memories');
            transitionManager.transitionTo('memories', {
                duration: 1000,
            });
        });
    }

    // Video hover-to-play for collage videos
    const collageVideos = document.querySelectorAll('.collage-video video');
    collageVideos.forEach(video => {
        video.parentElement.addEventListener('mouseenter', () => {
            video.play();
        });
        video.parentElement.addEventListener('mouseleave', () => {
            video.pause();
            video.currentTime = 0;
        });
    });

    // Sparkle Trail on Mouse Move (Memories Page)
    const memoriesPage = document.getElementById('page-memories');
    if (memoriesPage) {
        /* Sparkle Trail Disabled for Performance
        let throttle = false;
        memoriesPage.addEventListener('mousemove', (e) => {
            if (throttle) return;
            throttle = true;
            setTimeout(() => throttle = false, 50);

            const sparkle = document.createElement('div');
            sparkle.innerHTML = Math.random() > 0.5 ? '✨' : '💖';
            sparkle.style.position = 'fixed';
            sparkle.style.left = e.clientX + 'px';
            sparkle.style.top = e.clientY + 'px';
            sparkle.style.fontSize = (Math.random() * 10 + 10) + 'px';
            sparkle.style.pointerEvents = 'none';
            sparkle.style.zIndex = '1000';
            sparkle.style.transition = 'all 1s ease-out';
            sparkle.style.opacity = '1';

            document.body.appendChild(sparkle);

            // Animate out
            requestAnimationFrame(() => {
                sparkle.style.transform = `translate(${(Math.random() - 0.5) * 30}px, ${30 + Math.random() * 20}px) scale(0)`;
                sparkle.style.opacity = '0';
            });

            setTimeout(() => {
                sparkle.remove();
            }, 1000);
        });
        */
    }

    // Show first page
    transitionManager.showPage('mailbox');
});
