(() => {
  document.addEventListener('submit', async event => {
    const form = event.target.closest('form[data-api-form]');
    if (!form) return;
    event.preventDefault();
    if (!form.reportValidity()) return;

    const feedback = form.querySelector('[data-form-feedback]');
    const button = form.querySelector('button[type="submit"]');
    const originalButtonText = button?.innerHTML || '';
    const formType = form.dataset.apiForm;
    const endpoint = formType === 'newsletter' ? '/api/newsletter' : '/api/leads';
    const values = Object.fromEntries(new FormData(form).entries());
    const payload = formType === 'newsletter'
      ? { email: values.email }
      : {
          type: formType,
          name: values.name,
          email: values.email || '',
          phone: values.phone,
          service: values.service,
          message: values.message || '',
          emailRequired: form.dataset.emailRequired === 'true'
        };

    if (button) {
      button.disabled = true;
      button.setAttribute('aria-busy', 'true');
    }
    if (feedback) {
      feedback.hidden = true;
      feedback.textContent = '';
      feedback.classList.remove('is-error', 'is-success');
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) {
        const firstFieldError = result.fields && Object.values(result.fields)[0];
        throw new Error(firstFieldError || result.error || 'Unable to submit your request.');
      }

      form.reset();
      showFeedback(result.message, 'is-success');
    } catch (error) {
      showFeedback(error.message || 'Could not reach the local server. Please try again.', 'is-error');
    } finally {
      if (button) {
        button.disabled = false;
        button.removeAttribute('aria-busy');
        button.innerHTML = originalButtonText;
      }
    }

    function showFeedback(message, state) {
      if (feedback) {
        feedback.textContent = message;
        feedback.classList.add(state);
        feedback.hidden = false;
      } else if (typeof window.showToast === 'function') {
        window.showToast(message);
      }
    }
  });
})();
