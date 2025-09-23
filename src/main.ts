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

  // Alumno por matrícula
  app.get('/alumno/by-matricula/:matricula', async (req, res) => {
    try {
      const a = await R(Alumno).findOne({ where: { matricula: req.params.matricula } as any });
      a ? res.json(a) : res.status(404).json({ error: 'Alumno no encontrado' });
    } catch (e) {
      console.error(e); res.status(500).json({ error: 'Error buscando por matrícula' });
    }
  });

  // Inscripciones de un alumno
  app.get('/alumno/:id/inscripciones', async (req, res) => {
    try {
      const data = await R(Inscripcion).createQueryBuilder('i')
        .leftJoinAndSelect('i.periodo', 'p')
        .where('i.alumno_id = :id', { id: +req.params.id })
        .orderBy('p.anio', 'DESC')
        .addOrderBy('p.ciclo', 'DESC')
        .getMany();
      res.json(data);
    } catch (e) {
      console.error(e); res.status(500).json({ error: 'Error consultando inscripciones' });
    }
  });

  // Kardex de un alumno
  app.get('/alumno/:id/kardex', async (req, res) => {
    try {
      const data = await R(Kardex).createQueryBuilder('k')
        .leftJoinAndSelect('k.materia', 'm')
        .leftJoinAndSelect('k.periodo', 'p')
        .where('k.alumno_id = :id', { id: +req.params.id })
        .orderBy('p.anio', 'DESC')
        .addOrderBy('p.ciclo', 'DESC')
        .getMany();
      res.json(data);
    } catch (e) {
      console.error(e); res.status(500).json({ error: 'Error consultando kardex' });
    }
  });

  // Avance del alumno (créditos + promedio)
  app.get('/alumno/:id/avance', async (req, res) => {
    try {
      const { id } = req.params;
      const row1 = await R(Kardex).createQueryBuilder('k')
        .select('COALESCE(SUM(m.creditos),0)', 'sum')
        .leftJoin('k.materia', 'm')
        .where('k.alumno_id = :id', { id: +id })
        .andWhere("k.estatus ILIKE 'ACREDIT%'")
        .getRawOne<{ sum: string }>();

      const row2 = await R(Kardex).createQueryBuilder('k')
        .select('ROUND(AVG(k.calificacion)::numeric,2)', 'prom')
        .where('k.alumno_id = :id', { id: +id })
        .andWhere('k.calificacion IS NOT NULL')
        .getRawOne<{ prom: string }>();

      const creditos = Number(row1?.sum ?? 0);
      const promedio = row2?.prom != null ? Number(row2.prom) : null;

      res.json({ alumno_id: +id, creditos_aprobados: creditos, promedio });
    } catch (e) {
      console.error(e); res.status(500).json({ error: 'Error calculando avance' });
    }
  });

  // Materia por código
  app.get('/materia/by-codigo/:codigo', async (req, res) => {
    try {
      const m = await R(Materia).findOne({ where: { codigo: req.params.codigo } as any });
      m ? res.json(m) : res.status(404).json({ error: 'Materia no encontrada' });
    } catch (e) {
      console.error(e); res.status(500).json({ error: 'Error buscando materia' });
    }
  });

  // Periodo por etiqueta
  app.get('/periodo/by-etiqueta/:etiqueta', async (req, res) => {
    try {
      const p = await R(Periodo).findOne({ where: { etiqueta: req.params.etiqueta } as any });
      p ? res.json(p) : res.status(404).json({ error: 'Periodo no encontrado' });
    } catch (e) {
      console.error(e); res.status(500).json({ error: 'Error buscando periodo' });
    }
  });

  // Oferta de grupos (filtros periodo, código)
  app.get('/grupo/oferta', async (req, res) => {
    try {
      const { periodo, codigo } = req.query as { periodo?: string; codigo?: string };
      const qb = R(Grupo).createQueryBuilder('g')
        .leftJoinAndSelect('g.materia', 'm')
        .leftJoinAndSelect('g.periodo', 'p');

      if (periodo) qb.andWhere('p.etiqueta = :per', { per: periodo });
      if (codigo) qb.andWhere('m.codigo = :cod', { cod: codigo });

      const data = await qb.orderBy('m.codigo', 'ASC').getMany();
      res.json(data);
    } catch (e) {
      console.error(e); res.status(500).json({ error: 'Error listando oferta de grupos' });
    }
  });

  // Horarios por grupo id
  app.get('/grupo/:id/horario', async (req, res) => {
    try {
      const data = await R(Horario).find({ where: { grupo_id: +req.params.id } as any });
      res.json(data);
    } catch (e) {
      console.error(e); res.status(500).json({ error: 'Error consultando horarios' });
    }
  });

  // Profesores asignados al grupo
  app.get('/grupo/:id/profesores', async (req, res) => {
    try {
      const data = await R(AsignacionProfesor).createQueryBuilder('ap')
        .leftJoinAndSelect('ap.profesor', 'pr')
        .where('ap.grupo_id = :id', { id: +req.params.id })
        .getMany();
      res.json(data);
    } catch (e) {
      console.error(e); res.status(500).json({ error: 'Error consultando profesores del grupo' });
    }
  });

  // Crear inscripción (alumno + periodo por etiqueta)
  app.post('/inscripcion/crear', async (req, res) => {
    try {
      const { alumno_id, periodo_etiqueta } = req.body as { alumno_id: number; periodo_etiqueta: string };
      const periodo = await R(Periodo).findOne({ where: { etiqueta: periodo_etiqueta } as any });
      if (!periodo) return res.status(404).json({ error: 'Periodo no existe' });

      const ins = R(Inscripcion).create({
        alumno_id,
        periodo_id: (periodo as any).id,
        estatus: 'INSCRITO',
      } as any);
      const saved = await R(Inscripcion).save(ins);
      res.status(201).json(saved);
    } catch (e: any) {
      console.error(e);
      res.status(400).json({ error: e?.detail || 'Error creando inscripción' });
    }
  });

  // Calificar kardex
  app.post('/kardex/:kardexId/calificar', async (req, res) => {
  try {
    const { ordinario, extraordinario, final } = req.body as {
      ordinario?: number; extraordinario?: number; final?: number;
    };

    // 1) Trae el kardex con su materia (porque Calificacion requiere materia)
    const k = await R(Kardex).findOne({
      where: { id: +req.params.kardexId } as any,
      relations: { materia: true }, // 👈 importante
    });
    if (!k) return res.status(404).json({ error: 'Kardex no encontrado' });

    const repoCal = R(Calificacion);

    // 2) Intenta encontrar calificación existente por relación kardex
    let c = await repoCal.findOne({
      where: { kardex: { id: k.id } } as any,
      relations: { kardex: true, materia: true },
    });

    // Helper para respetar tipos string|null en la entity
    const toStr = (v?: number) => (v === undefined || v === null ? null : String(v));

    if (!c) {
      // 3) Crear nueva calificación usando RELACIONES, no *_id
      const payload: DeepPartial<Calificacion> = {
        kardex: { id: k.id } as any,             // usa relación 1:1 con kardex
        materia: { id: k.materia.id } as any,    // usa relación many-to-one con materia
        ordinario: toStr(ordinario),
        extraordinario: toStr(extraordinario),
        final: toStr(final),
        fecha_cierre: new Date() as any,         // la columna es 'date'
      };
      c = repoCal.create(payload);
    } else {
      // 4) Actualizar valores si vienen en el body
      if (ordinario !== undefined) (c as any).ordinario = String(ordinario);
      if (extraordinario !== undefined) (c as any).extraordinario = String(extraordinario);
      if (final !== undefined) (c as any).final = String(final);
      (c as any).fecha_cierre = new Date();
    }

    const saved = await repoCal.save(c as DeepPartial<Calificacion>);
    res.json(saved);
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: 'Error registrando calificación' });
  }
});

  // Validaciones por archivo
  app.get('/archivo/:id/validaciones', async (req, res) => {
    try {
      const v = await R(ValidacionResultado).find({ where: { archivo_id: +req.params.id } as any });
      res.json(v);
    } catch (e) {
      console.error(e); res.status(500).json({ error: 'Error consultando validaciones' });
    }
  });

  // Auditoría por archivo
  app.get('/archivo/:id/auditoria', async (req, res) => {
    try {
      const v = await R(AuditoriaCargas).find({
        where: { archivo_id: +req.params.id } as any,
        order: { timestamp: 'ASC' } as any,
      });
      res.json(v);
    } catch (e) {
      console.error(e); res.status(500).json({ error: 'Error consultando auditoría' });
    }
  });

  // 7) Levantar server
  const PORT = Number(process.env.PORT || 3000);
  app.listen(PORT, () => console.log(`🚀 Server listo en http://localhost:${PORT}`));
}

bootstrap().catch((e) => {
  console.error('Error al arrancar:', e);
  process.exit(1);
});
