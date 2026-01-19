/**
 * Engeli Godø A - Main JavaScript
 * Snekker Eiksmarka/Bærum
 */

(function() {
    'use strict';

    // =========================================
    // DOM Elements
    // =========================================
    const header = document.querySelector('.header');
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const contactForm = document.getElementById('contact-form');
    const formSuccess = document.querySelector('.form-success');
    const navLinks = document.querySelectorAll('.nav__link, .mobile-nav__link');

    // =========================================
    // Header Scroll Effect
    // =========================================
    function handleScroll() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    // =========================================
    // Mobile Navigation Toggle
    // =========================================
    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', function() {
            menuToggle.classList.toggle('active');
            mobileNav.classList.toggle('active');
            document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
        });

        // Close mobile nav when clicking a link
        const mobileNavLinks = mobileNav.querySelectorAll('a');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', function() {
                menuToggle.classList.remove('active');
                mobileNav.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Close mobile nav on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
                menuToggle.classList.remove('active');
                mobileNav.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // =========================================
    // Active Navigation Link
    // =========================================
    function setActiveNavLink() {
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop() || 'index.html';

        navLinks.forEach(link => {
            const linkHref = link.getAttribute('href');
            if (linkHref === currentPage ||
                (currentPage === '' && linkHref === 'index.html') ||
                (currentPage === 'index.html' && linkHref === 'index.html')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    setActiveNavLink();

    // =========================================
    // Contact Form Handling
    // =========================================
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;

            // Disable button and show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <svg class="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
                </svg>
                Sender...
            `;

            // Collect form data
            const formData = {
                name: contactForm.querySelector('[name="name"]').value,
                email: contactForm.querySelector('[name="email"]').value,
                phone: contactForm.querySelector('[name="phone"]').value,
                address: contactForm.querySelector('[name="address"]')?.value || '',
                projectType: contactForm.querySelector('[name="projectType"]').value,
                description: contactForm.querySelector('[name="description"]').value,
                wantSiteVisit: contactForm.querySelector('[name="siteVisit"]')?.checked || false
            };

            try {
                // In production, this would send to Resend API
                // For now, simulate API call
                await simulateFormSubmission(formData);

                // Show success message
                contactForm.style.display = 'none';
                if (formSuccess) {
                    formSuccess.classList.add('active');
                }

                // Track conversion (if analytics is set up)
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_submission', {
                        'event_category': 'Contact',
                        'event_label': formData.projectType
                    });
                }

            } catch (error) {
                console.error('Form submission error:', error);
                alert('Beklager, noe gikk galt. Vennligst prøv igjen eller ring oss direkte.');
            } finally {
                // Reset button state
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });

        // Form validation on input
        const requiredFields = contactForm.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            field.addEventListener('blur', function() {
                validateField(field);
            });

            field.addEventListener('input', function() {
                if (field.classList.contains('invalid')) {
                    validateField(field);
                }
            });
        });
    }

    // =========================================
    // Form Validation Helper
    // =========================================
    function validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Check if required and empty
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'Dette feltet er påkrevd';
        }

        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Vennligst oppgi en gyldig e-postadresse';
            }
        }

        // Phone validation (Norwegian format)
        if (field.type === 'tel' && value) {
            const phoneRegex = /^(\+47)?[\s]?[2-9]\d{7}$/;
            const cleanedPhone = value.replace(/\s/g, '');
            if (!phoneRegex.test(cleanedPhone) && cleanedPhone.length < 8) {
                isValid = false;
                errorMessage = 'Vennligst oppgi et gyldig telefonnummer';
            }
        }

        // Update field state
        if (isValid) {
            field.classList.remove('invalid');
            removeErrorMessage(field);
        } else {
            field.classList.add('invalid');
            showErrorMessage(field, errorMessage);
        }

        return isValid;
    }

    function showErrorMessage(field, message) {
        removeErrorMessage(field);
        const error = document.createElement('span');
        error.className = 'form-error';
        error.textContent = message;
        error.style.cssText = 'color: var(--color-error); font-size: 0.875rem; margin-top: 0.25rem; display: block;';
        field.parentNode.appendChild(error);
    }

    function removeErrorMessage(field) {
        const existingError = field.parentNode.querySelector('.form-error');
        if (existingError) {
            existingError.remove();
        }
    }

    // =========================================
    // Simulate Form Submission
    // =========================================
    async function simulateFormSubmission(data) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // In production, you would send to Resend API:
        /*
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Failed to send message');
        }

        return response.json();
        */

        console.log('Form data submitted:', data);
        return { success: true };
    }

    // =========================================
    // Smooth Scroll for Anchor Links
    // =========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const headerHeight = header.offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // =========================================
    // Lazy Loading Images
    // =========================================
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    if (img.dataset.srcset) {
                        img.srcset = img.dataset.srcset;
                        img.removeAttribute('data-srcset');
                    }
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // =========================================
    // Animate on Scroll (Simple Implementation)
    // =========================================
    if ('IntersectionObserver' in window) {
        const animateObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        document.querySelectorAll('.service-card, .value-card, .why-us__item, .project-card').forEach(el => {
            el.classList.add('animate-ready');
            animateObserver.observe(el);
        });
    }

    // =========================================
    // Click to Call Tracking
    // =========================================
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        link.addEventListener('click', function() {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'click_to_call', {
                    'event_category': 'Contact',
                    'event_label': this.href
                });
            }
        });
    });

    // =========================================
    // Click to Email Tracking
    // =========================================
    document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
        link.addEventListener('click', function() {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'click_to_email', {
                    'event_category': 'Contact',
                    'event_label': this.href
                });
            }
        });
    });

    // =========================================
    // CSS Animation Classes
    // =========================================
    const style = document.createElement('style');
    style.textContent = `
        .animate-ready {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .animate-in {
            opacity: 1;
            transform: translateY(0);
        }

        .spinner {
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        .form-group input.invalid,
        .form-group select.invalid,
        .form-group textarea.invalid {
            border-color: var(--color-error);
        }
    `;
    document.head.appendChild(style);

    // =========================================
    // Preload Critical Images
    // =========================================
    function preloadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = src;
        });
    }

    // Preload hero image if exists
    const heroImg = document.querySelector('.hero__bg img');
    if (heroImg && heroImg.dataset.src) {
        preloadImage(heroImg.dataset.src).then(() => {
            heroImg.src = heroImg.dataset.src;
        });
    }

    // =========================================
    // Print Functionality
    // =========================================
    window.printPage = function() {
        window.print();
    };

    // =========================================
    // Console Welcome Message
    // =========================================
    console.log(
        '%c🔨 Engeli Godø A - Snekker Eiksmarka',
        'font-size: 16px; font-weight: bold; color: #2D5A3D;'
    );
    console.log(
        '%cKvalitetshåndverk i Bærum og Oslo Vest',
        'font-size: 12px; color: #5A5A5A;'
    );

})();
