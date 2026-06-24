const { test, expect } = require('@playwright/test');

const mockSession = {
  user_id: 'test-user',
  email: 'test.user@example.com',
  nombre: 'Test',
  apellido: 'Usuario',
  rol_principal: '',
  todos_roles: [],
  timestamp: Date.now(),
};

const installMockSession = async (page, role) => {
  const session = {
    ...mockSession,
    rol_principal: role,
    todos_roles: [role],
  };

  await page.addInitScript((sessionData) => {
    window.sessionStorage.setItem('userSession', JSON.stringify(sessionData));
    window.localStorage.setItem('userEmail', sessionData.email);
    window.localStorage.setItem('userRole', sessionData.rol_principal);
  }, session);
};

const installMockReportAPI = async (page) => {
  await page.evaluate(() => {
    window.API = {
      usuarios: {},
      periodos: {
        obtenerActivo: async () => ({ id_anio: '2025', nombre: '2024-2025' }),
        listarAnios: async () => [{ id_anio: '2025', nombre: '2024-2025' }],
      },
      secciones: {
        listar: async () => [{ id_seccion: '1', nombre: '10-A' }],
      },
      estudiantes: {
        listar: async () => [],
      },
      evaluaciones: {},
      reportes: {
        generarDatosSabana: async () => [
          {
            Estudiante: 'Juan Perez',
            Materia: 'Matemáticas',
            Nota: '18',
            Lapso: '1',
            Docente: 'Prof. X',
            Acciones: 'Ver',
          },
        ],
        generarActaFinal: async () => ({
          registros: [
            {
              estudiante: 'Juan Perez',
              cedula: 'V-12345678',
              materias: [
                {
                  nombre: 'Matemáticas',
                  definitiva: '18',
                  resultado: 'Aprobado',
                },
              ],
            },
          ],
        }),
        generarBoletinEstudiante: async () => ({
          estudiante: 'Juan Perez',
          cedula: 'V-12345678',
          curso: '10-A',
          periodo: '2024-2025',
          promedio_general: '18.0',
          calificaciones: {
            'Matemáticas': { l1: '18', l2: '19', l3: '17' },
          },
        }),
      },
    };
  });
};

const runReportFlow = async (page) => {
  await expect(page.locator('#btnGenerarSabana')).toBeVisible();
  await expect(page.locator('#btnGenerarActa')).toBeVisible();
  await expect(page.locator('#btnGenerarBoletin')).toBeVisible();

  await page.selectOption('#selectSeccionReporte', '1');
  await page.selectOption('#selectAnioReporte', '2025');

  await page.click('#btnGenerarSabana');
  await expect(page.locator('#reporteResultados')).toContainText('Sabana de Calificaciones');
  await expect(page.locator('#reporteResultados')).toContainText('Juan Perez');

  await page.click('#btnGenerarActa');
  await expect(page.locator('#reporteResultados')).toContainText('Acta Final');
  await expect(page.locator('#reporteResultados')).toContainText('Matemáticas');

  await page.fill('#inputEstudianteReporte', '12345');
  await page.click('#btnGenerarBoletin');
  await expect(page.locator('#reporteResultados')).toContainText('Boletín de Juan Perez');
  await expect(page.locator('#reporteResultados')).toContainText('Promedio general');
};

test('control de estudios tiene interfaz de reportes y genera sabana/acta/boletin', async ({ page }) => {
  await installMockSession(page, 'Control_estudios');
  await page.goto('/pages/control_estudios/dashboard.html');
  await installMockReportAPI(page);

  await page.click('a[href*="reportes"]');
  await page.waitForSelector('#selectSeccionReporte');
  await runReportFlow(page);
});

test('evaluacion docente tiene interfaz de reportes y genera sabana/acta/boletin', async ({ page }) => {
  await installMockSession(page, 'Evaluacion_docente');
  await page.goto('/pages/evaluacion_docente/dashboard.html');
  await installMockReportAPI(page);

  await page.click('a[href*="reportes"]');
  await page.waitForSelector('#selectSeccionReporte');
  await runReportFlow(page);
});
