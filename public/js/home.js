// Function to filter restaurant cards
function filterCards(category = 'all') {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        if (category === 'all' || card.dataset.category === category.toLowerCase()) {
            card.closest('.swiper-slide').style.display = '';
        } else {
            card.closest('.swiper-slide').style.display = 'none';
        }
    });

    // Update Swiper after filtering
    if (cardSlider) {
        cardSlider.update();
        cardSlider.slideTo(0);
    }
}

// Initialize Swipers
let cardSlider;
let bannerSlider;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Banner Slider
    bannerSlider = new Swiper('.banner-slider', {
        slidesPerView: 1,
        spaceBetween: 0,
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        }
    });

    // Add click handlers to category buttons
    const categoryButtons = document.querySelectorAll('.category-item');
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            // Get category from text content
            const category = button.querySelector('span').textContent.toLowerCase();
            // Filter cards
            filterCards(category);
        });
    });

    // Initialize Card Slider
    cardSlider = new Swiper('.card-slider', {
        slidesPerView: 3,
        spaceBetween: 30,
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
                spaceBetween: 20
            },
            768: {
                slidesPerView: 2,
                spaceBetween: 30
            },
            1024: {
                slidesPerView: 3,
                spaceBetween: 30
            }
        }
    });
});
