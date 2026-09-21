/* ==========================================================================
   Gestión del consentimiento de cookies (LSSI-CE + RGPD)
   Salvadis — carga la analítica SOLO tras consentimiento explícito.
   ========================================================================== */
(function () {
    'use strict';

    if (window.SalvadisCookies) return;

    var GA_ID = 'G-N59JEJ40RD';
    var STORAGE_KEY = 'salvadis_cookie_consent';
    var CONSENT_VERSION = 1;
    var CONSENT_MONTHS = 12;
    var POLICY_URL = 'politica-de-cookies';
    var PRIVACY_URL = 'politica-de-privacidad';

    /* ---------------------------------------------------- Consent Mode v2 */
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = window.gtag || gtag;
    window.gtag('consent', 'default', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
        functionality_storage: 'granted',
        security_storage: 'granted',
        wait_for_update: 500
    });
    window.gtag('set', 'ads_data_redaction', true);
    window.gtag('set', 'url_passthrough', true);

    /* ------------------------------------------------------- Persistencia */
    function readConsent() {
        try {
            var raw = window.localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            var data = JSON.parse(raw);
            if (!data || data.v !== CONSENT_VERSION) return null;
            var limit = CONSENT_MONTHS * 30 * 24 * 60 * 60 * 1000;
            if (!data.ts || (Date.now() - data.ts) > limit) return null;
            return {
                analytics: data.analytics === true,
                thirdparty: data.thirdparty === true
            };
        } catch (e) {
            return null;
        }
    }

    function writeConsent(state) {
        var payload = {
            v: CONSENT_VERSION,
            ts: Date.now(),
            analytics: state.analytics === true,
            thirdparty: state.thirdparty === true
        };
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        } catch (e) { /* almacenamiento no disponible: se pedirá de nuevo */ }
        return payload;
    }

    function clearConsent() {
        try { window.localStorage.removeItem(STORAGE_KEY); } catch (e) { /* noop */ }
    }

    /* ------------------------------------------------------ Google Analytics */
    var analyticsLoaded = false;

    function loadAnalytics() {
        if (analyticsLoaded) return;
        analyticsLoaded = true;

        window.gtag('consent', 'update', { analytics_storage: 'granted' });

        var script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
        document.head.appendChild(script);

        window.gtag('js', new Date());
        window.gtag('config', GA_ID, { anonymize_ip: true });
    }

    function disableAnalytics() {
        window.gtag('consent', 'update', { analytics_storage: 'denied' });
    }

    /* --------------------------------------------- Embeds de terceros (mapa) */
    function applyEmbeds(state) {
        var embeds = document.querySelectorAll('[data-consent-category]');
        Array.prototype.forEach.call(embeds, function (embed) {
            var category = embed.getAttribute('data-consent-category');
            var iframe = embed.querySelector('iframe[data-consent-src]');
            var placeholder = embed.querySelector('.consent-embed__placeholder');
            if (!iframe) return;

            var granted = state[category] === true;
            var src = iframe.getAttribute('data-consent-src');

            if (granted) {
                if (iframe.getAttribute('src') !== src) iframe.setAttribute('src', src);
                if (placeholder) placeholder.hidden = true;
                embed.classList.add('consent-embed--active');
            } else {
                iframe.removeAttribute('src');
                if (placeholder) placeholder.hidden = false;
                embed.classList.remove('consent-embed--active');
            }
        });
    }

    function buildEmbedPlaceholders() {
        var embeds = document.querySelectorAll('[data-consent-category]');
        Array.prototype.forEach.call(embeds, function (embed) {
            var iframe = embed.querySelector('iframe[data-consent-src]');
            if (!iframe || embed.querySelector('.consent-embed__placeholder')) return;

            var box = document.createElement('div');
            box.className = 'consent-embed__placeholder';
            box.innerHTML =
                '<i class="bi bi-geo-alt" aria-hidden="true"></i>' +
                '<p>El mapa de Google está bloqueado hasta que aceptes las cookies de terceros.</p>' +
                '<div class="consent-embed__actions">' +
                '<button type="button" class="ck-btn ck-btn--accept" data-consent-allow="' +
                embed.getAttribute('data-consent-category') + '">Aceptar y cargar mapa</button>' +
                '<button type="button" class="ck-btn ck-btn--ghost" data-consent-manage>Gestionar preferencias</button>' +
                '</div>';

            embed.insertBefore(box, iframe);
            embed.classList.add('consent-embed--gated');
        });
    }

    /* -------------------------------------------------------------- Banner */
    var bannerEl = null;
    var modalEl = null;
    var lastFocused = null;

    function buildBanner() {
        if (bannerEl) return;
        var el = document.createElement('div');
        el.className = 'cookie-banner';
        el.setAttribute('role', 'region');
        el.setAttribute('aria-label', 'Aviso de cookies');
        el.innerHTML =
            '<div class="cookie-banner__inner">' +
            '<div class="cookie-banner__text">' +
            '<p class="cookie-banner__title">Usamos cookies</p>' +
            '<p class="cookie-banner__desc">Utilizamos cookies propias y de terceros para analizar tu ' +
            'navegación y mejorar el servicio. Puedes aceptarlas todas, rechazar las no esenciales o ' +
            'configurarlas. Más información en la <a href="' + POLICY_URL + '">Política de Cookies</a> ' +
            'y la <a href="' + PRIVACY_URL + '">Política de Privacidad</a>.</p>' +
            '</div>' +
            '<div class="cookie-banner__actions">' +
            '<button type="button" class="ck-btn ck-btn--accept" data-ck="accept">Aceptar todas</button>' +
            '<button type="button" class="ck-btn ck-btn--reject" data-ck="reject">Rechazar todas</button>' +
            '<button type="button" class="ck-btn ck-btn--ghost" data-ck="config">Configurar</button>' +
            '</div>' +
            '</div>';
        document.body.appendChild(el);
        bannerEl = el;
        document.body.classList.add('ck-banner-open');
        window.requestAnimationFrame(function () {
            window.requestAnimationFrame(function () { el.classList.add('is-visible'); });
        });
    }

    function hideBanner() {
        if (!bannerEl) return;
        var el = bannerEl;
        bannerEl = null;
        el.classList.remove('is-visible');
        document.body.classList.remove('ck-banner-open');
        window.setTimeout(function () {
            if (el.parentNode) el.parentNode.removeChild(el);
        }, 500);
    }

    /* ------------------------------------------------- Panel de preferencias */
    function buildModal() {
        if (modalEl) return;
        var el = document.createElement('div');
        el.className = 'cookie-modal-overlay';
        el.innerHTML =
            '<div class="cookie-modal" role="dialog" aria-modal="true" aria-labelledby="ck-modal-title">' +
            '<div class="cookie-modal__head">' +
            '<h2 id="ck-modal-title">Preferencias de cookies</h2>' +
            '<p>Gestiona tu consentimiento por categorías. Puedes cambiarlo cuando quieras.</p>' +
            '</div>' +
            '<div class="cookie-modal__body">' +
            '<div class="cookie-cat"><div class="cookie-cat__info">' +
            '<p class="cookie-cat__name">Necesarias</p>' +
            '<p class="cookie-cat__desc">Imprescindibles para el funcionamiento del sitio y para recordar ' +
            'tu decisión. Siempre activas.</p></div>' +
            '<label class="ck-switch"><input type="checkbox" checked disabled aria-label="Necesarias (siempre activas)">' +
            '<span class="ck-switch__track"></span></label></div>' +
            '<div class="cookie-cat"><div class="cookie-cat__info">' +
            '<p class="cookie-cat__name">Analíticas</p>' +
            '<p class="cookie-cat__desc">Google Analytics 4. Nos permiten medir el uso del sitio de forma ' +
            'agregada. <a href="' + POLICY_URL + '">Más información</a>.</p></div>' +
            '<label class="ck-switch"><input type="checkbox" data-ck-cat="analytics" aria-label="Analíticas">' +
            '<span class="ck-switch__track"></span></label></div>' +
            '<div class="cookie-cat"><div class="cookie-cat__info">' +
            '<p class="cookie-cat__name">Terceros</p>' +
            '<p class="cookie-cat__desc">Google Maps y contenido embebido. Pueden establecer sus propias ' +
            'cookies al cargarse.</p></div>' +
            '<label class="ck-switch"><input type="checkbox" data-ck-cat="thirdparty" aria-label="Terceros">' +
            '<span class="ck-switch__track"></span></label></div>' +
            '</div>' +
            '<div class="cookie-modal__foot">' +
            '<button type="button" class="ck-btn ck-btn--ghost" data-ck="reject">Rechazar todas</button>' +
            '<button type="button" class="ck-btn ck-btn--reject" data-ck="save">Guardar preferencias</button>' +
            '<button type="button" class="ck-btn ck-btn--accept" data-ck="accept">Aceptar todas</button>' +
            '</div>' +
            '</div>';
        document.body.appendChild(el);
        modalEl = el;
    }

    function syncInputs(state) {
        if (!modalEl) return;
        var analytics = modalEl.querySelector('[data-ck-cat="analytics"]');
        var thirdparty = modalEl.querySelector('[data-ck-cat="thirdparty"]');
        if (analytics) analytics.checked = state.analytics === true;
        if (thirdparty) thirdparty.checked = state.thirdparty === true;
    }

    function openPrefs() {
        buildModal();
        var current = readConsent() || { analytics: false, thirdparty: false };
        syncInputs(current);
        lastFocused = document.activeElement;
        modalEl.classList.add('is-visible');
        document.body.classList.add('ck-locked');
        var focusable = modalEl.querySelector('input:not([disabled]), button');
        if (focusable) focusable.focus();
        document.addEventListener('keydown', onModalKeydown, true);
    }

    function closePrefs() {
        if (!modalEl) return;
        modalEl.classList.remove('is-visible');
        document.body.classList.remove('ck-locked');
        document.removeEventListener('keydown', onModalKeydown, true);
        if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    function onModalKeydown(e) {
        if (!modalEl || !modalEl.classList.contains('is-visible')) return;
        if (e.key === 'Escape') {
            e.preventDefault();
            closePrefs();
            return;
        }
        if (e.key !== 'Tab') return;
        var nodes = modalEl.querySelectorAll('a[href], button:not([disabled]), input:not([disabled])');
        if (!nodes.length) return;
        var first = nodes[0];
        var last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }
    function applyState(state, persist) {
        if (persist) writeConsent(state);
        applyEmbeds(state);
        if (state.analytics) loadAnalytics(); else disableAnalytics();
        syncInputs(state);
    }

    function saveChoice(state) {
        buildModal();
        applyState(state, true);
        hideBanner();
        closePrefs();
    }

    function onClick(e) {
        var actionBtn = e.target.closest ? e.target.closest('[data-ck]') : null;
        if (actionBtn) {
            var action = actionBtn.getAttribute('data-ck');
            if (action === 'accept') { e.preventDefault(); saveChoice({ analytics: true, thirdparty: true }); return; }
            if (action === 'reject') { e.preventDefault(); saveChoice({ analytics: false, thirdparty: false }); return; }
            if (action === 'config') { e.preventDefault(); openPrefs(); return; }
            if (action === 'save') {
                e.preventDefault();
                buildModal();
                var a = modalEl.querySelector('[data-ck-cat="analytics"]');
                var t = modalEl.querySelector('[data-ck-cat="thirdparty"]');
                saveChoice({ analytics: !!(a && a.checked), thirdparty: !!(t && t.checked) });
                return;
            }
        }

        var allowBtn = e.target.closest ? e.target.closest('[data-consent-allow]') : null;
        if (allowBtn) {
            e.preventDefault();
            var cat = allowBtn.getAttribute('data-consent-allow');
            var state = readConsent() || { analytics: false, thirdparty: false };
            state[cat] = true;
            applyState(state, true);
            return;
        }

        var manageBtn = e.target.closest ? e.target.closest('[data-consent-manage]') : null;
        if (manageBtn) {
            e.preventDefault();
            openPrefs();
            return;
        }

        if (modalEl && e.target === modalEl) closePrefs();
    }

    function init() {
        if (document.querySelector('.cookie-banner')) return;
        buildEmbedPlaceholders();
        buildModal();
        document.addEventListener('click', onClick);

        var existing = readConsent();
        if (existing) {
            applyState(existing, false);
        } else {
            buildBanner();
            applyState({ analytics: false, thirdparty: false }, false);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.SalvadisCookies = {
        openPreferences: openPrefs,
        getConsent: readConsent,
        reset: function () {
            clearConsent();
            applyState({ analytics: false, thirdparty: false }, false);
            closePrefs();
            buildBanner();
        }
    };
})();
