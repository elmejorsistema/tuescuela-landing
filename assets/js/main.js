(() => {
    const qs = (sel) => document.querySelector(sel);

    // Year
    const yearEl = qs('#year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    // Smooth scroll buttons
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-scroll]');
        if (!btn) return;

        const targetSel = btn.getAttribute('data-scroll');
        const target = targetSel ? qs(targetSel) : null;
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // Form submit via fetch (Formspree or your backend)
    const form = qs('#contactForm');
    if (!form) return;

    const status = qs('#formStatus');
    const submitBtn = qs('#submitBtn');

    // TODO: Put your Formspree endpoint here (or backend endpoint)
    // Example: https://formspree.io/f/xxxxx
    const ENDPOINT = 'TU_FORMSPREE_ENDPOINT_AQUI';

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
        if (!phone?.value || phone.value.trim().length < 8) {
            setStatus('Por favor, escribe un teléfono válido.', 'err');
            phone?.focus();
            return;
        }
        if (!email?.value || !/^\S+@\S+\.\S+$/.test(email.value.trim())) {
            setStatus('Por favor, escribe un correo válido.', 'err');
            email?.focus();
            return;
        }

        if (!ENDPOINT || ENDPOINT.includes('TU_FORMSPREE_ENDPOINT_AQUI')) {
            setStatus('Falta configurar el endpoint del formulario (Formspree o backend).', 'err');
            return;
        }

        submitBtn?.setAttribute('disabled', 'disabled');
        submitBtn && (submitBtn.textContent = 'Enviando...');

        try {
            const formData = new FormData(form);

            const res = await fetch(ENDPOINT, {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
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
