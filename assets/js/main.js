(() => {
    const qs = (sel) => document.querySelector(sel);

    // Year
    const yearEl = qs('#year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    // Smooth scroll buttons (with offset for sticky header/cta)
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-scroll]');
        if (!btn) return;

        const targetSel = btn.getAttribute('data-scroll');
        const target = targetSel ? qs(targetSel) : null;
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });

        requestAnimationFrame(() => {
            const header = qs('.header');
            const sticky = qs('.sticky-cta');
            const headerH = header ? header.getBoundingClientRect().height : 0;
            const stickyH = sticky && window.getComputedStyle(sticky).display !== 'none'
                ? sticky.getBoundingClientRect().height
                : 0;
            window.scrollBy({ top: -(headerH + stickyH + 12), left: 0, behavior: 'smooth' });
        });
    });

    // Form submit via fetch (Formspree or your backend)
    const form = qs('#contactForm');
    if (!form) return;

    const status = qs('#formStatus');
    const submitBtn = qs('#submitBtn');

    // TODO: Put your backend endpoint here
    // Example: https://api.tuescuela.mx/api/leads
    const ENDPOINT = 'https://api.tuescuela.mx/api/leads';
    const LEAD_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXAiOiJsZWFkIiwiaWF0IjoxNzY4NDE2NDE1LCJuYmYiOjE3Njg0MTY0MTV9.UIrg3EjJBOoZP9iWUVTppzTD3XQUHtIfzH6vTGwv2OY';

    const setStatus = (msg, type) => {
        if (!status) return;
        status.className = 'form__status ' + (type === 'ok' ? 'form__status--ok' : type === 'err' ? 'form__status--err' : '');
        status.textContent = msg;
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        setStatus('', '');

        // Honeypot anti-spam
        const hp = form.querySelector('input[name="company"]');
        if (hp && String(hp.value || '').trim() !== '') {
            setStatus('Gracias. Hemos recibido tu solicitud.', 'ok');
            form.reset();
            return;
        }

        // Basic validation
        const name = form.querySelector('input[name="name"]');
        const phone = form.querySelector('input[name="phone"]');
        const email = form.querySelector('input[name="email"]');

        if (!name?.value || name.value.trim().length < 3) {
            setStatus('Por favor, escribe tu nombre completo.', 'err');
            name?.focus();
            return;
        }
        const phoneVal = String(phone?.value || '').replace(/\s+/g, '');
        if (!/^\d{10}$/.test(phoneVal)) {
            setStatus('Por favor, escribe un teléfono válido de 10 dígitos.', 'err');
            phone?.focus();
            return;
        }
        if (!email?.value || !/^\S+@\S+\.\S+$/.test(email.value.trim())) {
            setStatus('Por favor, escribe un correo válido.', 'err');
            email?.focus();
            return;
        }

        if (!ENDPOINT || ENDPOINT.includes('TU_BACKEND_ENDPOINT_AQUI')) {
            setStatus('Falta configurar el endpoint del formulario.', 'err');
            return;
        }
        if (!LEAD_TOKEN || LEAD_TOKEN.includes('TU_JWT_LEADS_AQUI')) {
            setStatus('Falta configurar el token del formulario.', 'err');
            return;
        }

        submitBtn?.setAttribute('disabled', 'disabled');
        submitBtn && (submitBtn.textContent = 'Enviando...');

        try {
            const formData = new FormData(form);

            const res = await fetch(ENDPOINT, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': 'Bearer ' + LEAD_TOKEN,
                },
                body: formData,
            });

            if (res.ok) {
                setStatus('Listo. Te contactaremos para agendar tu demostración.', 'ok');
                form.reset();
            } else {
                setStatus('No se pudo enviar. Intenta de nuevo en unos minutos.', 'err');
            }
        } catch (err) {
            setStatus('Error de red. Revisa tu conexión e intenta de nuevo.', 'err');
        } finally {
            submitBtn?.removeAttribute('disabled');
            submitBtn && (submitBtn.textContent = 'Enviar solicitud');
        }
    });
})();
