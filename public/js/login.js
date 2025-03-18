// Login page functionality
document.addEventListener('DOMContentLoaded', function() {
    const showRegister = document.getElementById('showRegister');
    const loginLink = document.getElementById('loginLink');
    const showForgotPassword = document.getElementById('showForgotPassword');
    const backToLogin = document.getElementById('backToLogin');
    const forgotPasswordForm = document.querySelector('.forgot-password-form');
    const popup = document.getElementById('resetPopup');
    const closePopup = document.getElementById('closePopup');

    // Show registration form
    if (showRegister) {
        showRegister.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector('.login-container').classList.add('hidden');
            document.querySelector('.register-container').classList.remove('hidden');
            document.querySelector('.forgot-password-container').classList.add('hidden');
        });
    }

    // Show login form from registration
    if (loginLink) {
        loginLink.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector('.register-container').classList.add('hidden');
            document.querySelector('.forgot-password-container').classList.add('hidden');
            document.querySelector('.login-container').classList.remove('hidden');
        });
    }

    // Show forgot password form
    if (showForgotPassword) {
        showForgotPassword.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector('.login-container').classList.add('hidden');
            document.querySelector('.register-container').classList.add('hidden');
            document.querySelector('.forgot-password-container').classList.remove('hidden');
        });
    }

    // Back to login from forgot password
    if (backToLogin) {
        backToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector('.forgot-password-container').classList.add('hidden');
            document.querySelector('.register-container').classList.add('hidden');
            document.querySelector('.login-container').classList.remove('hidden');
        });
    }

    // Handle forgot password form submission
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('forgotEmail').value;
            
            // Show popup when reset password button is clicked
            if (email) {
                popup.classList.add('show');
            }
        });
    }

    // Close popup when OK button is clicked
    if (closePopup) {
        closePopup.addEventListener('click', function() {
            popup.classList.remove('show');
        });
    }

    // Close popup when clicking outside
    if (popup) {
        popup.addEventListener('click', function(e) {
            if (e.target === popup) {
                popup.classList.remove('show');
            }
        });
    }
});
