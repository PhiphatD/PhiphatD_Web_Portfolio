// Portfolio JavaScript - Core Functionality

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initializeNavigation();
    initializeIntersectionObserver();
    initializeMobileMenu();
    initializeScrollEffects();
    initializeAnimations();
    initializeTypewriter();
    initializeAccessibility();
    initializeSkillsToggle();
    initializePerformanceMonitoring();
    initializeLazyLoading();
});

// Enhanced lazy loading
function initializeLazyLoading() {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });
        
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback for browsers without IntersectionObserver
        lazyImages.forEach(img => {
            img.classList.add('loaded');
        });
    }
}

// Scroll-based fallback for IntersectionObserver
function initializeScrollFallback() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    function updateActiveSection() {
        const scrollPos = window.scrollY + 100;
        
        sections.forEach((section, index) => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            
            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(link => link.classList.remove('active'));
                const correspondingLink = document.querySelector(`a[href="#${section.id}"]`);
                if (correspondingLink) {
                    correspondingLink.classList.add('active');
                }
            }
        });
    }
    
    window.addEventListener('scroll', throttle(updateActiveSection, 100));
}

// Navigation functionality
function initializeNavigation() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Smooth scroll for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Navbar background on scroll
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        
        scrollTimeout = setTimeout(() => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }, 10);
    });
}

// Intersection Observer for section visibility and active nav highlighting
function initializeIntersectionObserver() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Observer for section visibility (reveal animations)
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Animate child elements with delay
                const animatedElements = entry.target.querySelectorAll('.animate-on-scroll');
                animatedElements.forEach((el, index) => {
                    setTimeout(() => {
                        el.classList.add('visible');
                    }, index * 100);
                });
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '-50px 0px'
    });
    
    // Observer for active navigation highlighting
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.getAttribute('id');
                
                // Remove active class from all nav links
                navLinks.forEach(link => link.classList.remove('active'));
                
                // Add active class to current section's nav link
                const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }, {
        threshold: 0.5,
        rootMargin: '-100px 0px'
    });
    
    // Observe all sections
    sections.forEach(section => {
        revealObserver.observe(section);
        navObserver.observe(section);
    });
}

// Mobile menu functionality
function initializeMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });
        
        // Close mobile menu when clicking on nav links
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!mobileToggle.contains(e.target) && !navMenu.contains(e.target)) {
                mobileToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
}

// Scroll effects and parallax
function initializeScrollEffects() {
    const heroSection = document.querySelector('.hero-section');
    const scrollIndicator = document.querySelector('.hero-scroll-indicator');
    
    let ticking = false;
    
    function updateScrollEffects() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        // Parallax effect for hero section
        if (heroSection) {
            heroSection.style.transform = `translateY(${rate}px)`;
        }
        
        // Hide scroll indicator after scrolling
        if (scrollIndicator) {
            if (scrolled > 100) {
                scrollIndicator.style.opacity = '0';
            } else {
                scrollIndicator.style.opacity = '1';
            }
        }
        
        ticking = false;
    }
    
    function requestScrollUpdate() {
        if (!ticking) {
            requestAnimationFrame(updateScrollEffects);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestScrollUpdate);
    
    // Scroll indicator click handler
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', function() {
            const aboutSection = document.querySelector('#about');
            if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
}

// Enhanced animations and interactions
function initializeAnimations() {
    // Button hover effects
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.02)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Skill items hover effects
    const skillItems = document.querySelectorAll('.skill-item');
    skillItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) rotateY(5deg)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) rotateY(0deg)';
        });
    });
    
    // Project items hover effects
    const projectItems = document.querySelectorAll('.project-item');
    projectItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const image = this.querySelector('.project-image img');
            if (image) {
                image.style.transform = 'scale(1.1) rotate(2deg)';
            }
        });
        
        item.addEventListener('mouseleave', function() {
            const image = this.querySelector('.project-image img');
            if (image) {
                image.style.transform = 'scale(1) rotate(0deg)';
            }
        });
    });
    
    // Certificate items hover effects
    const certificateItems = document.querySelectorAll('.certificate-item');
    certificateItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const preview = this.querySelector('.certificate-preview');
            if (preview) {
                preview.style.transform = 'scale(1.05)';
            }
        });
        
        item.addEventListener('mouseleave', function() {
            const preview = this.querySelector('.certificate-preview');
            if (preview) {
                preview.style.transform = 'scale(1)';
            }
        });
    });
    
    // Social links hover effects
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.1) rotate(5deg)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1) rotate(0deg)';
        });
    });
    
    // Loading animations for content sections
    const contentSections = document.querySelectorAll('.skills-grid, .projects-grid, .certificate-grid');
    contentSections.forEach(section => {
        const items = section.children;
        Array.from(items).forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
            item.classList.add('animate-on-scroll');
        });
    });
}

