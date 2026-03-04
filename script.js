// Audio Context for synthesizing sounds directly in JS
let audioCtx;
let bgmOscillators = [];
let bgmGain;
let audioInitialized = false;

function initAudio() {
    if (audioInitialized) return;

    // Create audio context
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();

    // Setup BGM (Drone)
    bgmGain = audioCtx.createGain();
    bgmGain.gain.value = 0.05; // Quiet background
    bgmGain.connect(audioCtx.destination);

    // Create multiple oscillators for a thick drone sound
    const freqs = [55, 55.5, 110];
    freqs.forEach(freq => {
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        osc.connect(bgmGain);
        osc.start();
        bgmOscillators.push(osc);
    });

    // LFO for volume modulation (pulsing)
    const lfo = audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.25; // 4 second pulse
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 0.02;
    lfo.connect(lfoGain);
    lfoGain.connect(bgmGain.gain);
    lfo.start();

    audioInitialized = true;
}

function playExplosion() {
    if (!audioCtx) return;

    // Explosion sound (filtered noise)
    const bufferSize = audioCtx.sampleRate * 0.5; // 0.5 seconds
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    // Fill with noise and exponentially decay
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-6.0 * i / bufferSize);
    }

    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = buffer;

    // Filter to make it sound bassy/thuddy
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400; // Low frequency thud

    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 2.0; // Crank volume of explosion

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    noiseSource.start();
}

document.addEventListener('click', (e) => {
    // Start Web Audio API and BGM on first interaction
    initAudio();

    // If context was suspended by browser, resume it
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    // Play synthesized explosion
    playExplosion();

    // 💥 SCREEN SHAKE 💥 
    const appContainer = document.getElementById('app-container');
    const navBar = document.getElementById('main-nav');

    [appContainer, navBar].forEach(el => {
        if (el) {
            el.classList.remove('shake');
            void el.offsetWidth; // Trigger reflow to restart animation
            el.classList.add('shake');
        }
    });

    // 💥 EXPLOSIONS 💥
    createExplosion(e.clientX, e.clientY);
});

function createExplosion(x, y) {
    const colors = ['#10b981', '#3b82f6', '#0ea5e9', '#f43f5e', '#eab308'];
    const numParticles = 40; // MOAR PARTICLES

    for (let i = 0; i < numParticles; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        document.body.appendChild(particle);

        const size = Math.random() * 10 + 4;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        const color = colors[Math.floor(Math.random() * colors.length)];
        particle.style.background = color;
        particle.style.boxShadow = `0 0 ${size * 2}px ${color}`;

        // account for scroll
        particle.style.left = `${x}px`;
        particle.style.top = `${y + window.scrollY}px`;

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 200 + 50; // FAST!
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity + (Math.random() * 100); // add some gravity effect

        particle.animate([
            { transform: `translate(-50%, -50%) scale(1)`, opacity: 1 },
            { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`, opacity: 0 }
        ], {
            duration: Math.random() * 800 + 400,
            easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)',
            fill: 'forwards'
        });

        // Cleanup
        setTimeout(() => particle.remove(), 1500);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Scroll reveal logic
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(card);
    });

    const papers = document.querySelectorAll('.paper-item');
    papers.forEach((paper, index) => {
        paper.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(paper);
    });

    // Terminal Scramble Text Effect
    const subtitle = document.getElementById('scramble-text');
    if (subtitle) {
        // Wait briefly before starting the scramble
        setTimeout(() => {
            const originalText = subtitle.innerText;
            const chars = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&*<>{}[]~/=+';
            let iterations = 0;

            const scrambleInterval = setInterval(() => {
                subtitle.innerText = originalText.split('').map((char, index) => {
                    if (char === ' ' || char === '\n') return char;
                    if (index < iterations) {
                        return originalText[index];
                    }
                    return chars[Math.floor(Math.random() * chars.length)];
                }).join('');

                if (iterations >= originalText.length) {
                    clearInterval(scrambleInterval);
                    subtitle.innerText = originalText;
                }

                iterations += 0.8; // Speed of resolving
            }, 30);
        }, 100);
    }

    // Subtle parallax effect on background shapes
    const hero = document.querySelector('.hero');
    hero.addEventListener('mousemove', (e) => {
        const shapes = document.querySelectorAll('.shape');

        // Calculate mouse position relative to center
        const x = (e.clientX - window.innerWidth / 2) / 50;
        const y = (e.clientY - window.innerHeight / 2) / 50;

        shapes.forEach((shape, index) => {
            const factor = index === 0 ? 1 : -1.5;
            shape.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
        });
    });

    hero.addEventListener('mouseleave', () => {
        const shapes = document.querySelectorAll('.shape');
        shapes.forEach(shape => {
            shape.style.transform = 'translate(0, 0)';
            shape.style.transition = 'transform 0.5s ease-out';
        });
        setTimeout(() => {
            shapes.forEach(shape => shape.style.transition = '');
        }, 500);
    });
});
