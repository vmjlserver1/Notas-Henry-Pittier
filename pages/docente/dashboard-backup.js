(function () {
  if (window.__dashboard_backup_loaded) return;
  window.__dashboard_backup_loaded = true;

  // funciones internas (copiadas desde el inline original)
  async function cargarSeccion(seccion) {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    if (event?.target) {
      event.target.closest('.nav-item')?.classList.add('active');
    }

    switch(seccion) {
      case 'inicio':
        await cargarInicio();
        break;
      case 'misecciones':
        await cargarMisSecciones();
        break;
      case 'cargarnotas':
        await cargarNotasUI();
        break;
      case 'historial':
        await cargarHistorial();
        break;
      case 'asesorias':
        await cargarAsesorias();
        break;
    }
  }

  async function cargarInicio() {
    const contentArea = document.getElementById('contentArea');
    try {
      const periodoActivo = await API.periodos.obtenerActivo();
      const secciones = await API.secciones.listar();
      const misSecciones = secciones.filter(s => s.docente_id === sessionAPI.obtenerUsuario().user_id);

      contentArea.innerHTML = `...`; // contenido reducido para mantenerlo ligero
    } catch(error) {
      console.error('Error:', error);
      contentArea.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    }
  }

  async function cargarMisSecciones() {
    const contentArea = document.getElementById('contentArea');
    try {
      const secciones = await API.secciones.listar();
      const usuario = sessionAPI.obtenerUsuario();
      const misSecciones = secciones.filter(s => s.docente_id === usuario.user_id);
      let html = '<div class="page-header"><h2>Mis Secciones Asignadas</h2></div>';
      if (misSecciones && misSecciones.length > 0) {
        html += '<div class="row">';
        for (const seccion of misSecciones) {
          const materias = await API.secciones.listarMaterias(seccion.id);
          html += `<div class="col-md-6 mb-4"><div class="card card-seccion"><div class="card-body"><h5 class="card-title"><span class="badge badge-seccion">${seccion.nombre}</span></h5><p class="text-muted mb-3">Grado: ${seccion.grado} | Sección: ${seccion.seccion}</p></div></div></div>`;
        }
        html += '</div>';
      } else {
        html += '<div class="alert alert-warning">No tienes secciones asignadas</div>';
      }
      contentArea.innerHTML = html;
    } catch(error) {
      console.error('Error:', error);
      contentArea.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    }
  }

  async function cargarNotasUI() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
      <div class="page-header">
        <h2><i class="bi bi-pencil-square"></i> Cargar Notas</h2>
      </div>
      <div class="row mb-4">
        <div class="col-md-4">
          <label class="form-label"><strong>Selecciona una Sección</strong></label>
          <select class="form-select" id="seccionSelect" onchange="cargarMateriasDeSeccion()">
            <option value="">-- Seleccionar --</option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="form-label"><strong>Materia</strong></label>
          <select class="form-select" id="materiaSelect" onchange="cargarEstudiantesSeccion()">
            <option value="">-- Todas --</option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="form-label"><strong>Lapso</strong></label>
          <select class="form-select" id="lapsoSelect" onchange="cargarEstudiantesSeccion()">
            <option value="">-- Seleccionar --</option>
          </select>
        </div>
      </div>
      <div id="tablasNotasContainer"></div>
    `;

    try {
      const secciones = await API.secciones.listar();
      const usuario = sessionAPI.obtenerUsuario();
      const misSecciones = secciones.filter(s => s.docente_id === usuario.user_id || s.asesor_id === usuario.user_id);

      const selectSeccion = document.getElementById('seccionSelect') || document.getElementById('select-seccion-notas');
      if (selectSeccion) {
        selectSeccion.innerHTML = '<option value="">-- Seleccionar --</option>' + misSecciones.map(s => `<option value="${s.id}">${s.nombre}</option>`).join('');
      }

      const periodos = await API.periodos.listarAnios();
      const selectLapso = document.getElementById('lapsoSelect') || document.getElementById('select-lapso-notas');
      if (selectLapso) {
        selectLapso.innerHTML = '<option value="">-- Seleccionar --</option>' + (await (API.periodos.listarLapsos(periodos[0]?.id))).map(l => `<option value="${l.id}">Lapso ${l.numero}</option>`).join('');
      }
    } catch(error) {
      console.error('Error:', error);
    }
  }

  async function cargarEstudiantesSeccion() {
    const seccionId = (document.getElementById('seccionSelect') || document.getElementById('select-seccion-notas')).value;
    const materiaId = (document.getElementById('materiaSelect') || document.getElementById('select-materia-notas'))?.value;
    const lapsoId = (document.getElementById('lapsoSelect') || document.getElementById('select-lapso-notas'))?.value;
    const container = document.getElementById('tablasNotasContainer') || document.getElementById('notas-container');
    if (!seccionId || !lapsoId) {
      if (container) container.innerHTML = '<div class="alert alert-info">Completa los campos requeridos</div>';
      return;
    }
    try {
      const estudiantes = await API.estudiantes.listar({ seccion_id: seccionId });
      const materias = await API.secciones.listarMaterias(seccionId);
      // Render tabla simplificada
      if (container) container.innerHTML = `<div class="alert alert-success">Cargados ${estudiantes.length} estudiantes</div>`;
    } catch(error) {
      console.error('Error:', error);
    }
  }

  function cargarMateriasDeSeccion() { cargarEstudiantesSeccion(); }

  function irACargarNotas(seccionId, seccionNombre) {
    const sel = document.getElementById('seccionSelect') || document.getElementById('select-seccion-notas');
    if (sel) sel.value = seccionId;
    cargarSeccion('cargarnotas');
    setTimeout(() => { if (sel) { sel.value = seccionId; cargarMateriasDeSeccion(); } }, 100);
  }

  function guardarNotas() { alert('Función de guardar notas - Se implementará con la BD'); }

  // export helpers (stubs reuse global libs)
  function getTableData(tableId) { /* simplified */ return null; }
  function downloadXLSX() {}
  function exportPlanillaXLSX() {}
  function exportPlanillaPDF() {}
  function exportSabanaXLSX() {}
  function exportSabanaPDF() {}

  // attach to window only if not already defined (avoid collisions)
  window.cargarSeccion = window.cargarSeccion || cargarSeccion;
  window.cargarNotasUI = window.cargarNotasUI || cargarNotasUI;
  window.cargarEstudiantesSeccion = window.cargarEstudiantesSeccion || cargarEstudiantesSeccion;
  window.cargarMateriasDeSeccion = window.cargarMateriasDeSeccion || cargarMateriasDeSeccion;
  window.irACargarNotas = window.irACargarNotas || irACargarNotas;
  window.guardarNotas = window.guardarNotas || guardarNotas;
  window.cargarMisSecciones = window.cargarMisSecciones || cargarMisSecciones;
  window.cargarInicio = window.cargarInicio || cargarInicio;
  // export functions
  window.exportPlanillaXLSX = window.exportPlanillaXLSX || exportPlanillaXLSX;
  window.exportPlanillaPDF = window.exportPlanillaPDF || exportPlanillaPDF;
  window.exportSabanaXLSX = window.exportSabanaXLSX || exportSabanaXLSX;
  window.exportSabanaPDF = window.exportSabanaPDF || exportSabanaPDF;

})();
