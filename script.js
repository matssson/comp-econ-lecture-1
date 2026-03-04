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
