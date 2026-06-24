# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 08-export-buttons.spec.js >> docente export buttons trigger XLSX and PDF save actions
- Location: tests/08-export-buttons.spec.js:73:1

# Error details

```
Test timeout of 120000ms exceeded.
```

```
Error: page.waitForSelector: Test timeout of 120000ms exceeded.
Call log:
  - waiting for locator('#lapsoSelect option:not(:first-child)') to be visible
    241 × locator resolved to hidden <option value="lapso-1">Lapso 1</option>

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - navigation [ref=e2]:
    - generic [ref=e3]:
      - link " Docente | NOTAS" [ref=e4] [cursor=pointer]:
        - /url: javascript:location.reload()
        - generic [ref=e5]: 
        - text: Docente | NOTAS
      - list [ref=e7]:
        - listitem [ref=e8]:
          - link " Mi Perfil" [ref=e9] [cursor=pointer]:
            - /url: javascript:nav.irAPerfil()
            - generic [ref=e10]: 
            - text: Mi Perfil
        - listitem [ref=e11]:
          - link " Salir" [ref=e12] [cursor=pointer]:
            - /url: javascript:nav.logout()
            - generic [ref=e13]: 
            - text: Salir
  - generic [ref=e15]:
    - generic [ref=e17]:
      - generic [ref=e19]:
        - generic [ref=e20]: D
        - generic [ref=e21]:
          - generic [ref=e22]: Docente
          - text: docente@ejemplo.com
      - navigation [ref=e23]:
        - link " Panel Principal" [ref=e24] [cursor=pointer]:
          - /url: javascript:cargarSeccion('inicio')
          - generic [ref=e25]: 
          - text: Panel Principal
        - link " Mis Secciones" [ref=e26] [cursor=pointer]:
          - /url: javascript:cargarSeccion('misecciones')
          - generic [ref=e27]: 
          - text: Mis Secciones
        - link " Cargar Notas" [ref=e28] [cursor=pointer]:
          - /url: javascript:cargarSeccion('cargarnotas')
          - generic [ref=e29]: 
          - text: Cargar Notas
        - link " Historial Notas" [ref=e30] [cursor=pointer]:
          - /url: javascript:cargarSeccion('historial')
          - generic [ref=e31]: 
          - text: Historial Notas
        - link " Asesorías" [ref=e32] [cursor=pointer]:
          - /url: javascript:cargarSeccion('asesorias')
          - generic [ref=e33]: 
          - text: Asesorías
    - generic [ref=e36]:
      - heading " Cargar Notas" [level=2] [ref=e38]:
        - generic [ref=e39]: 
        - text: Cargar Notas
      - generic [ref=e40]:
        - generic [ref=e41]:
          - strong [ref=e43]: Selecciona una Sección
          - combobox [ref=e44]:
            - option "-- Seleccionar --"
            - option "10-A" [selected]
        - generic [ref=e45]:
          - strong [ref=e47]: Materia
          - combobox [ref=e48]:
            - option "-- Todas --" [selected]
            - option "Matemáticas"
        - generic [ref=e49]:
          - strong [ref=e51]: Lapso
          - combobox [ref=e52]:
            - option "-- Seleccionar --" [selected]
            - option "Lapso 1"
      - generic [ref=e53]:
        - generic [ref=e55]:
          - generic [ref=e56]:
            - strong [ref=e58]: Tema generador
            - textbox "Tema generador" [ref=e59]
          - generic [ref=e60]:
            - strong [ref=e62]: Técnica
            - textbox "Técnica de evaluación" [ref=e63]
        - generic [ref=e65]:
          - generic [ref=e66]:
            - strong [ref=e68]: Instrumento
            - textbox "Instrumento de evaluación" [ref=e69]
          - generic [ref=e70]:
            - strong [ref=e72]: "% Evaluación"
            - spinbutton [ref=e73]
          - generic [ref=e74]:
            - strong [ref=e76]: Fecha
            - textbox [ref=e77]
      - generic [ref=e79]:
        - generic [ref=e80]: 
        - text: Completa los campos requeridos
```

# Test source

