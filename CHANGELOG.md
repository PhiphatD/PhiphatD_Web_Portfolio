# Portfolio Refactoring Changelog

## [1.0.0] - 2023-07-25

### HTML Changes
- Removed duplicate `<body>` tag
- Added new `<section id="certificate">` to match the navigation link
- Replaced placeholder project links with sensible URLs
- Added `target="_blank"` and `rel="noopener"` to external links
- Added `aria-label` attributes for improved accessibility
- Improved semantic HTML5 structure

### CSS Changes
- Removed duplicate `.blog-card` styles and other repeated blocks
- Implemented mobile-first grid layouts for projects, about, and certificates sections
- Improved contrast for dark mode
- Maintained primary color `#7f5af0` and accent color `#58a6ff`
- Added unified card styling system with CSS variables
- Created consistent styling for certificate and blog sections

### JavaScript Changes
- Merged overlapping scroll/slider logic into one requestAnimationFrame-based scroll handler
- Created a single initializer for `.timeline-image-slider`
- Removed duplicated DOMContentLoaded listeners
- Implemented debouncing for scroll events
- Set default theme to follow `prefers-color-scheme` while maintaining the animated toggle icon
- Consolidated slideshow functionality

### Accessibility Improvements
- Added semantic HTML5 elements
- Improved alt text and aria-labels
- Ensured proper heading order
- Enhanced keyboard navigation
- Improved color contrast for better readability

### Performance Enhancements
- Reduced repaints and reflows by using requestAnimationFrame
- Optimized event listeners
- Improved CSS specificity
- Reduced duplicate code
- Modularized JavaScript functions