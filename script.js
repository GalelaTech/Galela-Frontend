/* ==========================================
   1. NAVBAR — MOBILE MENU & SEARCH
========================================== */
(function () {
    'use strict';

    const toggle = document.querySelector('.nav-toggle');
    const menu   = document.querySelector('.nav-menu');
    if (!toggle || !menu) return;

    const searchWrap = document.querySelector('[data-search]');
    const searchBtn  = searchWrap ? searchWrap.querySelector('.nav-search-toggle') : null;
    const searchInput= searchWrap ? searchWrap.querySelector('input[type="search"]') : null;

    const MOBILE_BREAKPOINT = 900;
    const isMobile = () => window.innerWidth <= MOBILE_BREAKPOINT;

    /* --- MENU HELPERS --- */
    const closeMenu = () => {
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        document.querySelectorAll('.has-dropdown.open').forEach(li => {
            li.classList.remove('open');
            li.querySelector('.nav-link')?.setAttribute('aria-expanded', 'false');
        });
    };

    const openMenu = () => {
        // Close search if it's open
        if (searchWrap?.classList.contains('open')) closeSearch();
        
        menu.classList.add('open');
        toggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    };

    const toggleMenu = () => menu.classList.contains('open') ? closeMenu() : openMenu();

    /* --- SEARCH HELPERS --- */
    const closeSearch = () => {
        if (!searchWrap) return;
        searchWrap.classList.remove('open');
        searchBtn.setAttribute('aria-expanded', 'false');
        searchBtn.setAttribute('aria-label', 'Open search');
        searchInput?.blur();
    };

    const openSearch = () => {
        if (!searchWrap) return;
        // Close menu if it's open
        if (menu.classList.contains('open')) closeMenu();

        searchWrap.classList.add('open');
        searchBtn.setAttribute('aria-expanded', 'true');
        searchBtn.setAttribute('aria-label', 'Close search');
        setTimeout(() => searchInput?.focus(), 100);
    };

    const toggleSearch = () => searchWrap?.classList.contains('open') ? closeSearch() : openSearch();

    /* --- EVENT LISTENERS --- */
    toggle.addEventListener('click', toggleMenu);
    if (searchBtn) searchBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleSearch(); });

    // Mobile dropdowns
    document.querySelectorAll('.has-dropdown > .nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            if (!isMobile()) return;
            e.preventDefault();
            const parent = link.parentElement;
            const isOpen = parent.classList.toggle('open');
            link.setAttribute('aria-expanded', String(isOpen));
        });
    });

    // Close menu on link click
    document.querySelectorAll('.nav-menu a').forEach(a => {
        a.addEventListener('click', () => {
            if (!isMobile()) return;
            if (a.matches('.has-dropdown > .nav-link')) return;
            closeMenu();
        });
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (menu.classList.contains('open')) { closeMenu(); toggle.focus(); }
            if (searchWrap?.classList.contains('open')) closeSearch();
        }
    });

    // Click outside
    document.addEventListener('click', (e) => {
        if (!isMobile()) return;
        if (menu.classList.contains('open') && !menu.contains(e.target) && !toggle.contains(e.target)) closeMenu();
        if (searchWrap?.classList.contains('open') && !searchWrap.contains(e.target)) closeSearch();
    });

    // Reset on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (!isMobile()) {
                if (menu.classList.contains('open')) closeMenu();
                if (searchWrap?.classList.contains('open')) closeSearch();
            }
        }, 150);
    });
})();


/* ==========================================
   2. NAVBAR — SCROLL GLASS EFFECT
========================================== */
(function () {
    'use strict';
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    let ticking = false;
    const update = () => {
        navbar.classList.toggle('is-scrolled', window.scrollY > 24);
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(update);
            ticking = true;
        }
    }, { passive: true });

    update();
})();


/* ==========================================
   3. AUTO-HIGHLIGHT CURRENT PAGE LINK
========================================== */
(function () {
    'use strict';
    const path = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();

    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        const clean = href.split('#')[0].split('?')[0].toLowerCase();
        if (clean && clean === path) link.classList.add('active');
    });
})();


