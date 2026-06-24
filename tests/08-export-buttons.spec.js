const { test, expect } = require('@playwright/test');

const installMockSession = async (page) => {
  const sessionData = {
    user_id: 'doc-123',
    email: 'docente@example.com',
    nombre: 'Docente',
    apellido: 'Prueba',
    rol_principal: 'Docente',
    todos_roles: ['Docente'],
    timestamp: Date.now(),
  };

  await page.addInitScript((session) => {
    window.sessionStorage.setItem('userSession', JSON.stringify(session));
    window.localStorage.setItem('userEmail', session.email);
    window.localStorage.setItem('userRole', session.rol_principal);
  }, sessionData);
};

const installMockApi = async (page) => {
  await page.addInitScript(() => {
    window.API = {
      usuarios: {},
      periodos: {
        obtenerActivo: async () => ({ id: '2025', nombre: '2024-2025' }),
        listarAnios: async () => [{ id: '2025', nombre: '2024-2025' }],
        listarLapsos: async () => [{ id: 'lapso-1', numero: '1' }],
      },
      secciones: {
        listar: async () => [{ id: 'seccion-1', nombre: '10-A', docente_id: 'doc-123' }],
        listarMaterias: async () => [{ id: 'mat-1', nombre: 'Matemáticas' }],
      },
      estudiantes: {
        listar: async () => [{ id: 'est-1', nombre: 'Juan', apellido: 'Pérez', cedula: 'V-12345678' }],
      },
      evaluaciones: {},
      reportes: {},
    };
  });
};

const installDownloadStubs = async (page) => {
  await page.evaluate(() => {
    window.savedFiles = [];

    window.XLSX = {
      utils: {
        book_new: () => ({}),
        aoa_to_sheet: () => ({}),
        book_append_sheet: () => {},
      },
      writeFile: (workbook, fileName) => {
        window.savedFiles.push({ type: 'xlsx', fileName });
      },
    };

    window.jspdf = {
      jsPDF: function() {
        return {
          setFontSize: () => {},
          text: () => {},
          autoTable: () => {},
          save: (fileName) => {
            window.savedFiles.push({ type: 'pdf', fileName });
          },
        };
      },
    };
  });
};

test('docente export buttons trigger XLSX and PDF save actions', async ({ page }) => {
  await installMockSession(page);
  await installMockApi(page);

  await page.goto('/pages/docente/dashboard-backup.html');
  await page.waitForFunction(() => typeof window.cargarSeccion === 'function');

  await page.evaluate(() => cargarSeccion('cargarnotas'));
  await page.waitForSelector('#seccionSelect');

  await page.selectOption('#seccionSelect', 'seccion-1');
  await page.waitForSelector('#lapsoSelect option:not(:first-child)');
  await page.selectOption('#lapsoSelect', 'lapso-1');

  await page.waitForSelector('#btnExportPlanillaXLSX');
  await page.waitForSelector('#btnExportPlanillaPDF');

  await installDownloadStubs(page);

  await page.click('#btnExportPlanillaXLSX');
  await page.click('#btnExportPlanillaPDF');

  const savedFiles = await page.evaluate(() => window.savedFiles || []);
  expect(savedFiles.length).toBeGreaterThanOrEqual(2);
  expect(savedFiles).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        type: 'xlsx',
        fileName: expect.stringContaining('planilla-notas'),
      }),
      expect.objectContaining({
        type: 'pdf',
        fileName: expect.stringContaining('planilla-notas'),
      }),
    ])
  );
  expect(savedFiles.find((file) => file.type === 'xlsx').fileName).toMatch(/\.xlsx$/);
  expect(savedFiles.find((file) => file.type === 'pdf').fileName).toMatch(/\.pdf$/);
});
