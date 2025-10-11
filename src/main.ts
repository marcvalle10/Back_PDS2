import 'dotenv/config';
import 'reflect-metadata';
import { DeepPartial } from 'typeorm';
import express, { Express } from 'express';
import cors from 'cors';
import { AppDataSource } from './data-source';
import {
  DataSource,
  EntityTarget,
  Repository,
  ObjectLiteral,
} from 'typeorm';
import { QAlumno, QMateria, QProfesor, QKardex, QCalif, QArchivo, QSancion, QPeriodo, QGrupo, QInscripcion, QPlan } from "./querys";

import {
  PlanEstudio,
  Alumno,
  Profesor,
  Materia,
  Periodo,
  Grupo,
  Inscripcion,
  Kardex,
  Calificacion,
  ArchivoCargado,
  ValidacionResultado,
  AuditoriaCargas,
  AsignacionProfesor,
  OptativaProgreso,
  Incidencia,
  Sancion,
  Horario, // 👈 IMPORTANTE
} from './entities';
import archivoCargasRouter from './routes/archivoCargas.router';
import alumnoRouter from './routes/alumno.router';
import { getHorarioActualAlumno } from './usecases/horario.controllers';

async function bootstrap() {
  // 1) Inicializa la BD
  const ds: DataSource = await AppDataSource.initialize();

  // (debug) verifica que sí estás usando pooler/6543
  console.log('DB →', process.env.DB_HOST || process.env.PGHOST, process.env.DB_PORT || process.env.PGPORT);

  // 2) Semilla opcional
  if (process.env.RUN_SEED === 'true') {
    const repo = ds.getRepository(PlanEstudio);
    const existente = await repo.findOne({
      where: { nombre: 'IS-UNISON', version: '2025' },
    });
    if (!existente) {
      const plan = repo.create({
        nombre: 'IS-UNISON',
        version: '2025',
        total_creditos: 300,
        semestres_sugeridos: 9,
      });
      await repo.save(plan);
      console.log('OK -> plan_estudio creado id:', plan.id);
    } else {
      console.log('plan_estudio ya existe -> id:', existente.id);
    }
  } else {
    console.log('Seed saltado (RUN_SEED != "true")');
  }

  // 3) App Express
  const app: Express = express();
  app.use(cors());
  app.use(express.json());

  app.get('/', (_req, res) => res.send('Back_PDS2 OK'));
  app.get('/health', (_req, res) =>
    res.json({ ok: true, env: process.env.NODE_ENV || 'development' })
  );

  // ===== Helper global de repos =====
  const R = <T extends ObjectLiteral>(entity: EntityTarget<T>): Repository<T> =>
    ds.getRepository<T>(entity);

  // 4) CRUD genérico (usa el helper R)
  function crudRoutes<T extends ObjectLiteral>(
    path: string,
    entity: EntityTarget<T>
  ) {
    const repo = () => R<T>(entity);

    // Listar
    app.get(`/${path}`, async (_req, res) => {
      try {
        const data = await repo().find();
        res.json(data);
      } catch (e) {
        console.error(e);
        res.status(500).json({ error: `Error listando ${path}` });
      }
    });

    // Obtener por id
    app.get(`/${path}/:id`, async (req, res) => {
      try {
        const item = await repo().findOneBy({ id: Number(req.params.id) } as any);
        item ? res.json(item) : res.status(404).json({ error: `${path} no encontrado` });
      } catch (e) {
        console.error(e);
        res.status(500).json({ error: `Error obteniendo ${path}` });
      }
    });

    // Crear
    app.post(`/${path}`, async (req, res) => {
      try {
        const nuevo = repo().create(req.body as any);
        const saved = await repo().save(nuevo);
        res.status(201).json(saved);
      } catch (e: any) {
        console.error(e);
        res.status(400).json({ error: e?.detail || `Error creando ${path}` });
      }
    });

    // Actualizar
    app.put(`/${path}/:id`, async (req, res) => {
      try {
        await repo().update(req.params.id as any, req.body as any);
        const actualizado = await repo().findOneBy({ id: Number(req.params.id) } as any);
        res.json(actualizado);
      } catch (e) {
        console.error(e);
        res.status(400).json({ error: `Error actualizando ${path}` });
      }
    });

    // Borrar
    app.delete(`/${path}/:id`, async (req, res) => {
      try {
        await repo().delete(req.params.id as any);
        res.json({ ok: true });
      } catch (e) {
        console.error(e);
        res.status(400).json({ error: `Error eliminando ${path}` });
      }
    });
  }

  // 5) Registra CRUDs
  crudRoutes('plan-estudio', PlanEstudio);
  crudRoutes('alumno', Alumno);
  crudRoutes('profesor', Profesor);
  crudRoutes('materia', Materia);
  crudRoutes('periodo', Periodo);
  crudRoutes('grupo', Grupo);
  crudRoutes('inscripcion', Inscripcion);
  crudRoutes('kardex', Kardex);
  crudRoutes('calificacion', Calificacion);
  crudRoutes('archivo', ArchivoCargado);
  crudRoutes('validacion', ValidacionResultado);
  crudRoutes('auditoria', AuditoriaCargas);
  crudRoutes('asignacion-profesor', AsignacionProfesor);
  crudRoutes('optativa-progreso', OptativaProgreso);
  crudRoutes('incidencia', Incidencia);
  crudRoutes('sancion', Sancion);

  // 6) Endpoints “útiles” (FUERA de crudRoutes)

  // crear/actualizar alumno


  // Alumno por matrícula
app.get('/alumno/:matricula', async (req,res)=>{
  try { const a = await QAlumno.getByMatricula(ds, req.params.matricula);
    a ? res.json(a) : res.status(404).json({error:'Alumno no encontrado'}); }
  catch(e){ console.error(e); res.status(500).json({error:'Error buscando por matrícula'}); }
});

// Inscripciones de un alumno
app.get('/alumno/:id/inscripciones', async (req,res)=>{
  try { res.json(await QAlumno.getInscripciones(ds, +req.params.id)); }
  catch(e){ console.error(e); res.status(500).json({error:'Error consultando inscripciones'}); }
});

// Kardex de un alumno
app.get('/alumno/:id/kardex', async (req,res)=>{
  try { res.json(await QAlumno.getKardex(ds, +req.params.id)); }
  catch(e){ console.error(e); res.status(500).json({error:'Error consultando kardex'}); }
});

// Materia por código 
app.get('/materia/:codigo', async (req,res)=>{
  try { const m = await QMateria.getByCodigo(ds, req.params.codigo);
    m ? res.json(m) : res.status(404).json({error:'Materia no encontrada'}); }
  catch(e){ console.error(e); res.status(500).json({error:'Error buscando materia'}); }
});

// Periodo por etiqueta
app.get('/periodo/:etiqueta', async (req,res)=>{
  try { const p = await QPeriodo.getByEtiqueta(ds, req.params.etiqueta);
    p ? res.json(p) : res.status(404).json({error:'Periodo no encontrado'}); }
  catch(e){ console.error(e); res.status(500).json({error:'Error buscando periodo'}); }
});

// Oferta de grupos
app.get('/grupo/oferta', async (req,res)=>{
  try { const {periodo, codigo} = req.query as any;
    res.json(await QGrupo.oferta(ds, periodo, codigo)); }
  catch(e){ console.error(e); res.status(500).json({error:'Error listando oferta de grupos'}); }
});

// Horarios por grupo id
app.get('/grupo/:id/horario', async (req,res)=>{
  try { res.json(await QGrupo.horariosByGrupoId(ds, +req.params.id)); }
  catch(e){ console.error(e); res.status(500).json({error:'Error consultando horarios'}); }
});

// Profesores asignados al grupo
app.get('/grupo/:id/profesores', async (req,res)=>{
  try { res.json(await QGrupo.profesoresAsignados(ds, +req.params.id)); }
  catch(e){ console.error(e); res.status(500).json({error:'Error consultando profesores del grupo'}); }
});

// Crear inscripción
app.post('/inscripcion/crear', async (req,res)=>{
  try { const { alumno_id, periodo_etiqueta } = req.body;
    res.status(201).json(await QInscripcion.crear(ds, alumno_id, periodo_etiqueta)); }
  catch(e:any){ console.error(e); res.status(400).json({error: e?.message || 'Error creando inscripción'}); }
});

// Auditoría / Validaciones
app.get('/archivo/:id/validaciones', async (req,res)=>{
  try { res.json(await QArchivo.getValidaciones(ds, +req.params.id)); }
  catch(e){ console.error(e); res.status(500).json({error:'Error consultando validaciones'}); }
});
app.get('/archivo/:id/auditoria', async (req,res)=>{
  try { res.json(await QArchivo.getAuditoria(ds, +req.params.id)); }
  catch(e){ console.error(e); res.status(500).json({error:'Error consultando auditoría'}); }
});
app.get('/archivo/:id/validaciones/por-severidad/:sev', async (req,res)=>{
  try { res.json(await QArchivo.getValidacionesPorSeveridad(ds, +req.params.id, req.params.sev)); }
  catch(e){ console.error(e); res.status(500).json({error:'Error filtrando validaciones'}); }
});

// Plan → materias
app.get('/plan-estudio/:id/materias', async (req,res)=>{
  try { const tipo = (req.query.tipo as any) || undefined;
    res.json(await QPlan.materiasDePlan(ds, +req.params.id, tipo)); }
  catch(e){ console.error(e); res.status(500).json({error:'Error listando materias del plan'}); }
});

// Periodo actual y próximos
app.get('/periodo/actual', async (_req,res)=>{
  try { const p = await QPeriodo.getActual(ds);
    p ? res.json(p) : res.status(404).json({error:'No hay periodo activo hoy'}); }
  catch(e){ console.error(e); res.status(500).json({error:'Error consultando periodo actual'}); }
});
app.get('/periodo/proximos', async (req,res)=>{
  try { const n = Number((req.query.n as string) || 3);
    res.json(await QPeriodo.getProximos(ds, n)); }
  catch(e){ console.error(e); res.status(500).json({error:'Error consultando próximos periodos'}); }
});

// Kardex por periodo etiqueta
app.get('/alumno/:id/kardex/por-periodo/:etiqueta', async (req,res)=>{
  try { res.json(await QAlumno.getKardexPorPeriodoEtiqueta(ds, +req.params.id, req.params.etiqueta)); }
  catch(e){ console.error(e); res.status(500).json({error:'Error filtrando kardex por periodo'}); }
});

// Avance optativas
app.get('/alumno/:id/avance-optativas', async (req,res)=>{
  try { res.json(await QAlumno.avanceOptativas(ds, +req.params.id)); }
  catch(e){ console.error(e); res.status(500).json({error:'Error consultando avance de optativas'}); }
});

// Grupos por materia (opcional periodo)
app.get('/materia/:codigo/grupos', async (req,res)=>{
  try { res.json(await QMateria.gruposPorMateria(ds, req.params.codigo, req.query.periodo as string|undefined)); }
  catch(e){ console.error(e); res.status(500).json({error:'Error listando grupos por materia'}); }
});

// Buscadores
app.get('/alumno/buscar', async (req,res)=>{
  try {
    const q = String(req.query.q || '').trim();
    const p = Math.max(1, Number(req.query.p || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
    const { data, total } = await QAlumno.buscar(ds, q, p, limit);
    res.json({ total, p, limit, data });
  } catch(e){ console.error(e); res.status(500).json({error:'Error buscando alumnos'}); }
});
app.get('/materia/buscar', async (req,res)=>{
  try {
    const q = String(req.query.q || '').trim();
    const tipo = req.query.tipo as any;
    const p = Math.max(1, Number(req.query.p || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
    const { data, total } = await QMateria.buscar(ds, q, tipo, p, limit);
    res.json({ total, p, limit, data });
  } catch(e){ console.error(e); res.status(500).json({error:'Error buscando materias'}); }
});

// Inscripciones por periodo etiqueta
app.get('/alumno/:id/inscripciones/por-periodo/:etiqueta', async (req,res)=>{
  try { res.json(await QInscripcion.porPeriodoEtiqueta(ds, +req.params.id, req.params.etiqueta)); }
  catch(e){ console.error(e); res.status(500).json({error:'Error consultando inscripciones del periodo'}); }
});

// Kardex crear (por *_id)
app.post('/kardex/crear', async (req,res)=>{
  try { res.status(201).json(await QKardex.crearPorIds(ds, req.body)); }
  catch(e:any){ console.error(e); res.status(400).json({error: e?.detail || 'Error creando renglón de kardex'}); }
});

// Profesor → grupos
app.get('/profesor/:id/grupos', async (req,res)=>{
  try { res.json(await QProfesor.gruposPorProfesor(ds, +req.params.id, req.query.periodo as string|undefined)); }
  catch(e){ console.error(e); res.status(500).json({error:'Error listando grupos del profesor'}); }
});

// Grupo por clave → horario
app.get('/grupo/:clave/horario', async (req,res)=>{
  try {
    const rows = await QGrupo.horariosByClave(ds, req.params.clave);
    if (rows === null) return res.status(404).json({error:'Grupo no encontrado'});
    res.json(rows);
  } catch(e){ console.error(e); res.status(500).json({error:'Error consultando horario por clave'}); }
});

// Sanciones buscar (filtros)
app.get('/sancion/buscar', async (req,res)=>{
  try {
    const { alumno_id, profesor_id, desde, hasta } = req.query as any;
    const data = await QSancion.buscar(ds, {
      alumno_id: alumno_id ? +alumno_id : undefined,
      profesor_id: profesor_id ? +profesor_id : undefined,
      desde, hasta
    });
    res.json(data);
  } catch(e){ console.error(e); res.status(500).json({error:'Error consultando sanciones'}); }
});

app.use('/archivo-cargas', archivoCargasRouter);
app.use('/alumno', alumnoRouter);
app.get('/alumno/:id/horario-actual', getHorarioActualAlumno);

  // 7) Levantar server
  const PORT = Number(process.env.PORT || 3000);
  app.listen(PORT, () => console.log(`🚀 Server listo en http://localhost:${PORT}`));
}

bootstrap().catch((e) => {
  console.error('Error al arrancar:', e);
  process.exit(1);
});
