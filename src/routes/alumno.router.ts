import { Router } from 'express';
import {
  getResumenAlumno,
  getInglesAlumno,
  getElegibilidadAlumno,
  getMallaAlumno
} from '../usecases/alumno.controllers';

const router = Router();

// AR3 – KPIs header
router.get('/:id/resumen', getResumenAlumno);

// AR6 – Nivel de inglés
router.get('/:id/ingles', getInglesAlumno);

// AR7 – Elegibilidad
router.get('/:id/elegibilidad', getElegibilidadAlumno);

// AR4/5 – Malla (tabla/mapa de materias)
router.get('/:id/malla', getMallaAlumno);

export default router;
