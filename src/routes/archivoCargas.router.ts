import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';

import { postKardexPdf, processKardexArchivo } from '../usecases/archivo-cargas.controller';
import { postMateriasPdf, processMateriasArchivo } from '../usecases/archivo-materias.controller';

const router = Router();

// Guardaremos los PDFs en ./archivos/kardex/<hash>.pdf
const baseDir = path.resolve(process.cwd(), 'archivos', 'kardex');
fs.mkdirSync(baseDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, baseDir),
  filename: (_req, file, cb) => {
    // nombre temporal; el controller renombrará a <hash>.pdf
    cb(null, Date.now() + '-' + file.originalname);
  }
});
// en archivoCargas.router.ts
const upload = multer({ storage, limits: { fileSize: 15 * 1024 * 1024 } });

// aceptar 'file' o 'File', máximo 1
router.post(
  '/kardex/pdf',
  upload.fields([{ name: 'file', maxCount: 1 }, { name: 'File', maxCount: 1 }]),
  (req, res, next) => {
    // normaliza a req.file para reusar el controller
    const f = (req.files as any)?.file?.[0] || (req.files as any)?.File?.[0];
    (req as any).file = f;
    next();
  },
  postKardexPdf(baseDir)
);


router.post('/kardex/process/:archivoId', processKardexArchivo(baseDir));

export default router;


// subir PDF de materias/plan
router.post(
  '/materias/pdf',
  upload.fields([{ name: 'file', maxCount: 1 }, { name: 'File', maxCount: 1 }]),
  (req, _res, next) => {
    const f = (req.files as any)?.file?.[0] || (req.files as any)?.File?.[0];
    (req as any).file = f; next();
  },
  postMateriasPdf(baseDir)
);

// procesar
router.post('/materias/process/:archivoId', processMateriasArchivo(baseDir));