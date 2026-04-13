document.addEventListener('DOMContentLoaded', () => {
    console.log("Main JS Loaded");

    // --- Logos Swiper Initialization ---
    try {
        const logosSwiper = new Swiper('.logos-swiper', {
            slidesPerView: 2,
            spaceBetween: 20,
            loop: true,
            speed: 800,
            autoplay: {
                delay: 2000,
                disableOnInteraction: false,
            },
            breakpoints: {
                480: {
                    slidesPerView: 3,
                },
                768: {
                    slidesPerView: 4,
                },
                1024: {
                    slidesPerView: 5,
                },
            },
        });
        console.log("Swiper initialized", logosSwiper);
    } catch (e) {
        console.error("Swiper init error:", e);
    }

    // --- Counter-Up Logic (Smoother and Slower) ---
    const counters = document.querySelectorAll('.counter-value');
    const duration = 2500; // Animation duration in milliseconds

    const animateCounter = (counter) => {
        const target = +counter.getAttribute('data-count');
        let startTime = null;

        const updateCount = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);
            
            // Ease out cubic function for smoother finish
            const easeOutCubic = 1 - Math.pow(1 - percentage, 3);
            const currentCount = Math.floor(easeOutCubic * target);
            
            counter.innerText = '+' + currentCount;

            if (percentage < 1) {
                requestAnimationFrame(updateCount);
            } else {
                counter.innerText = '+' + target;
            }
        };

        requestAnimationFrame(updateCount);
    };

    // Intersection Observer to trigger animation when visible
    const observerOptions = {
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    animateCounter(entry.target);
                }, 200); // Slight delay for better visual effect
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    counters.forEach(counter => {
        observer.observe(counter);
    });
});
