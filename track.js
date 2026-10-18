/* ==========================================
       ANALYTICS SCRIPTS
    ========================================== */


/* Galela Solutions — silent visit tracking. No cookies. */
(function () {
    'use strict';

    const ENDPOINT = 'https://galela-solution-backend.onrender.com/api/analytics/visit/';

    let sid = '';
    try {
        sid = sessionStorage.getItem('gs_sid');
        if (!sid) {
            sid = (crypto.randomUUID && crypto.randomUUID()) ||
                  ('gs-' + Date.now() + '-' + Math.random().toString(36).slice(2));
            sessionStorage.setItem('gs_sid', sid);
        }
    } catch (e) { /* storage blocked — send without session id */ }

    fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            path:       window.location.pathname,
            referrer:   document.referrer || '',
            session_id: sid,
        }),
        keepalive: true,
    }).catch(() => {});
})();