/* ==========================================
   4. SMOOTH SCROLL FOR IN-PAGE ANCHORS
========================================== */
(function () {
    'use strict';
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (!href || href === '#') return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
})();


/* ==========================================
   5. DYNAMIC COPYRIGHT YEAR
========================================== */
(function () {
    'use strict';
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
})();


/* ==========================================
   6. ICON FALLBACK & ANIMATIONS
========================================== */
(function () {
    'use strict';
    
    // Hide SVG if an image exists
    document.querySelectorAll('.feature-icon, .contact-option-icon, .radio-icon').forEach(wrap => {
        const img = wrap.querySelector('img[src]:not([src=""])');
        const svg = wrap.querySelector('svg');
        if (img && svg) svg.style.display = 'none';
    });

    // Enable stroke-draw animation for live SVGs
    const shapes = 'path, line, circle, rect, polyline';
    document
        .querySelectorAll('.service-icon svg, .feature-icon svg, .about-cred-icon svg, .group-icon svg')
        .forEach(svg => svg.querySelectorAll(shapes).forEach(el => el.setAttribute('pathLength', '1')));
})();


/* ==========================================
   7. NAV → FORM: pass service selection
========================================== */
(function () {
    'use strict';
    const serviceMap = {
        '#services-research':    'research',
        '#services-technology':  'technology',
        '#services-transport':   'transport',
        '#services-maintenance': 'maintenance'
    };

    document.querySelectorAll('.dropdown a[href^="#services-"]').forEach(link => {
        link.addEventListener('click', () => {
            const href = link.getAttribute('href');
            const service = serviceMap[href];
            if (!service) return;
            setTimeout(() => {
                const radio = document.querySelector(`input[name="service"][value="${service}"]`);
                if (radio) radio.checked = true;
            }, 400);
        });
    });
})();


/* ==========================================
   8. HERO VIDEO — respect reduced-motion
========================================== */
(function () {
    'use strict';
    const video = document.querySelector('video.hero-bg');
    if (!video) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        video.removeAttribute('autoplay');
        video.pause();
    }
})();


