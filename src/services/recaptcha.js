const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

let loaded = false;
let loading = null;

function loadRecaptchaScript() {
  if (loaded) return Promise.resolve();
  if (loading) return loading;

  if (typeof window.grecaptcha !== 'undefined' && window.grecaptcha.ready) {
    loaded = true;
    return Promise.resolve();
  }

  loading = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      loaded = true;
      loading = null;
      resolve();
    };
    document.head.appendChild(script);
  });

  return loading;
}

export async function executeRecaptcha(action = 'login') {
  if (!SITE_KEY) {
    console.warn('VITE_RECAPTCHA_SITE_KEY não definida — pulando reCAPTCHA');
    return null;
  }

  await loadRecaptchaScript();

  return new Promise((resolve) => {
    window.grecaptcha.ready(async () => {
      try {
        const token = await window.grecaptcha.execute(SITE_KEY, { action });
        resolve(token);
      } catch {
        resolve(null);
      }
    });
  });
}
