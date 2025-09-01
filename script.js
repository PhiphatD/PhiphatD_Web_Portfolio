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
    if (typeof initializeCertificateModal === 'function') {
        initializeCertificateModal();
    } else {
        try { initializeCertificateModal(); } catch (e) { /* no-op if not defined */ }
    }
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
            // Immediately update active state on click
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

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
        // Tune viewport band to reduce rapid toggling during fast scrolls
        rootMargin: '-30% 0px -60% 0px',
        threshold: 0
    });
    
    // Observe all sections
    sections.forEach(section => {
        revealObserver.observe(section);
        navObserver.observe(section);
    });

    // Debounced scroll fallback to force-sync active link after fast scrolling
    const syncNavActive = () => {
        const viewportH = window.innerHeight || document.documentElement.clientHeight;
        const checkY = viewportH * 0.35; // Align with rootMargin top band (~30%-40% area)

        // Near-bottom lock: if user is at the very end of the page, force highlight Contact
        if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 2)) {
            navLinks.forEach(link => link.classList.remove('active'));
            const contactLink = document.querySelector('.nav-link[href="#contact"]');
            if (contactLink) contactLink.classList.add('active');
            return;
        }

        let currentId = null;

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= checkY && rect.bottom >= checkY) {
                currentId = section.id;
            }
        });

        if (!currentId) {
            // Fallback to nearest section top to the check line
            let minDist = Infinity;
            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                const dist = Math.abs(rect.top - checkY);
                if (dist < minDist) {
                    minDist = dist;
                    currentId = section.id;
                }
            });
        }

        if (currentId) {
            navLinks.forEach(link => link.classList.remove('active'));
            const activeLink = document.querySelector(`.nav-link[href="#${currentId}"]`);
            if (activeLink) activeLink.classList.add('active');
        }
    };

    window.addEventListener('scroll', debounce(syncNavActive, 100));
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
        
        // Parallax effect for hero section: run only if hero is full-height
        if (heroSection) {
            const styles = window.getComputedStyle(heroSection);
            const minH = styles.getPropertyValue('min-height');
            // ensure overflow hidden to prevent layout shift
            heroSection.style.overflow = 'hidden';
            if (minH.includes('100vh') || minH.includes('100dvh')) {
                heroSection.style.transform = `translateY(${rate}px)`;
            } else {
                heroSection.style.transform = 'translateY(0)';
            }
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
    
    window.addEventListener('scroll', requestScrollUpdate, { passive: true });
    
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
        
        // Set initial state - AI & Data Science open, others closed
        if (index === 0) {
            // First category (AI & Data Science) - open by default
            content.classList.add('skills__open');
            content.classList.remove('skills__close');
        } else {
            // Other categories - closed by default
            content.classList.remove('skills__open');
            content.classList.add('skills__close');
        }
        
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
             // Set aria-expanded based on initial state
             header.setAttribute('aria-expanded', index === 0 ? 'true' : 'false');
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
     
     // Initial animation for AI & Data Science section (first category)
     const firstCategory = skillsContent[0];
     if (firstCategory && firstCategory.classList.contains('skills__open')) {
         const firstList = firstCategory.querySelector('.skills__list');
         if (firstList) {
             const skillItems = firstList.querySelectorAll('.skills__data');
             skillItems.forEach((item, i) => {
                 setTimeout(() => {
                     item.style.opacity = '1';
                     item.style.transform = 'translateY(0)';
                 }, i * 100);
             });
         }
     }
 }

