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

  // GET /plan-estudio/:id/materias?tipo=OBLIGATORIA|OPTATIVA
app.get('/plan-estudio/:id/materias', async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo } = req.query as { tipo?: 'OBLIGATORIA' | 'OPTATIVA' };

    const qb = R(Materia).createQueryBuilder('m')
      .where('m.plan_estudio_id = :id', { id: +id });

    if (tipo) qb.andWhere('m.tipo = :tipo', { tipo });

    const data = await qb.orderBy('m.codigo', 'ASC').getMany();
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error listando materias del plan' });
  }
});
// GET /periodo/actual
app.get('/periodo/actual', async (_req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const data = await R(Periodo).createQueryBuilder('p')
      .where('p.fecha_inicio <= :hoy', { hoy: today })
      .andWhere('p.fecha_fin >= :hoy', { hoy: today })
      .orderBy('p.anio', 'DESC').addOrderBy('p.ciclo', 'DESC')
      .getOne();
    data ? res.json(data) : res.status(404).json({ error: 'No hay periodo activo hoy' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error consultando periodo actual' });
  }
});

// GET /periodo/proximos?n=3
app.get('/periodo/proximos', async (req, res) => {
  try {
    const n = Number((req.query.n as string) || 3);
    const today = new Date().toISOString().slice(0, 10);
    const data = await R(Periodo).createQueryBuilder('p')
      .where('p.fecha_inicio > :hoy', { hoy: today })
      .orderBy('p.fecha_inicio', 'ASC')
      .limit(n)
      .getMany();
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error consultando próximos periodos' });
  }
});
// GET /alumno/:id/kardex/por-periodo/:etiqueta
app.get('/alumno/:id/kardex/por-periodo/:etiqueta', async (req, res) => {
  try {
    const { id, etiqueta } = req.params;
    const data = await R(Kardex).createQueryBuilder('k')
      .leftJoinAndSelect('k.materia', 'm')
      .leftJoinAndSelect('k.periodo', 'p')
      .where('k.alumno_id = :id', { id: +id })
      .andWhere('p.etiqueta = :et', { et: etiqueta })
      .orderBy('m.codigo', 'ASC')
      .getMany();
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error filtrando kardex por periodo' });
  }
});
// GET /alumno/:id/creditos-por-tipo
app.get('/alumno/:id/creditos-por-tipo', async (req, res) => {
  try {
    const { id } = req.params;

    // Créditos aprobados OBLIGATORIAS
    const obl = await R(Kardex).createQueryBuilder('k')
      .select('COALESCE(SUM(m.creditos),0)', 'sum')
      .leftJoin('k.materia', 'm')
      .where('k.alumno_id = :id', { id: +id })
      .andWhere("k.estatus ILIKE 'ACREDIT%'")
      .andWhere("m.tipo = 'OBLIGATORIA'")
      .getRawOne<{ sum: string }>();

    // Créditos aprobados OPTATIVAS
    const opt = await R(Kardex).createQueryBuilder('k')
      .select('COALESCE(SUM(m.creditos),0)', 'sum')
      .leftJoin('k.materia', 'm')
      .where('k.alumno_id = :id', { id: +id })
      .andWhere("k.estatus ILIKE 'ACREDIT%'")
      .andWhere("m.tipo = 'OPTATIVA'")
      .getRawOne<{ sum: string }>();

    res.json({
      alumno_id: +id,
      obligatorias_aprobadas: Number(obl?.sum ?? 0),
      optativas_aprobadas: Number(opt?.sum ?? 0),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error calculando créditos por tipo' });
  }
});
// GET /alumno/:id/avance-optativas
app.get('/alumno/:id/avance-optativas', async (req, res) => {
  try {
    const { id } = req.params;

    // lo que lleva en optativas (por Kardex)
    const kOpt = await R(Kardex).createQueryBuilder('k')
      .select('COALESCE(SUM(m.creditos),0)', 'sum')
      .leftJoin('k.materia', 'm')
      .where('k.alumno_id = :id', { id: +id })
      .andWhere("k.estatus ILIKE 'ACREDIT%'")
      .andWhere("m.tipo = 'OPTATIVA'")
      .getRawOne<{ sum: string }>();

    // lo que requiere según optativa_progreso (si existe fila)
    const prog = await R(OptativaProgreso).findOne({
      where: { alumno_id: +id } as any,
    });

    res.json({
      alumno_id: +id,
      creditos_optativos_cursados: Number(kOpt?.sum ?? 0),
      creditos_optativos_requeridos: prog?.creditos_optativos_requeridos ?? 0,
      restante: Math.max(0, (prog?.creditos_optativos_requeridos ?? 0) - Number(kOpt?.sum ?? 0)),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error consultando avance de optativas' });
  }
});
// GET /materia/:codigo/grupos?periodo=2025-1
app.get('/materia/:codigo/grupos', async (req, res) => {
  try {
    const { codigo } = req.params;
    const { periodo } = req.query as { periodo?: string };

    const qb = R(Grupo).createQueryBuilder('g')
      .leftJoinAndSelect('g.materia', 'm')
      .leftJoinAndSelect('g.periodo', 'p')
      .where('m.codigo = :codigo', { codigo });

    if (periodo) qb.andWhere('p.etiqueta = :per', { per: periodo });

    const data = await qb.orderBy('g.clave_grupo', 'ASC').getMany();
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error listando grupos por materia' });
  }
});
// GET /alumno/buscar?q=marco&p=1&limit=20
app.get('/alumno/buscar', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    const p = Math.max(1, Number(req.query.p || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
    const qb = R(Alumno).createQueryBuilder('a');

    if (q) {
      qb.where(`(a.nombre ILIKE :q OR a.apellido_paterno ILIKE :q OR a.apellido_materno ILIKE :q OR a.matricula ILIKE :q)`, { q: `%${q}%` });
    }

    qb.orderBy('a.apellido_paterno', 'ASC')
      .addOrderBy('a.apellido_materno', 'ASC')
      .addOrderBy('a.nombre', 'ASC')
      .skip((p - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    res.json({ total, p, limit, data });
  } catch (e) {
    console.error(e); res.status(500).json({ error: 'Error buscando alumnos' });
  }
});
// GET /materia/buscar?q=prog&tipo=OBLIGATORIA&p=1&limit=20
app.get('/materia/buscar', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    const tipo = req.query.tipo as 'OBLIGATORIA'|'OPTATIVA'|undefined;
    const p = Math.max(1, Number(req.query.p || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));

    const qb = R(Materia).createQueryBuilder('m');
    if (q) qb.where('(m.codigo ILIKE :q OR m.nombre ILIKE :q)', { q: `%${q}%` });
    if (tipo) qb.andWhere('m.tipo = :t', { t: tipo });

    qb.orderBy('m.codigo', 'ASC').skip((p - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    res.json({ total, p, limit, data });
  } catch (e) {
    console.error(e); res.status(500).json({ error: 'Error buscando materias' });
  }
});
// GET /alumno/:id/inscripciones/por-periodo/:etiqueta
app.get('/alumno/:id/inscripciones/por-periodo/:etiqueta', async (req, res) => {
  try {
    const { id, etiqueta } = req.params;
    const data = await R(Inscripcion).createQueryBuilder('i')
      .leftJoinAndSelect('i.periodo', 'p')
      .where('i.alumno_id = :id', { id: +id })
      .andWhere('p.etiqueta = :et', { et: etiqueta })
      .getMany();
    res.json(data);
  } catch (e) {
    console.error(e); res.status(500).json({ error: 'Error consultando inscripciones del periodo' });
  }
});
// POST /kardex/crear  { alumno_id, materia_id, periodo_id, estatus, calificacion? }
app.post('/kardex/crear', async (req, res) => {
  try {
    const { alumno_id, materia_id, periodo_id, estatus, calificacion } = req.body as {
      alumno_id: number; materia_id: number; periodo_id: number; estatus: string; calificacion?: number;
    };

    const k = R(Kardex).create({
      alumno_id, materia_id, periodo_id,
      estatus,
      calificacion: calificacion ?? null,
    } as any);
    const saved = await R(Kardex).save(k);
    res.status(201).json(saved);
  } catch (e:any) {
    console.error(e); res.status(400).json({ error: e?.detail || 'Error creando renglón de kardex' });
  }
});
// GET /alumno/:id/kardex/materia/:materiaId
app.get('/alumno/:id/kardex/materia/:materiaId', async (req, res) => {
  try {
    const { id, materiaId } = req.params;
    const data = await R(Kardex).createQueryBuilder('k')
      .leftJoinAndSelect('k.materia', 'm')
      .leftJoinAndSelect('k.periodo', 'p')
      .where('k.alumno_id = :id', { id: +id })
      .andWhere('k.materia_id = :m', { m: +materiaId })
      .orderBy('p.anio', 'DESC').addOrderBy('p.ciclo', 'DESC')
      .getMany();
    res.json(data);
  } catch (e) {
    console.error(e); res.status(500).json({ error: 'Error consultando historial de materia' });
  }
});
// GET /profesor/by-num/:num_empleado
app.get('/profesor/by-num/:num_empleado', async (req, res) => {
  try {
    const pr = await R(Profesor).findOne({ where: { num_empleado: +req.params.num_empleado } as any });
    pr ? res.json(pr) : res.status(404).json({ error: 'Profesor no encontrado' });
  } catch (e) {
    console.error(e); res.status(500).json({ error: 'Error buscando profesor' });
  }
});

// GET /profesor/:id/grupos?periodo=2025-1
app.get('/profesor/:id/grupos', async (req, res) => {
  try {
    const { id } = req.params;
    const { periodo } = req.query as { periodo?: string };
    const qb = R(AsignacionProfesor).createQueryBuilder('ap')
      .leftJoinAndSelect('ap.grupo', 'g')
      .leftJoinAndSelect('g.materia', 'm')
      .leftJoinAndSelect('g.periodo', 'p')
      .where('ap.profesor_id = :id', { id: +id });

    if (periodo) qb.andWhere('p.etiqueta = :per', { per: periodo });

    const data = await qb.orderBy('m.codigo', 'ASC').getMany();
    res.json(data);
  } catch (e) {
    console.error(e); res.status(500).json({ error: 'Error listando grupos del profesor' });
  }
});
// GET /grupo/by-clave/:clave/horario
app.get('/grupo/by-clave/:clave/horario', async (req, res) => {
  try {
    const g = await R(Grupo).findOne({ where: { clave_grupo: req.params.clave } as any });
    if (!g) return res.status(404).json({ error: 'Grupo no encontrado' });
    const data = await R(Horario).find({ where: { grupo_id: (g as any).id } as any });
    res.json(data);
  } catch (e) {
    console.error(e); res.status(500).json({ error: 'Error consultando horario por clave' });
  }
});
// GET /archivo/:id/validaciones/por-severidad/:sev  (sev=INFO|WARNING|ERROR)
app.get('/archivo/:id/validaciones/por-severidad/:sev', async (req, res) => {
  try {
    const { id, sev } = req.params;
    const v = await R(ValidacionResultado).find({
      where: { archivo_id: +id, severidad: sev as any } as any,
    });
    res.json(v);
  } catch (e) {
    console.error(e); res.status(500).json({ error: 'Error filtrando validaciones' });
  }
});
// GET /sancion/buscar?alumno_id=1&profesor_id=2&desde=2025-01-01&hasta=2025-12-31
app.get('/sancion/buscar', async (req, res) => {
  try {
    const { alumno_id, profesor_id, desde, hasta } = req.query as any;
    const qb = R(Sancion).createQueryBuilder('s');
    if (alumno_id) qb.andWhere('s.alumno_id = :a', { a: +alumno_id });
    if (profesor_id) qb.andWhere('s.profesor_id = :p', { p: +profesor_id });
    if (desde) qb.andWhere('s.fecha >= :d', { d: desde });
    if (hasta) qb.andWhere('s.fecha <= :h', { h: hasta });
    const data = await qb.orderBy('s.fecha', 'DESC').getMany();
    res.json(data);
  } catch (e) {
    console.error(e); res.status(500).json({ error: 'Error consultando sanciones' });
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