```ts
  1   | const { test, expect } = require('@playwright/test');
  2   | 
  3   | const installMockSession = async (page) => {
  4   |   const sessionData = {
  5   |     user_id: 'doc-123',
  6   |     email: 'docente@example.com',
  7   |     nombre: 'Docente',
  8   |     apellido: 'Prueba',
  9   |     rol_principal: 'Docente',
  10  |     todos_roles: ['Docente'],
  11  |     timestamp: Date.now(),
  12  |   };
  13  | 
  14  |   await page.addInitScript((session) => {
  15  |     window.sessionStorage.setItem('userSession', JSON.stringify(session));
  16  |     window.localStorage.setItem('userEmail', session.email);
  17  |     window.localStorage.setItem('userRole', session.rol_principal);
  18  |   }, sessionData);
  19  | };
  20  | 
  21  | const installMockApi = async (page) => {
  22  |   await page.addInitScript(() => {
  23  |     window.API = {
  24  |       usuarios: {},
  25  |       periodos: {
  26  |         obtenerActivo: async () => ({ id: '2025', nombre: '2024-2025' }),
  27  |         listarAnios: async () => [{ id: '2025', nombre: '2024-2025' }],
  28  |         listarLapsos: async () => [{ id: 'lapso-1', numero: '1' }],
  29  |       },
  30  |       secciones: {
  31  |         listar: async () => [{ id: 'seccion-1', nombre: '10-A', docente_id: 'doc-123' }],
  32  |         listarMaterias: async () => [{ id: 'mat-1', nombre: 'Matemáticas' }],
  33  |       },
  34  |       estudiantes: {
  35  |         listar: async () => [{ id: 'est-1', nombre: 'Juan', apellido: 'Pérez', cedula: 'V-12345678' }],
  36  |       },
  37  |       evaluaciones: {},
  38  |       reportes: {},
  39  |     };
  40  |   });
  41  | };
  42  | 
  43  | const installDownloadStubs = async (page) => {
  44  |   await page.evaluate(() => {
  45  |     window.savedFiles = [];
  46  | 
  47  |     window.XLSX = {
  48  |       utils: {
  49  |         book_new: () => ({}),
  50  |         aoa_to_sheet: () => ({}),
  51  |         book_append_sheet: () => {},
  52  |       },
  53  |       writeFile: (workbook, fileName) => {
  54  |         window.savedFiles.push({ type: 'xlsx', fileName });
  55  |       },
  56  |     };
  57  | 
  58  |     window.jspdf = {
  59  |       jsPDF: function() {
  60  |         return {
  61  |           setFontSize: () => {},
  62  |           text: () => {},
  63  |           autoTable: () => {},
  64  |           save: (fileName) => {
  65  |             window.savedFiles.push({ type: 'pdf', fileName });
  66  |           },
  67  |         };
  68  |       },
  69  |     };
  70  |   });
  71  | };
  72  | 
  73  | test('docente export buttons trigger XLSX and PDF save actions', async ({ page }) => {
  74  |   await installMockSession(page);
  75  |   await installMockApi(page);
  76  | 
  77  |   await page.goto('/pages/docente/dashboard-backup.html');
  78  |   await page.waitForFunction(() => typeof window.cargarSeccion === 'function');
  79  | 
  80  |   await page.evaluate(() => cargarSeccion('cargarnotas'));
  81  |   await page.waitForSelector('#seccionSelect');
  82  | 
  83  |   await page.selectOption('#seccionSelect', 'seccion-1');
> 84  |   await page.waitForSelector('#lapsoSelect option:not(:first-child)');
      |              ^ Error: page.waitForSelector: Test timeout of 120000ms exceeded.
  85  |   await page.selectOption('#lapsoSelect', 'lapso-1');
  86  | 
  87  |   await page.waitForSelector('#btnExportPlanillaXLSX');
  88  |   await page.waitForSelector('#btnExportPlanillaPDF');
  89  | 
  90  |   await installDownloadStubs(page);
  91  | 
  92  |   await page.click('#btnExportPlanillaXLSX');
  93  |   await page.click('#btnExportPlanillaPDF');
  94  | 
  95  |   const savedFiles = await page.evaluate(() => window.savedFiles || []);
  96  |   expect(savedFiles.length).toBeGreaterThanOrEqual(2);
  97  |   expect(savedFiles).toEqual(
  98  |     expect.arrayContaining([
  99  |       expect.objectContaining({
  100 |         type: 'xlsx',
  101 |         fileName: expect.stringContaining('planilla-notas'),
  102 |       }),
  103 |       expect.objectContaining({
  104 |         type: 'pdf',
  105 |         fileName: expect.stringContaining('planilla-notas'),
  106 |       }),
  107 |     ])
  108 |   );
  109 |   expect(savedFiles.find((file) => file.type === 'xlsx').fileName).toMatch(/\.xlsx$/);
  110 |   expect(savedFiles.find((file) => file.type === 'pdf').fileName).toMatch(/\.pdf$/);
  111 | });
  112 | 
```