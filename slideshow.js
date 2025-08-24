// Portfolio Slideshow - Advanced Carousel and Gallery Component

class PortfolioSlideshow {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        if (!this.container) {
            console.error('Slideshow container not found');
            return;
        }
        
        // Default options
        this.options = {
            autoPlay: true,
            autoPlayInterval: 4000,
            showArrows: true,
            showDots: true,
            infinite: true,
            transition: 'slide', // 'slide' or 'fade'
            transitionDuration: 500,
            pauseOnHover: true,
            swipeEnabled: true,
            keyboardEnabled: true,
            lazyLoad: true,
            ...options
        };
        
        this.currentSlide = 0;
        this.slides = [];
        this.isTransitioning = false;
        this.autoPlayTimer = null;
        this.touchStartX = 0;
        this.touchEndX = 0;
        
        this.init();
    }
    
    init() {
        this.createStructure();
        this.setupSlides();
        this.createControls();
        this.bindEvents();
        this.injectStyles();
        
        if (this.options.autoPlay) {
            this.startAutoPlay();
        }
        
        // Show first slide
        this.goToSlide(0, false);
    }
    
    createStructure() {
        this.container.classList.add('portfolio-slideshow');
        
        // Create wrapper for slides
        this.slidesWrapper = document.createElement('div');
        this.slidesWrapper.className = 'slideshow-wrapper';
        
        // Move existing content to wrapper
        while (this.container.firstChild) {
            this.slidesWrapper.appendChild(this.container.firstChild);
        }
        
        this.container.appendChild(this.slidesWrapper);
    }
    
    setupSlides() {
        const slideElements = this.slidesWrapper.children;
        this.slides = Array.from(slideElements).map((slide, index) => {
            slide.classList.add('slideshow-slide');
            slide.setAttribute('data-slide-index', index);
            
            // Setup lazy loading
            if (this.options.lazyLoad) {
                const images = slide.querySelectorAll('img[data-src]');
                images.forEach(img => {
                    img.classList.add('lazy-load');
                });
            }
            
            return {
                element: slide,
                index: index,
                loaded: index === 0 // First slide is loaded by default
            };
        });
        
        this.totalSlides = this.slides.length;
        
        if (this.totalSlides === 0) {
            console.warn('No slides found in slideshow');
            return;
        }
    }
    
    createControls() {
        // Create navigation arrows
        if (this.options.showArrows && this.totalSlides > 1) {
            this.createArrows();
        }
        
        // Create dot indicators
        if (this.options.showDots && this.totalSlides > 1) {
            this.createDots();
        }
    }
    
    createArrows() {
        this.prevArrow = document.createElement('button');
        this.prevArrow.className = 'slideshow-arrow slideshow-prev';
        this.prevArrow.innerHTML = `
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
        `;
        this.prevArrow.setAttribute('aria-label', 'Previous slide');
        
        this.nextArrow = document.createElement('button');
        this.nextArrow.className = 'slideshow-arrow slideshow-next';
        this.nextArrow.innerHTML = `
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
        `;
        this.nextArrow.setAttribute('aria-label', 'Next slide');
        
        this.container.appendChild(this.prevArrow);
        this.container.appendChild(this.nextArrow);
    }
    
    createDots() {
        this.dotsContainer = document.createElement('div');
        this.dotsContainer.className = 'slideshow-dots';
        
        this.dots = [];
        for (let i = 0; i < this.totalSlides; i++) {
            const dot = document.createElement('button');
            dot.className = 'slideshow-dot';
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            dot.setAttribute('data-slide', i);
            
            this.dots.push(dot);
            this.dotsContainer.appendChild(dot);
        }
        
        this.container.appendChild(this.dotsContainer);
    }
    
    bindEvents() {
        // Arrow navigation
        if (this.prevArrow && this.nextArrow) {
            this.prevArrow.addEventListener('click', () => this.prevSlide());
            this.nextArrow.addEventListener('click', () => this.nextSlide());
        }
        
        // Dot navigation
        if (this.dotsContainer) {
            this.dotsContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('slideshow-dot')) {
                    const slideIndex = parseInt(e.target.getAttribute('data-slide'));
                    this.goToSlide(slideIndex);
                }
            });
        }
        
        // Pause on hover
        if (this.options.pauseOnHover) {
            this.container.addEventListener('mouseenter', () => this.pauseAutoPlay());
            this.container.addEventListener('mouseleave', () => this.resumeAutoPlay());
        }
        
        // Touch/swipe support
        if (this.options.swipeEnabled) {
            this.bindTouchEvents();
        }
        
        // Keyboard navigation
        if (this.options.keyboardEnabled) {
            this.bindKeyboardEvents();
        }
        
        // Visibility change handling
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAutoPlay();
            } else if (this.options.autoPlay) {
                this.resumeAutoPlay();
            }
        });
    }
    
    bindTouchEvents() {
        this.container.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
        }, { passive: true });
        
        this.container.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].clientX;
            this.handleSwipe();
        }, { passive: true });
    }
    
    bindKeyboardEvents() {
        this.container.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.prevSlide();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextSlide();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToSlide(0);
                    break;
                case 'End':
                    e.preventDefault();
                    this.goToSlide(this.totalSlides - 1);
                    break;
            }
        });
        
        // Make container focusable
        this.container.setAttribute('tabindex', '0');
    }
    
    handleSwipe() {
        const swipeThreshold = 50;
        const swipeDistance = this.touchStartX - this.touchEndX;
        
        if (Math.abs(swipeDistance) > swipeThreshold) {
            if (swipeDistance > 0) {
                this.nextSlide();
            } else {
                this.prevSlide();
            }
        }
    }
    
    prevSlide() {
        if (this.isTransitioning) return;
        
        let prevIndex = this.currentSlide - 1;
        if (prevIndex < 0) {
            prevIndex = this.options.infinite ? this.totalSlides - 1 : 0;
        }
        
        if (prevIndex !== this.currentSlide) {
            this.goToSlide(prevIndex);
        }
    }
    
    nextSlide() {
        if (this.isTransitioning) return;
        
        let nextIndex = this.currentSlide + 1;
        if (nextIndex >= this.totalSlides) {
            nextIndex = this.options.infinite ? 0 : this.totalSlides - 1;
        }
        
        if (nextIndex !== this.currentSlide) {
            this.goToSlide(nextIndex);
        }
    }
    
    goToSlide(index, animate = true) {
        if (index < 0 || index >= this.totalSlides || index === this.currentSlide) {
            return;
        }
        
        if (animate && this.isTransitioning) return;
        
        const previousSlide = this.currentSlide;
        this.currentSlide = index;
        
        if (animate) {
            this.isTransitioning = true;
        }
        
        // Load slide content if lazy loading is enabled
        if (this.options.lazyLoad && !this.slides[index].loaded) {
            this.loadSlide(index);
        }
        
        // Update slide visibility
        this.updateSlideVisibility(previousSlide, index, animate);
        
        // Update controls
        this.updateControls();
        
        // Restart autoplay
        if (this.options.autoPlay) {
            this.restartAutoPlay();
        }
        
        // Dispatch custom event
        this.dispatchEvent('slideChange', {
            currentSlide: index,
            previousSlide: previousSlide,
            totalSlides: this.totalSlides
        });
        
        if (animate) {
            setTimeout(() => {
                this.isTransitioning = false;
            }, this.options.transitionDuration);
        }
    }
    
    updateSlideVisibility(previousIndex, currentIndex, animate) {
        const previousSlide = this.slides[previousIndex];
        const currentSlide = this.slides[currentIndex];
        
        if (this.options.transition === 'fade') {
            // Fade transition
            this.slides.forEach((slide, index) => {
                slide.element.classList.remove('active', 'prev', 'next');
                if (index === currentIndex) {
                    slide.element.classList.add('active');
                }
            });
        } else {
            // Slide transition
            this.slides.forEach((slide, index) => {
                slide.element.classList.remove('active', 'prev', 'next');
                
                if (index === currentIndex) {
                    slide.element.classList.add('active');
                } else if (index === previousIndex) {
                    slide.element.classList.add(currentIndex > previousIndex ? 'prev' : 'next');
                } else if (index === currentIndex - 1 || (currentIndex === 0 && index === this.totalSlides - 1)) {
                    slide.element.classList.add('prev');
                } else if (index === currentIndex + 1 || (currentIndex === this.totalSlides - 1 && index === 0)) {
                    slide.element.classList.add('next');
                }
            });
        }
    }
    
    updateControls() {
        // Update dots
        if (this.dots) {
            this.dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === this.currentSlide);
            });
        }
        
        // Update arrows for non-infinite slideshows
        if (!this.options.infinite && this.prevArrow && this.nextArrow) {
            this.prevArrow.disabled = this.currentSlide === 0;
            this.nextArrow.disabled = this.currentSlide === this.totalSlides - 1;
        }
    }
    
    loadSlide(index) {
        const slide = this.slides[index];
        if (slide.loaded) return;
        
        const images = slide.element.querySelectorAll('img[data-src]');
        images.forEach(img => {
            img.src = img.getAttribute('data-src');
            img.removeAttribute('data-src');
            img.classList.remove('lazy-load');
        });
        
        slide.loaded = true;
    }
    
    startAutoPlay() {
        if (!this.options.autoPlay || this.totalSlides <= 1) return;
        
        this.autoPlayTimer = setInterval(() => {
            this.nextSlide();
        }, this.options.autoPlayInterval);
    }
    
    pauseAutoPlay() {
        if (this.autoPlayTimer) {
            clearInterval(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }
    }
    
    resumeAutoPlay() {
        if (this.options.autoPlay && !this.autoPlayTimer) {
            this.startAutoPlay();
        }
    }
    
    restartAutoPlay() {
        this.pauseAutoPlay();
        this.startAutoPlay();
    }
    
    dispatchEvent(eventName, detail) {
        const event = new CustomEvent(`slideshow:${eventName}`, {
            detail: detail,
            bubbles: true
        });
        this.container.dispatchEvent(event);
    }
    
    // Public API methods
    destroy() {
        this.pauseAutoPlay();
        
        // Remove event listeners
        if (this.prevArrow) this.prevArrow.remove();
        if (this.nextArrow) this.nextArrow.remove();
        if (this.dotsContainer) this.dotsContainer.remove();
        
        // Reset container
        this.container.classList.remove('portfolio-slideshow');
        this.container.removeAttribute('tabindex');
        
        // Move slides back to container
        while (this.slidesWrapper.firstChild) {
            this.container.appendChild(this.slidesWrapper.firstChild);
        }
        this.slidesWrapper.remove();
        
        this.dispatchEvent('destroyed');
    }
    
    getCurrentSlide() {
        return this.currentSlide;
    }
    
    getTotalSlides() {
        return this.totalSlides;
    }
    
    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
        
        if (newOptions.autoPlay !== undefined) {
            if (newOptions.autoPlay) {
                this.startAutoPlay();
            } else {
                this.pauseAutoPlay();
            }
        }
    }
    
    injectStyles() {
        if (document.getElementById('portfolio-slideshow-styles')) return;
        
        const styles = `
            .portfolio-slideshow {
                position: relative;
                overflow: hidden;
                border-radius: 12px;
                background: var(--bg-secondary, #1a1a1a);
            }
            
            .slideshow-wrapper {
                position: relative;
                width: 100%;
                height: 100%;
            }
            
            .slideshow-slide {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                opacity: 0;
                transform: translateX(100%);
                transition: all ${this.options.transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1);
                z-index: 1;
            }
            
            .slideshow-slide.active {
                opacity: 1;
                transform: translateX(0);
                z-index: 2;
            }
            
            .slideshow-slide.prev {
                transform: translateX(-100%);
            }
            
            .slideshow-slide.next {
                transform: translateX(100%);
            }
            
            .portfolio-slideshow[data-transition="fade"] .slideshow-slide {
                transform: none;
            }
            
            .portfolio-slideshow[data-transition="fade"] .slideshow-slide.active {
                transform: none;
            }
            
            .slideshow-arrow {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                background: rgba(0, 0, 0, 0.7);
                border: none;
                color: white;
                width: 48px;
                height: 48px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;
                z-index: 10;
                backdrop-filter: blur(10px);
            }
            
            .slideshow-arrow:hover {
                background: rgba(0, 0, 0, 0.9);
                transform: translateY(-50%) scale(1.1);
            }
            
            .slideshow-arrow:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .slideshow-prev {
                left: 16px;
            }
            
            .slideshow-next {
                right: 16px;
            }
            
            .slideshow-dots {
                position: absolute;
                bottom: 16px;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                gap: 8px;
                z-index: 10;
            }
            
            .slideshow-dot {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                border: 2px solid rgba(255, 255, 255, 0.5);
                background: transparent;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .slideshow-dot.active {
                background: white;
                border-color: white;
            }
            
            .slideshow-dot:hover {
                border-color: rgba(255, 255, 255, 0.8);
                transform: scale(1.2);
            }
            
            .slideshow-slide img.lazy-load {
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .slideshow-slide img {
                opacity: 1;
            }
            
            @media (max-width: 768px) {
                .slideshow-arrow {
                    width: 40px;
                    height: 40px;
                }
                
                .slideshow-prev {
                    left: 8px;
                }
                
                .slideshow-next {
                    right: 8px;
                }
                
                .slideshow-dots {
                    bottom: 8px;
                }
                
                .slideshow-dot {
                    width: 10px;
                    height: 10px;
                }
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.id = 'portfolio-slideshow-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
        
        // Set transition type on container
        this.container.setAttribute('data-transition', this.options.transition);
    }
}

// Auto-initialize slideshows with data attributes
document.addEventListener('DOMContentLoaded', function() {
    const slideshows = document.querySelectorAll('[data-slideshow]');
    
    slideshows.forEach(container => {
        const options = {};
        
        // Parse data attributes
        if (container.dataset.autoplay !== undefined) {
            options.autoPlay = container.dataset.autoplay !== 'false';
        }
        if (container.dataset.interval) {
            options.autoPlayInterval = parseInt(container.dataset.interval);
        }
        if (container.dataset.transition) {
            options.transition = container.dataset.transition;
        }
        if (container.dataset.arrows !== undefined) {
            options.showArrows = container.dataset.arrows !== 'false';
        }
        if (container.dataset.dots !== undefined) {
            options.showDots = container.dataset.dots !== 'false';
        }
        if (container.dataset.infinite !== undefined) {
            options.infinite = container.dataset.infinite !== 'false';
        }
        
        new PortfolioSlideshow(container, options);
    });
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PortfolioSlideshow;
}

// Global export
if (typeof window !== 'undefined') {
    window.PortfolioSlideshow = PortfolioSlideshow;
}