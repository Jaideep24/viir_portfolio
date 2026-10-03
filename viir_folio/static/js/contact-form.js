/* ==========================================================================
   Contact Form — Progressive Enhancement JS
   Handles async form submission with CSRF, error display, and recovery UX.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('contactForm');
    const msgDiv = document.getElementById('formMessage');
    const btn = document.getElementById('submitBtn');

    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const textSpan = btn.querySelector('.text');
        if (textSpan) textSpan.textContent = 'Sending...';
        btn.disabled = true;

        const formData = new FormData(form);

        fetch(window.location.href, {
            method: 'POST',
            body: formData,
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
        .then(async function (response) {
            let data = {};
            try { data = await response.json(); } catch (_) {}

            if (response.ok) {
                msgDiv.className = 'alert alert-success';
                msgDiv.innerHTML = '<b>Message sent successfully! I\'ll get back to you within 24 hours.</b>';
                msgDiv.style.display = 'block';
                form.reset();
            } else {
                msgDiv.className = 'alert alert-danger';
                let errorMsg = '<b>Something went wrong. Please try again.</b>';

                if (data.errors) {
                    const errorLines = Object.entries(data.errors).map(function ([field, errors]) {
                        const label = field.charAt(0).toUpperCase() + field.slice(1);
                        return label + ': ' + errors.join(', ');
                    });
                    if (errorLines.length > 0) {
                        errorMsg = '<b>Please correct the following:</b><br>' + errorLines.join('<br>');
                    }
                } else if (data.message) {
                    errorMsg = '<b>' + data.message + '</b>';
                }

                msgDiv.innerHTML = errorMsg;
                msgDiv.style.display = 'block';
            }
        })
        .catch(function () {
            msgDiv.className = 'alert alert-danger';
            msgDiv.innerHTML = '<b>Network error. Please check your connection and try again.</b>';
            msgDiv.style.display = 'block';
        })
        .finally(function () {
            const textSpan = btn.querySelector('.text');
            if (textSpan) textSpan.textContent = 'Send Message';
            btn.disabled = false;
            // Auto-dismiss after 8 seconds so the user can retry without manually closing
            setTimeout(function () { msgDiv.style.display = 'none'; }, 8000);
        });
    });
});