/*==================== SLIDESHOW FUNCTIONALITY ====================*/
function changeSlide(button, direction) {
    // Resolve slideshow container robustly across structures
    const directContainer = button.closest('.slideshow-container');
    const withinActivityImage = button.closest('.activity-image');
    const container = directContainer || (withinActivityImage ? withinActivityImage.querySelector('.slideshow-container') : null);
    if (!container) {
        console.error('Slideshow container not found');
        return;
    }

    // Resolve activity wrapper if present (may be same element in some structures)
    const activityImage = container.closest('.activity-image') || withinActivityImage || null;

    const slides = container.querySelectorAll('.slide');
    // Dots may live inside the container or as a sibling under .activity-image
    const dotsContainer = (container.querySelector('.slide-dots')) || (activityImage ? activityImage.querySelector('.slide-dots') : null);
    const dots = dotsContainer ? dotsContainer.querySelectorAll('.dot') : [];
    let currentIndex = 0;

    // Check if slides exist
    if (!slides || slides.length === 0) {
        console.error('No slides found in slideshow container');
        return;
    }

    // Find current active slide
    slides.forEach((slide, index) => {
        if (slide.classList.contains('active')) {
            currentIndex = index;
        }
    });

    // Calculate new index
    let newIndex = currentIndex + direction;
    if (newIndex >= slides.length) newIndex = 0;
    if (newIndex < 0) newIndex = slides.length - 1;

    // Update slides
    if (slides[currentIndex]) slides[currentIndex].classList.remove('active');
    if (slides[newIndex]) slides[newIndex].classList.add('active');

    // Update dots (only if they exist)
    if (dots && dots.length > 0) {
        if (dots[currentIndex]) dots[currentIndex].classList.remove('active');
        if (dots[newIndex]) dots[newIndex].classList.add('active');
    }
}

function currentSlide(dot, slideNumber) {
    // Resolve container: dots may be inside or sibling to container
    const dotsContainerFromDot = dot.closest('.slide-dots');
    const containerFromDot = dot.closest('.slideshow-container');
    const activityFromDot = dot.closest('.activity-image');
    const container = containerFromDot || (activityFromDot ? activityFromDot.querySelector('.slideshow-container') : null);
    if (!container) {
        console.error('Slideshow container not found');
        return;
    }

    const activityImage = container.closest('.activity-image') || activityFromDot || null;

    const slides = container.querySelectorAll('.slide');
    const dotsContainer = dotsContainerFromDot || container.querySelector('.slide-dots') || (activityImage ? activityImage.querySelector('.slide-dots') : null);
    const dots = dotsContainer ? dotsContainer.querySelectorAll('.dot') : [];

    // Check if slides exist
    if (!slides || slides.length === 0) {
        console.error('No slides found in slideshow container');
        return;
    }

    // Validate slide number
    if (slideNumber < 1 || slideNumber > slides.length) {
        console.error('Invalid slide number:', slideNumber);
        return;
    }

    // Remove active class from all slides and dots
    slides.forEach(slide => slide.classList.remove('active'));
    if (dots && dots.length > 0) {
        dots.forEach(d => d.classList.remove('active'));
    }

    // Add active class to selected slide and dot
    if (slides[slideNumber - 1]) {
        slides[slideNumber - 1].classList.add('active');
    }
    if (dots && dots[slideNumber - 1]) {
        dots[slideNumber - 1].classList.add('active');
    }
}

// Auto-play slideshow (optional)
function autoSlideshow() {
    const containers = document.querySelectorAll('.slideshow-container');
    containers.forEach(container => {
        const nextBtn = container.querySelector('.next-btn');
        if (nextBtn) {
            changeSlide(nextBtn, 1);
        }
    });
}

// Uncomment the line below to enable auto-play every 5 seconds
// setInterval(autoSlideshow, 5000);

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
        changeSlide,
        currentSlide,
        autoSlideshow,
        debounce,
        throttle
    };
}

// Service Worker registration for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(err => {
      console.error('ServiceWorker registration failed:', err);
    });
  });
}

function initializeCertificateModal(){
  const modal   = document.getElementById('cert-modal');
  const content = modal?.querySelector('.cert-modal__content');
  const closes  = modal?.querySelectorAll('[data-close]');
  if (!modal || !content) return;

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.certificate-item[type="button"]');
    if (!btn) return;

    const imgSrc = btn.getAttribute('data-img');
    const proof  = btn.getAttribute('data-proof');
    const title  = btn.getAttribute('data-title') || 'Certificate';

    content.innerHTML = imgSrc
      ? `<img src="${imgSrc}" alt="${title}">`
      : `<div style="padding:20px;color:#ddd;text-align:center">No preview image</div>`;

    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  });

  const close = () => { modal.classList.remove('is-open'); document.body.style.overflow = ''; content.innerHTML = ''; };
  closes?.forEach(el => el.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}