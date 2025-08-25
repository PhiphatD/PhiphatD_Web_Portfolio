// Certificate Data-Driven Renderer
// ตัวอย่างการใช้งาน JSON data เพื่อเรนเดอร์ certificates

class CertificateRenderer {
    constructor(containerId, dataUrl) {
        this.container = document.getElementById(containerId);
        this.dataUrl = dataUrl;
    }

    async loadData() {
        try {
            const response = await fetch(`${this.dataUrl}?v=${Date.now()}`);
            const data = await response.json();
            return data.certificates;
        } catch (error) {
            console.error('Error loading certificate data:', error);
            return null;
        }
    }

    renderFeaturedCertificate(cert) {
        return `
            <div class="certificate-featured">
                <a href="${cert.proof}" target="_blank" rel="noopener noreferrer" class="certificate-item certificate-item--featured" aria-label="${cert.title}">
                    <div class="certificate-preview">
                        <img src="${cert.proof}" alt="${cert.title}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                        <div class="certificate-fallback" style="display: none;">
                            <div class="pdf-icon">📄</div>
                            <span>View Certificate</span>
                        </div>
                    </div>
                    <div class="certificate-info">
                        <div class="certificate-tag">${cert.tags.join(', ')}</div>
                        <h3 class="certificate-title">${cert.title}</h3>
                        <p class="certificate-org">${cert.org}</p>
                        <p class="certificate-date">${cert.display_date}</p>
                        <p class="certificate-description">${cert.description}</p>
                    </div>
                </a>
            </div>
        `;
    }

    renderRegularCertificate(cert) {
        return `
            <a href="${cert.proof}" target="_blank" rel="noopener noreferrer" class="certificate-item" aria-label="${cert.title}">
                <div class="certificate-preview">
                    <img src="${cert.proof}" alt="${cert.title}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                    <div class="certificate-fallback" style="display: none;">
                        <div class="pdf-icon">📄</div>
                        <span>View Certificate</span>
                    </div>
                </div>
                <div class="certificate-info">
                    <h4 class="certificate-title">${cert.title}</h4>
                    <p class="certificate-org">${cert.org}</p>
                    <p class="certificate-date">${cert.display_date}</p>
                </div>
            </a>
        `;
    }

    async render() {
        const certificates = await this.loadData();
        if (!certificates) return;

        let html = `
            <h2 class="section__title">Certifications</h2>
            <span class="section__subtitle">AI-first, business-ready</span>
        `;

        // Render Core AI as a normal grid (works with mobile 2x2 CSS)
        if (certificates.ai_core && certificates.ai_core.length > 0) {
            html += `
                <div class="certificate-group">
                    <h3 class="certificate-group-title">Core AI / AI Foundations</h3>
                    <div class="certificate-grid certificate-grid--ai-4col">
                        ${certificates.ai_core.map(cert => this.renderRegularCertificate(cert)).join('')}
                    </div>
                </div>
            `;
        }

        // Render enterprise applications
        if (certificates.enterprise_apps && certificates.enterprise_apps.length > 0) {
            html += `
                <div class="certificate-group">
                    <h3 class="certificate-group-title">Enterprise Cloud Applications</h3>
                    <div class="certificate-grid">
                        ${certificates.enterprise_apps.map(cert => this.renderRegularCertificate(cert)).join('')}
                    </div>
                </div>
            `;
        }

        this.container.innerHTML = html;
    }
}

// ตัวอย่างการใช้งาน
// const renderer = new CertificateRenderer('certificate-container', 'certificates-data.json');
// renderer.render();

// หรือใช้แบบ functional approach
function renderCertificatesFromData(certificates) {
    const container = document.querySelector('.certificate-section .container');
    if (!container) return;

    // Core AI as normal grid
    const aiCoreItemsHtml = certificates.ai_core?.map(cert => `
        <a href="${cert.proof}" target="_blank" rel="noopener noreferrer" class="certificate-item" aria-label="${cert.title}">
            <div class="certificate-preview">
                <img src="${cert.proof}" alt="${cert.title}" loading="lazy">
                <div class="certificate-fallback">
                    <div class="pdf-icon">📄</div>
                    <span>View Certificate</span>
                </div>
            </div>
            <div class="certificate-info">
                <h4 class="certificate-title">${cert.title}</h4>
                <p class="certificate-org">${cert.org}</p>
                <p class="certificate-date">${cert.display_date}</p>
            </div>
        </a>
    `).join('') || '';

    const aiCoreGroupHtml = aiCoreItemsHtml ? `
        <div class="certificate-group">
            <h3 class="certificate-group-title">Core AI / AI Foundations</h3>
            <div class="certificate-grid certificate-grid--ai-4col">
                ${aiCoreItemsHtml}
            </div>
        </div>
    ` : '';

    // Regular certificates
    const regularHtml = certificates.enterprise_apps?.map(cert => `
        <a href="${cert.proof}" target="_blank" rel="noopener noreferrer" class="certificate-item" aria-label="${cert.title}">
            <div class="certificate-preview">
                <img src="${cert.proof}" alt="${cert.title}" loading="lazy">
                <div class="certificate-fallback">
                    <div class="pdf-icon">📄</div>
                    <span>View Certificate</span>
                </div>
            </div>
            <div class="certificate-info">
                <h4 class="certificate-title">${cert.title}</h4>
                <p class="certificate-org">${cert.org}</p>
                <p class="certificate-date">${cert.display_date}</p>
            </div>
        </a>
    `).join('') || '';

    const fullHtml = `
        <h2 class="section__title">Certifications</h2>
        <span class="section__subtitle">AI-first, business-ready</span>
        ${aiCoreGroupHtml}
        <div class="certificate-group">
            <h3 class="certificate-group-title">Enterprise Cloud Applications</h3>
            <div class="certificate-grid">
                ${regularHtml}
            </div>
        </div>
    `;

    container.innerHTML = fullHtml;
}

// Export สำหรับใช้ใน module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CertificateRenderer,
        renderCertificatesFromData
    };
}