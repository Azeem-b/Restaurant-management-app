// Login page functionality
document.addEventListener('DOMContentLoaded', function() {
    const showRegister = document.getElementById('showRegister');
    const loginLink = document.getElementById('loginLink');
    const showForgotPassword = document.getElementById('showForgotPassword');
    const backToLogin = document.getElementById('backToLogin');
    const forgotPasswordForm = document.querySelector('.forgot-password-form');
    const loginForm = document.querySelector('.login-form');
    const registerForm = document.querySelector('.register-form');
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

    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    // Show success message
                    showMessage('Login successful! Redirecting...', 'success');
                    // Redirect to home page after a short delay
                    setTimeout(() => {
                        window.location.href = '/home';
                    }, 1500);
                } else {
                    // Show error message
                    showMessage(data.message || 'Login failed', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showMessage('An error occurred during login', 'error');
            }
        });
    }

    // Handle registration form submission
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                showMessage('Passwords do not match', 'error');
                return;
            }

            try {
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    // Show success message
                    showMessage('Registration successful! Please login.', 'success');
                    // Show login form after a short delay
                    setTimeout(() => {
                        document.querySelector('.register-container').classList.add('hidden');
                        document.querySelector('.login-container').classList.remove('hidden');
                    }, 1500);
                } else {
                    // Show error message
                    showMessage(data.message || 'Registration failed', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showMessage('An error occurred during registration', 'error');
            }
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

    // Function to show messages
    function showMessage(message, type) {
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;

        // Add message to the page
        document.body.appendChild(messageDiv);

        // Remove message after 3 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
});