/* ==========================================
   9. SERVICE REQUEST FORM
========================================== */
(function () {
    'use strict';

    const form = document.getElementById('contactForm');
    if (!form) return;

    const submitBtn = form.querySelector('#submitBtn');
    const statusEl  = form.querySelector('.form-status');
    const fileInput = form.querySelector('#files');
    const fileDrop  = form.querySelector('#fileDrop');
    const fileList  = form.querySelector('#fileList');

    /* Configuration */
    const FORM_ENDPOINT = 'https://galela-solution-backend.onrender.com/api/requests/';             
    const REDIRECT_URL   = 'index.html';    
    const REDIRECT_DELAY = 10000;           // 10 seconds (aligned with modal)
    const MAX_FILES      = 5;
    const MAX_SIZE_MB    = 10;

    let attachments = [];

    /* Prevent past dates */
    const dateField = form.querySelector('#date');
    if (dateField) {
        dateField.min = new Date().toISOString().split('T')[0];
    }

    /* Pre-select service from URL: ?service=research */
    const urlParams = new URLSearchParams(window.location.search);
    const preselected = urlParams.get('service');
    if (preselected) {
        const radio = form.querySelector(`input[name="service"][value="${preselected}"]`);
        if (radio) radio.checked = true;
    }

    /* ---------- Helpers ---------- */
    const setStatus = (msg, type) => {
        statusEl.textContent = msg;
        statusEl.className = 'form-status is-visible is-' + type;
    };

    const clearStatus = () => {
        statusEl.textContent = '';
        statusEl.className = 'form-status';
    };

    const markError  = f => f && f.classList.add('is-invalid');
    const clearError = f => f && f.classList.remove('is-invalid');

    const scheduleRedirect = () => {
        setTimeout(() => {
            window.location.href = REDIRECT_URL;
        }, REDIRECT_DELAY);
    };

    form.querySelectorAll('input, textarea, select').forEach(el => {
        el.addEventListener('input',  () => clearError(el));
        el.addEventListener('change', () => clearError(el));
    });

    /* ---------- FILE UPLOAD ---------- */
    const formatSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1024 / 1024).toFixed(1) + ' MB';
    };

    const fileIconSVG = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
        </svg>
    `;

    const renderFiles = () => {
        if (!fileList) return;
        fileList.innerHTML = '';
        attachments.forEach((file, index) => {
            const li = document.createElement('li');
            li.className = 'file-item';

            const isImage = file.type.startsWith('image/');
            let iconHTML = fileIconSVG;
            if (isImage) {
                const url = URL.createObjectURL(file);
                iconHTML = `<img src="${url}" alt="">`;
            }

            li.innerHTML = `
                <span class="file-item-icon">${iconHTML}</span>
                <span class="file-item-info">
                    <span class="file-item-name">${file.name}</span>
                    <span class="file-item-size">${formatSize(file.size)}</span>
                </span>
                <button type="button" class="file-item-remove" aria-label="Remove ${file.name}">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                        <line x1="6" y1="6" x2="18" y2="18"/>
                        <line x1="18" y1="6" x2="6" y2="18"/>
                    </svg>
                </button>
            `;

            li.querySelector('.file-item-remove').addEventListener('click', () => {
                attachments.splice(index, 1);
                renderFiles();
            });

            fileList.appendChild(li);
        });
    };

    const addFiles = (newFiles) => {
        const incoming = Array.from(newFiles);
        for (const file of incoming) {
            if (attachments.length >= MAX_FILES) {
                setStatus(`You can attach up to ${MAX_FILES} files.`, 'error');
                break;
            }
            if (file.size > MAX_SIZE_MB * 1024 * 1024) {
                setStatus(`"${file.name}" is larger than ${MAX_SIZE_MB} MB.`, 'error');
                continue;
            }
            const duplicate = attachments.some(f => f.name === file.name && f.size === file.size);
            if (!duplicate) attachments.push(file);
        }
        renderFiles();
    };

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            addFiles(e.target.files);
            fileInput.value = '';
        });
    }

    if (fileDrop) {
        ['dragenter', 'dragover'].forEach(evt => {
            fileDrop.addEventListener(evt, (e) => {
                e.preventDefault(); e.stopPropagation();
                fileDrop.classList.add('is-dragover');
            });
        });
        ['dragleave', 'drop'].forEach(evt => {
            fileDrop.addEventListener(evt, (e) => {
                e.preventDefault(); e.stopPropagation();
                fileDrop.classList.remove('is-dragover');
            });
        });
        fileDrop.addEventListener('drop', (e) => {
            const dropped = e.dataTransfer?.files;
            if (dropped) addFiles(dropped);
        });
    }

    /* ---------- SUCCESS MODAL ---------- */
    const modal = document.getElementById('successModal');
    let lastFocused = null;

    const openModal = (refNumber) => {
        if (!modal) return;
        lastFocused = document.activeElement;

        const refEl = modal.querySelector('#modalRef');
        if (refEl && refNumber) refEl.textContent = refNumber;

        modal.hidden = false;
        void modal.offsetWidth;
        modal.classList.add('is-open');
        document.body.classList.add('modal-open');

        setTimeout(() => {
            modal.querySelector('[data-modal-close]')?.focus();
        }, 100);
    };

    const closeModal = () => {
        if (!modal) return;
        modal.classList.remove('is-open');
        document.body.classList.remove('modal-open');
        setTimeout(() => {
            modal.hidden = true;
            lastFocused?.focus?.();
        }, 250);
    };

    if (modal) {
        modal.querySelectorAll('[data-modal-close]').forEach(btn => {
            btn.addEventListener('click', closeModal);
        });
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
        });
    }

    /* ---------- REFERENCE NUMBER ---------- */
    const generateRef = () => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
        return `GS-${y}${m}${day}-${rand}`;
    };

    /* ---------- SUBMIT ---------- */
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        clearStatus();

        const honey = form.querySelector('input[name="website"]');
        if (honey && honey.value.trim() !== '') return;

        const nameEl    = form.querySelector('#name');
        const emailEl   = form.querySelector('#email');
        const phoneEl   = form.querySelector('#phone');
        const companyEl = form.querySelector('#company');
        const budgetEl  = form.querySelector('#budget');
        const dateEl    = form.querySelector('#date');
        const messageEl = form.querySelector('#message');
        const consentEl = form.querySelector('#consent');
        const serviceR  = form.querySelector('input[name="service"]:checked');

        let valid = true;

        if (!nameEl.value.trim()) { markError(nameEl); valid = false; }
        if (!emailEl.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
            markError(emailEl); valid = false;
        }
        if (!phoneEl.value.trim()) { markError(phoneEl); valid = false; }

        if (!serviceR) {
            form.querySelector('input[name="service"]')?.closest('.radio-card')?.classList.add('is-invalid');
            valid = false;
        } else {
            form.querySelectorAll('.radio-card').forEach(c => c.classList.remove('is-invalid'));
        }

        if (!messageEl.value.trim() || messageEl.value.trim().length < 10) {
            markError(messageEl); valid = false;
        }

        if (!consentEl.checked) {
            consentEl.closest('.check-line')?.classList.add('is-invalid');
            valid = false;
        } else {
            consentEl.closest('.check-line')?.classList.remove('is-invalid');
        }

        if (!valid) {
            setStatus('Please check the highlighted fields and try again.', 'error');
            form.querySelector('.is-invalid')?.focus();
            return;
        }

        const payload = {
            name:    nameEl.value.trim(),
            email:   emailEl.value.trim(),
            phone:   phoneEl.value.trim(),
            company: companyEl.value.trim(),
            service: serviceR.value,
            budget:  budgetEl.value,
            date:    dateEl.value,
            message: messageEl.value.trim(),
            consent: consentEl.checked ? 'true' : 'false',
        };

        submitBtn.disabled = true;
        submitBtn.classList.add('is-loading');

        const finishSuccess = (serverRef) => {
            form.reset();
            attachments = [];
            renderFiles();

            const displayRef = serverRef || generateRef();

            if (modal) {
                openModal(displayRef);
                setTimeout(() => {
                    window.location.href = REDIRECT_URL;
                }, REDIRECT_DELAY);
            } else {
                setStatus('Thank you — your request has been received. Redirecting you home…', 'success');
                scheduleRedirect();
            }

            submitBtn.disabled = false;
            submitBtn.classList.remove('is-loading');
        };

        const finishError = (msg) => {
            submitBtn.disabled = false;
            submitBtn.classList.remove('is-loading');
            setStatus(msg || 'Something went wrong. Please try again, or reach us on WhatsApp.', 'error');
        };

        if (!FORM_ENDPOINT) {
            const localRef = generateRef();
            const subject = encodeURIComponent(`Service Request ${localRef} — ${payload.name}`);

            const bodyLines = [
                `Reference: ${localRef}`,
                `Name:      ${payload.name}`,
                `Email:     ${payload.email}`,
                `Phone:     ${payload.phone}`,
                `Company:   ${payload.company || '—'}`,
                `Service:   ${payload.service}`,
                `Budget:    ${payload.budget || '—'}`,
                `Date:      ${payload.date || '—'}`,
            ];
            if (attachments.length) bodyLines.push(`Files:     ${attachments.map(f => f.name).join(', ')}`);
            bodyLines.push('', 'Message:', payload.message);

            const body = encodeURIComponent(bodyLines.join('\n'));
            window.location.href = `mailto:xolanegalela18@gmail.com?subject=${subject}&body=${body}`;
            setTimeout(() => finishSuccess(localRef), 800);
            return;
        }

        /* ---------- REAL SUBMIT ---------- */
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => formData.append(key, value));
        attachments.forEach(file => formData.append('files', file, file.name));

        fetch(FORM_ENDPOINT, {
            method: 'POST',
            headers: { 'Accept': 'application/json' },
            body: formData,
        })
        .then(async (res) => {
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                const msg = data.detail || (data.errors && Object.values(data.errors).flat().join(' ')) || 'Submission failed.';
                throw new Error(msg);
            }
            return data;
        })
        .then((data) => finishSuccess(data.reference))
        .catch((err) => finishError(err.message));
    });

})();