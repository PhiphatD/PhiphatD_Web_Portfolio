// Certificate Data-Driven Renderer
// ตัวอย่างการใช้งาน JSON data เพื่อเรนเดอร์ certificates

// helper เลือก preview จาก proof อัตโนมัติ (รองรับฟิลด์ preview โดยตรง)
function getPreviewSrc(cert) {
  if (cert.preview) return cert.preview; // ใช้รูปที่กำหนดไว้
  const proof = cert.proof || "";
  // ชื่อไฟล์ในโฟลเดอร์ Pic/ และเป็น .pdf
  const isLocalPic = /^(\.\/)?Pic\//i.test(proof);
  if (isLocalPic && /\.pdf(\?.*)?$/i.test(proof)) {
    return proof.replace(/\.pdf(\?.*)?$/i, ".png");
  }
  // ถ้า proof เป็นรูปอยู่แล้ว ก็ใช้ได้เลย
  if (/\.(png|jpg|jpeg|webp)(\?.*)?$/i.test(proof)) return proof;
  // อย่างอื่น (ลิงก์ภายนอก) ไม่มี preview ภาพ
  return null;
}

function isGoogleBadge(cert) {
  const s = (cert.org || "") + " " + (cert.proof || "");
  return /google|skillsboost|googlecloud/i.test(s);
}

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
        const preview = getPreviewSrc(cert);
        const google  = isGoogleBadge(cert);
        const safe    = (u) => encodeURI(u || "");
        const commonInner = `
                    <div class="certificate-preview">
                        ${preview ? `<img src="${safe(preview)}" alt="${cert.title}" loading="lazy">`
                                  : `<div class="certificate-fallback"><div class="pdf-icon">📄</div></div>`}
                    </div>
                    <div class="certificate-info">
                        <div class="certificate-tag">${(cert.tags||[]).join(', ')}</div>
                        <h3 class="certificate-title">${cert.title}</h3>
                        <p class="certificate-org">${cert.org || ''}</p>
                        <p class="certificate-date">${cert.display_date || ''}</p>
                        ${cert.description ? `<p class=\"certificate-description\">${cert.description}</p>` : ''}
                    </div>`;
        return google
          ? `<a href="${safe(cert.proof)}" target="_blank" rel="noopener noreferrer" class="certificate-item certificate-item--featured" aria-label="${cert.title}">
                ${commonInner}
             </a>`
          : `<button type="button" class="certificate-item certificate-item--featured" aria-label="${cert.title}" data-img="${preview ? safe(preview) : ''}" data-proof="${safe(cert.proof)}" data-title="${cert.title}">
                ${commonInner}
             </button>`;
    }

    renderRegularCertificate(cert) {
        const preview = getPreviewSrc(cert);
        const google  = isGoogleBadge(cert);
        const safe    = (u) => encodeURI(u || "");
        const commonInner = `
                <div class="certificate-preview">
                    ${preview ? `<img src="${safe(preview)}" alt="${cert.title}" loading="lazy">`
                              : `<div class="certificate-fallback"><div class="pdf-icon">📄</div></div>`}
                </div>
                <div class="certificate-info">
                    <h4 class="certificate-title">${cert.title}</h4>
                    <p class="certificate-org">${cert.org || ''}</p>
                    <p class="certificate-date">${cert.display_date || ''}</p>
                </div>`;
        return google
          ? `<a href="${safe(cert.proof)}" target="_blank" rel="noopener noreferrer" class="certificate-item" aria-label="${cert.title}">${commonInner}</a>`
          : `<button type="button" class="certificate-item" aria-label="${cert.title}" data-img="${preview ? safe(preview) : ''}" data-proof="${safe(cert.proof)}" data-title="${cert.title}">${commonInner}</button>`;
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

    const aiCoreItemsHtml = certificates.ai_core?.map(cert => {
        const preview = getPreviewSrc(cert);
        const google  = isGoogleBadge(cert);
        const safe    = (u) => encodeURI(u || "");
        const commonInner = `
            <div class="certificate-preview">
                ${preview ? `<img src="${safe(preview)}" alt="${cert.title}" loading="lazy">`
                          : `<div class="certificate-fallback"><div class="pdf-icon">📄</div></div>`}
            </div>
            <div class="certificate-info">
                <h4 class="certificate-title">${cert.title}</h4>
                <p class="certificate-org">${cert.org || ''}</p>
                <p class="certificate-date">${cert.display_date || ''}</p>
            </div>`;
        return google
          ? `<a href="${safe(cert.proof)}" target="_blank" rel="noopener noreferrer" class="certificate-item" aria-label="${cert.title}">${commonInner}</a>`
          : `<button type="button" class="certificate-item" aria-label="${cert.title}" data-img="${preview ? safe(preview) : ''}" data-proof="${safe(cert.proof)}" data-title="${cert.title}">${commonInner}</button>`;
    }).join('') || '';

    const enterpriseItemsHtml = certificates.enterprise_apps?.map(cert => {
        const preview = getPreviewSrc(cert);
        const google  = isGoogleBadge(cert);
        const safe    = (u) => encodeURI(u || "");
        const commonInner = `
            <div class="certificate-preview">
                ${preview ? `<img src="${safe(preview)}" alt="${cert.title}" loading="lazy">`
                          : `<div class="certificate-fallback"><div class="pdf-icon">📄</div></div>`}
            </div>
            <div class="certificate-info">
                <h4 class="certificate-title">${cert.title}</h4>
                <p class="certificate-org">${cert.org || ''}</p>
                <p class="certificate-date">${cert.display_date || ''}</p>
            </div>`;
        return google
          ? `<a href="${safe(cert.proof)}" target="_blank" rel="noopener noreferrer" class="certificate-item" aria-label="${cert.title}">${commonInner}</a>`
          : `<button type="button" class="certificate-item" aria-label="${cert.title}" data-img="${preview ? safe(preview) : ''}" data-proof="${safe(cert.proof)}" data-title="${cert.title}">${commonInner}</button>`;
    }).join('') || '';

    container.innerHTML = `
        <h2 class="section__title">Certifications</h2>
        <span class="section__subtitle">AI-first, business-ready</span>
        <div class="certificate-group">
            <h3 class="certificate-group-title">Core AI / AI Foundations</h3>
            <div class="certificate-grid certificate-grid--ai-4col">${aiCoreItemsHtml}</div>
        </div>
        <div class="certificate-group">
            <h3 class="certificate-group-title">Enterprise Cloud Applications</h3>
            <div class="certificate-grid">${enterpriseItemsHtml}</div>
        </div>
    `;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CertificateRenderer,
        renderCertificatesFromData
    };
}