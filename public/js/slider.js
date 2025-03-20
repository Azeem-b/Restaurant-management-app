document.addEventListener('DOMContentLoaded', function() {
    // Banner slider initialization
    const swiper = new Swiper('.banner-slider', {
        slidesPerView: 1,
        spaceBetween: 0,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
        loop: true,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
            dynamicBullets: true
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        effect: 'fade',
        fadeEffect: {
            crossFade: true
        }
    });

    // Initialize card slider
    const cardSlider = new Swiper('.card-slider', {
        slidesPerView: 3,
        spaceBetween: 20,
        loop: true,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        breakpoints: {
            320: {
                slidesPerView: 1,
                spaceBetween: 10
            },
            768: {
                slidesPerView: 2,
                spaceBetween: 15
            },
            1024: {
                slidesPerView: 3,
                spaceBetween: 20
            }
        }
    });

    // Category selection handlers
    const categoryItems = document.querySelectorAll('.category-item');
    const cards = document.querySelectorAll('.card');
    
    categoryItems.forEach((item) => {
        item.addEventListener('click', () => {
            // Update active state
            categoryItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            // Get selected category
            const selectedCategory = item.querySelector('span').textContent.toLowerCase();
            
            // Show all slides first
            document.querySelectorAll('.swiper-slide').forEach(slide => {
                slide.style.display = 'block';
            });

            // Filter cards
            cards.forEach(card => {
                if (selectedCategory === 'all') {
                    card.style.display = 'block';
                } else {
                    const cardCategory = card.getAttribute('data-category');
                    card.style.display = cardCategory === selectedCategory ? 'block' : 'none';
                }
            });

            // Update slider
            cardSlider.update();
            cardSlider.slideTo(0);
        });
    });

    // Add click handlers for calendar icons
    const calendarIcons = document.querySelectorAll('.calendar-icon');
    calendarIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            window.location.href = '/reservation';
        });
    });
});
