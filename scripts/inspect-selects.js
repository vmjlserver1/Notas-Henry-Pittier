const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  // Inject lightweight mocks before any script runs on the page
  await page.addInitScript(() => {
    // Provide a minimal supabase shim so pages that call createClient don't crash in tests
    window.supabase = window.supabase || {
      createClient: (url, key) => ({
        auth: {
          getSession: async () => ({ data: { session: null } })
        },
        functions: {
          invoke: async () => ({ data: null })
        }
      })
    };
    window.API = window.API || {};
    window.API.secciones = window.API.secciones || {
      listar: async (opts) => {
        return [ { id: 's1', nombre: '1-A', docente_id: 'u1' }, { id: 's2', nombre: '2-B', docente_id: 'u1' } ];
      },
      listarMaterias: async (seccionId) => {
        return [ { id: 'm1', nombre: 'Matemáticas' }, { id: 'm2', nombre: 'Lengua' } ];
      }
    };
    window.API.periodos = window.API.periodos || {
      listarAnios: async () => [ { id: 'p1', nombre: '2026' } ],
      listarLapsos: async (periodoId) => [ { id: 'l1', numero: 1 }, { id: 'l2', numero: 2 } ],
      obtenerActivo: async () => ({ id: 'p1', nombre: '2026' })
    };
    window.API.estudiantes = window.API.estudiantes || {
      listar: async (filter) => [ { id: 'e1', nombre: 'Juan', apellido: 'Perez', cedula: 'V-123' } ]
    };
    window.sessionAPI = window.sessionAPI || {
      obtenerUsuario: () => ({ user_id: 'u1', nombre: 'Doc', apellido: 'Test' })
    };
  });

  try {
    await page.goto('http://localhost:3000/pages/docente/dashboard-backup.html', { waitUntil: 'load', timeout: 10000 });
  } catch (e) {
    console.error('Error loading page:', e.message);
    await browser.close();
    process.exit(1);
  }

  try {
    await page.waitForFunction(() => typeof window.cargarSeccion === 'function', { timeout: 5000 });
  } catch (e) {
    console.warn('cargarSeccion not found within timeout');
  }

  try {
    const type = await page.evaluate(() => typeof window.cargarSeccion);
    const scripts = await page.evaluate(() => Array.from(document.scripts).map(s => ({ src: s.src || null, len: s.textContent?.length || 0 })));
    console.log('scripts on page:', JSON.stringify(scripts, null, 2));
    console.log('window.cargarSeccion type:', type);
    await page.evaluate(() => { if (typeof window.cargarSeccion === 'function') window.cargarSeccion('cargarnotas'); });
  } catch (e) {
    console.warn('Error invoking cargarSeccion:', e.message);
  }

  // give more time for async population
  await page.waitForTimeout(1000);

  const contentHTML = await page.evaluate(() => {
    const el = document.getElementById('contentArea');
    return el ? el.innerHTML.slice(0, 1000) : null;
  });

  console.log('contentArea (snippet):', contentHTML);

  const seccionOptions = await page.$$eval('#seccionSelect option', opts => opts.map(o => {
    const s = window.getComputedStyle(o);
    return {
      value: o.value,
      text: o.textContent.trim(),
      hidden: o.hidden,
      disabled: o.disabled,
      display: s.display,
      visibility: s.visibility,
      opacity: s.opacity,
      ariaHidden: o.getAttribute('aria-hidden')
    };
  }));

  const lapsoOptions = await page.$$eval('#lapsoSelect option', opts => opts.map(o => {
    const s = window.getComputedStyle(o);
    return {
      value: o.value,
      text: o.textContent.trim(),
      hidden: o.hidden,
      disabled: o.disabled,
      display: s.display,
      visibility: s.visibility,
      opacity: s.opacity,
      ariaHidden: o.getAttribute('aria-hidden')
    };
  }));

  const seccionSelect = await page.$eval('#seccionSelect', s => {
    const st = window.getComputedStyle(s);
    return { hidden: s.hidden, disabled: s.disabled, display: st.display, visibility: st.visibility, opacity: st.opacity };
  }).catch(() => null);

  const lapsoSelect = await page.$eval('#lapsoSelect', s => {
    const st = window.getComputedStyle(s);
    return { hidden: s.hidden, disabled: s.disabled, display: st.display, visibility: st.visibility, opacity: st.opacity };
  }).catch(() => null);

  console.log('seccionSelect:', JSON.stringify(seccionSelect, null, 2));
  console.log('seccionOptions:', JSON.stringify(seccionOptions, null, 2));
  console.log('lapsoSelect:', JSON.stringify(lapsoSelect, null, 2));
  console.log('lapsoOptions:', JSON.stringify(lapsoOptions, null, 2));

  await browser.close();
})();