// Accessibility enhancements
function initializeAccessibility() {
    // Keyboard navigation for interactive elements
    const interactiveElements = document.querySelectorAll('button, a, .skill-item, .project-item, .certificate-item');
    
    interactiveElements.forEach(element => {
        element.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    // Focus management for mobile menu
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                this.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.style.setProperty('--transition', 'none');
        
        // Disable parallax for users who prefer reduced motion
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            heroSection.style.transform = 'none';
        }
    }
    
    // High contrast mode detection
    if (window.matchMedia('(prefers-contrast: high)').matches) {
        document.body.classList.add('high-contrast');
    }
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Performance optimizations
function optimizePerformance() {
    // Lazy load images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
    
    // Preload critical resources
    const criticalLinks = document.querySelectorAll('a[href^="#"]');
    criticalLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            const targetId = this.getAttribute('href');
            if (targetId && targetId !== '#' && targetId.length > 1) {
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                // Preload section content if needed
                targetSection.style.willChange = 'transform';
                setTimeout(() => {
                    targetSection.style.willChange = 'auto';
                }, 1000);
                }
            }
        });
    });
}

// Initialize performance optimizations
document.addEventListener('DOMContentLoaded', optimizePerformance);

// Enhanced Error handling
window.addEventListener('error', function(e) {
    console.error('Portfolio script error:', e.error);
    // Graceful degradation - ensure basic functionality still works
    if (e.error && e.error.message && e.error.message.includes('IntersectionObserver')) {
        // Fallback for browsers without IntersectionObserver support
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            section.classList.add('visible');
        });
    }
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    e.preventDefault();
});

// Performance monitoring
function initializePerformanceMonitoring() {
    if ('performance' in window) {
        window.addEventListener('load', function() {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
                }
            }, 0);
        });
    }
}

// Typewriter effect for hero title
function initializeTypewriter() {
    const typewriterElement = document.querySelector('.gradient-text');
    if (!typewriterElement) return;
    
    const texts = ['AI & Data Science', 'Machine Learning', 'Data Analytics', 'AI & Data Science'];
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;
    
    function typeWriter() {
        const currentText = texts[textIndex];
        
        if (isDeleting) {
            typewriterElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 50;
        } else {
            typewriterElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 100;
        }
        
        if (!isDeleting && charIndex === currentText.length) {
            typeSpeed = 2000; // Pause at end
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            typeSpeed = 500; // Pause before typing next
        }
        
        setTimeout(typeWriter, typeSpeed);
    }
    
    // Start the typewriter effect after a short delay
    setTimeout(typeWriter, 1000);
}

// Skills Toggle functionality
function initializeSkillsToggle() {
    const skillsContent = document.querySelectorAll('.skills__content');
    
    skillsContent.forEach((content, index) => {
        const header = content.querySelector('.skills__header');
        const list = content.querySelector('.skills__list');
        const arrow = content.querySelector('.skills__arrow');
        
        // Set initial state - all categories closed
        content.classList.remove('skills__open');
        content.classList.add('skills__close');
        
        if (header) {
            header.addEventListener('click', () => {
                const isOpen = content.classList.contains('skills__open');
                
                // Toggle current category
                if (isOpen) {
                    content.classList.remove('skills__open');
                    header.setAttribute('aria-expanded', 'false');
                } else {
                    // Close all other categories first
                    skillsContent.forEach((cat, catIndex) => {
                        cat.classList.remove('skills__open');
                        const catHeader = cat.querySelector('.skills__header');
                        if (catHeader) {
                            catHeader.setAttribute('aria-expanded', 'false');
                        }
                    });
                    
                    // Open clicked category
                    content.classList.add('skills__open');
                    header.setAttribute('aria-expanded', 'true');
                    
                    // Animate skill items
                    const skillItems = list.querySelectorAll('.skills__data');
                    skillItems.forEach((item, i) => {
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0)';
                        }, i * 100);
                     });
                 }
             });
         }
         
         // Accessibility
         if (header) {
             header.setAttribute('aria-expanded', 'false');
             header.setAttribute('aria-controls', `skills-content-${index}`);
             header.setAttribute('role', 'button');
             header.setAttribute('tabindex', '0');
             
             // Keyboard support
             header.addEventListener('keydown', (e) => {
                 if (e.key === 'Enter' || e.key === ' ') {
                     e.preventDefault();
                     header.click();
                 }
             });
         }
         if (list) {
             list.setAttribute('id', `skills-content-${index}`);
         }
     });
     
     // No initial animation since all categories start closed
 }

// Export functions for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeNavigation,
        initializeIntersectionObserver,
        initializeMobileMenu,
        initializeScrollEffects,
        initializeAnimations,
        initializeTypewriter,
        initializeAccessibility,
        initializeSkillsToggle,
        debounce,
        throttle
    };
}

// Service Worker registration for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => {
      console.error('ServiceWorker registration failed:', err);
    });
  });
}