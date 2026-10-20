/* ──────────────────────────────────────────────────────────
   Galela Dashboard — admin.js (Secure Token Version)
   ────────────────────────────────────────────────────────── */

(function () {
    'use strict';

    // ── Config ─────────────────────────────────────────────
    const API_BASE = 'https://galela-solution-backend.onrender.com/api/dashboard';

    // ── Authentication ─────────────────────────────────────
    let TOKEN = localStorage.getItem('gs_galela_token');

    async function login() {
        let password = prompt("🔒 Enter Galela Admin Password:");
        if (!password) return false;

        try {
            const res = await fetch(`${API_BASE}/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: password })
            });

            if (res.ok) {
                const data = await res.json();
                TOKEN = data.token;
                localStorage.setItem('gs_galela_token', TOKEN);
                return true;
            } else {
                alert("Invalid password.");
                return false;
            }
        } catch (err) {
            alert("Login failed. Please check your connection.");
            return false;
        }
    }

    // Helper to attach the Bearer token to every request
    async function apiFetch(url, options = {}) {
        if (!options.headers) options.headers = {};
        options.headers['Authorization'] = `Bearer ${TOKEN}`;
        return fetch(url, options);
    }

    // ── State ──────────────────────────────────────────────
    const state = {
        visits:   { page: 1, next: null, prev: null, count: 0 },
        requests: { page: 1, next: null, prev: null, count: 0 },
    };

    // ── Helpers ────────────────────────────────────────────
    const $ = (sel) => document.querySelector(sel);

    const fmtDate = (iso) => {
        if (!iso) return '—';
        const d = new Date(iso);
        return d.toLocaleString('en-ZA', {
            year:   'numeric',
            month:  'short',
            day:    '2-digit',
            hour:   '2-digit',
            minute: '2-digit',
        });
    };

    const fmtBytes = (bytes) => {
        if (!bytes) return '0 B';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1024 / 1024).toFixed(1) + ' MB';
    };

    const escapeHtml = (str) => {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    };

    const setStatus = (el, message, type) => {
        el.hidden = false;
        el.className = 'dash-status is-' + type;
        el.textContent = message;
    };

    const clearStatus = (el) => {
        el.hidden = true;
        el.textContent = '';
    };

    // ── Fetch ──────────────────────────────────────────────
    const buildUrl = (endpoint, page) => {
        const params = new URLSearchParams({ page: String(page) });
        return `${API_BASE}/${endpoint}/?${params.toString()}`;
    };

    const fetchData = async (endpoint, page) => {
        const res = await apiFetch(buildUrl(endpoint, page));
        
        if (res.status === 401 || res.status === 403) {
            localStorage.removeItem('gs_galela_token');
            window.location.reload();
            return;
        }
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
    };

    // ── Render: Visits ─────────────────────────────────────
    const renderVisits = (results) => {
        const list = $('#visits-list');
        list.innerHTML = '';

        if (!results.length) {
            list.innerHTML = `<p class="dash-empty">No visits recorded yet.</p>`;
            return;
        }

        for (const v of results) {
            const summary = `
                <span class="row-id">#${v.id}</span>
                <span class="row-meta">${escapeHtml(v.ip || '—')}</span>
                <span class="row-path">${escapeHtml(v.path || '—')}</span>
                <span class="row-country">${escapeHtml(v.country || '')}</span>
                <span class="row-time">${fmtDate(v.created_at)}</span>
            `;

            const detail = `
                <dl class="dash-dl">
                    ${detailRow('ID',         v.id)}
                    ${detailRow('IP',         v.ip)}
                    ${detailRow('Session',    v.session_id)}
                    ${detailRow('Path',       v.path)}
                    ${detailRow('Referrer',   v.referrer)}
                    ${detailRow('User agent', v.user_agent)}
                    ${detailRow('Country',    v.country)}
                    ${detailRow('Country code', v.country_code)}
                    ${detailRow('Continent',  v.continent)}
                    ${detailRow('ASN',        v.asn)}
                    ${detailRow('AS name',    v.as_name)}
                    ${detailRow('AS domain',  v.as_domain)}
                    ${detailRow('Received',   fmtDate(v.created_at))}
                    ${detailRow('Visit date', v.visit_date)}
                </dl>
                <div class="dash-row-actions">
                    <button type="button" class="btn btn-danger btn-sm" data-delete-visit="${v.id}">
                        Delete Visit
                    </button>
                </div>
            `;

            const node = document.createElement('details');
            node.className = 'dash-row';
            node.innerHTML = `<summary>${summary}</summary>${detail}`;
            list.appendChild(node);
        }
    };

    // ── Render: Requests ───────────────────────────────────
    const renderRequests = (results) => {
        const list = $('#requests-list');
        list.innerHTML = '';

        if (!results.length) {
            list.innerHTML = `<p class="dash-empty">No service requests yet.</p>`;
            return;
        }

        for (const r of results) {
            const summary = `
                <span class="row-id">${escapeHtml(r.reference)}</span>
                <span class="row-meta">${escapeHtml(r.name)}</span>
                <span class="row-path">${escapeHtml(r.service)}</span>
                <span class="row-status status-${escapeHtml(r.status)}">${escapeHtml(r.status)}</span>
                <span class="row-time">${fmtDate(r.created_at)}</span>
            `;

             const filesHtml = (r.files && r.files.length)
                ? `<ul class="dash-files">${r.files.map(f => `
                        <li>
                            <a href="#" onclick="downloadFile(event, ${f.id})" class="file-name file-link">
                                📄 ${escapeHtml(f.file_name)}
                            </a>
                            <span class="file-size">${fmtBytes(f.size)}</span>
                            <span class="file-type">${escapeHtml(f.content_type)}</span>
                        </li>
                    `).join('')}</ul>`
                : `<p class="dash-muted">No files attached.</p>`;

             const detail = `
                <dl class="dash-dl">
                    ${detailRow('Reference',      r.reference)}
                    ${detailRow('Name',           r.name)}
                    ${detailRow('Email',          r.email)}
                    ${detailRow('Phone',          r.phone)}
                    ${detailRow('Company',        r.company)}
                    ${detailRow('Service',        r.service)}
                    ${detailRow('Budget',         r.budget)}
                    ${detailRow('Preferred date', r.preferred_date)}
                    ${detailRow('Message',        r.message)}
                    ${detailRow('Consent',        r.consent_given ? 'Yes' : 'No')}
                    ${detailRow('Status',         r.status)}
                    ${detailRow('User agent',     r.user_agent)}
                    ${detailRow('Received',       fmtDate(r.created_at))}
                    ${detailRow('Updated',        fmtDate(r.updated_at))}
                </dl>
                <h4 class="dash-files-title">Attached files</h4>
                ${filesHtml}
                <div class="dash-row-actions">
                    <button type="button" class="btn btn-danger btn-sm" data-delete-request="${r.id}">
                        Delete Request
                    </button>
                </div>
            `;

            const node = document.createElement('details');
            node.className = 'dash-row';
            node.innerHTML = `<summary>${summary}</summary>${detail}`;
            list.appendChild(node);
        }
    };

    const detailRow = (label, value) => {
        if (value === undefined || value === null || value === '') return '';
        return `<div class="dash-dl-row">
                    <dt>${label}</dt>
                    <dd>${escapeHtml(value)}</dd>
                </div>`;
    };

    // ── Pagination update ──────────────────────────────────
    const updatePagination = (endpoint, info) => {
        const nav = document.querySelector(`.dash-pagination[data-for="${endpoint}"]`);
        const prevBtn = nav.querySelector('[data-action="prev"]');
        const nextBtn = nav.querySelector('[data-action="next"]');
        const pageInfo = nav.querySelector('.dash-page-info');

        prevBtn.disabled = !info.prev;
        nextBtn.disabled = !info.next;

        const totalPages = Math.ceil(info.count / 20) || 1;
        pageInfo.textContent = `Page ${state[endpoint].page} of ${totalPages}`;
    };

    // ── Load an endpoint ───────────────────────────────────
    const load = async (endpoint, page) => {
        const statusEl = document.getElementById(`${endpoint}-status`);
        const countEl  = document.getElementById(`${endpoint}-count`);
        const listEl   = document.getElementById(`${endpoint}-list`);

        clearStatus(statusEl);
        listEl.innerHTML = `<p class="dash-muted">Loading…</p>`;

        try {
            const data = await fetchData(endpoint, page);

            state[endpoint].page  = page;
            state[endpoint].next  = data.next;
            state[endpoint].prev  = data.previous;
            state[endpoint].count = data.count;

            countEl.textContent = `(${data.count})`;

            if (endpoint === 'visits') {
                renderVisits(data.results);
            } else {
                renderRequests(data.results);
            }

            updatePagination(endpoint, data);

        } catch (err) {
            listEl.innerHTML = '';
            setStatus(statusEl, `Failed to load: ${err.message}`, 'error');
        }
    };

    // ── Wire up pagination buttons ─────────────────────────
    document.querySelectorAll('.dash-pagination').forEach(nav => {
        const endpoint = nav.dataset.for;

        nav.querySelector('[data-action="prev"]').addEventListener('click', () => {
            load(endpoint, state[endpoint].page - 1);
        });
        nav.querySelector('[data-action="next"]').addEventListener('click', () => {
            load(endpoint, state[endpoint].page + 1);
        });
    });

    // ── Refresh button ─────────────────────────────────────
    $('#refresh-btn').addEventListener('click', () => {
        load('visits',   1);
        load('requests', 1);
    });

    // ── Delete handling ────────────────────────────────────
    document.body.addEventListener('click', async (e) => {
        // Delete Visit
        const visitBtn = e.target.closest('[data-delete-visit]');
        if (visitBtn) {
            e.preventDefault();
            const id = visitBtn.dataset.deleteVisit;
            if (!confirm(`Are you sure you want to delete Visit #${id}?`)) return;
            
            await deleteItem('visits', id, visitBtn);
            return;
        }

        // Delete Request
        const reqBtn = e.target.closest('[data-delete-request]');
        if (reqBtn) {
            e.preventDefault();
            const id = reqBtn.dataset.deleteRequest;
            if (!confirm(`Delete Service Request? This will also permanently delete its attached files.`)) return;
            
            await deleteItem('requests', id, reqBtn);
            return;
        }
    });

    async function deleteItem(endpoint, id, btnElement) {
        const originalText = btnElement.textContent;
        btnElement.disabled = true;
        btnElement.textContent = 'Deleting…';

        try {
            const res = await apiFetch(`${API_BASE}/${endpoint}/${id}/`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const row = btnElement.closest('.dash-row');
            row.style.opacity = '0';
            setTimeout(() => row.remove(), 200);

            load(endpoint, state[endpoint].page);

        } catch (err) {
            alert(`Failed to delete: ${err.message}`);
            btnElement.disabled = false;
            btnElement.textContent = originalText;
        }
    }

    // ── File Download (Secure) ─────────────────────────────
    window.downloadFile = async function(event, fileId) {
        event.preventDefault();
        try {
            const res = await apiFetch(`${API_BASE}/files/${fileId}/`);
            if (!res.ok) throw new Error("Download failed");
            
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = "download"; 
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert("Could not download file.");
        }
    };

    // ── Init ───────────────────────────────────────────────
    async function init() {
        if (!TOKEN) {
            const success = await login();
            if (!success) {
                document.body.innerHTML = "<h2 style='text-align:center; margin-top:50px;'>Access Denied.</h2>";
                return;
            }
        }
        load('visits',   1);
        load('requests', 1);
    }

    init();

})();