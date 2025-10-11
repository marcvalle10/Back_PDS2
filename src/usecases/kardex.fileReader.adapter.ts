import { spawn } from 'node:child_process';
import path from 'node:path';
import { once } from 'node:events';

export type KardexRow = {
  materia_codigo: string;   // "08 6890" o "086890"
  materia_nombre: string;
  periodo: string;          // "2232", "2241", etc.
  calificacion: number | null;
  estatus: string;          // "APROBADA" | "REPROBADA" | "ACREDITADA" | ...
};

export type ParseResult = {
  rows: KardexRow[];
  warnings: string[];
  meta: Record<string, any>;
  resumen?: any;
};

// Resuelve el ejecutable de Python (Windows usa "py -3", Linux/Mac "python3")
function resolvePythonCmd(): string[] {
  if (process.platform === 'win32') {
    // Usa "py -3" si está disponible; si prefieres "python", cambia a ['python']
    return ['py', '-3'];
  }
  return ['python3'];
}

/**
 * Llama a tu parser de Python en src/fileReader/main.py
 * El script imprimirá JSON a stdout.
 */
export async function parseKardexWithUserReader(pdfPath: string): Promise<ParseResult> {
  // OJO: usamos process.cwd() para que funcione tanto en dev (ts-node-dev) como en build.
  const scriptPath = path.resolve(process.cwd(), 'src', 'fileReader', 'main.py');
  const py = resolvePythonCmd();

  const child = spawn(py[0], [...py.slice(1), scriptPath, '--kardex', pdfPath], {
    cwd: process.cwd(),
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let out = '';
  let err = '';
  child.stdout.on('data', (b) => (out += b.toString('utf8')));
  child.stderr.on('data', (b) => (err += b.toString('utf8')));

  const [code] = (await once(child, 'close')) as [number];
  if (code !== 0) {
    throw new Error(`Python parser exited with code ${code}. ${err || ''}`);
  }

  let data: any;
  try {
    data = JSON.parse(out);
  } catch (e) {
    throw new Error(`No pude parsear salida JSON del parser. stdout: ${out?.slice(0, 400)}...`);
  }

  // Normalizamos al contrato interno
  const rows: KardexRow[] = (data.materias || []).map((m: any) => ({
    materia_codigo: m.CVE ? `${m.CR} ${m.CVE}` : (m.codigo || m.code || ''),
    materia_nombre: m.Materia || m.nombre || '',
    periodo: m.CIC || m.periodo || '',
    calificacion: (m.ORD && /^\d+$/.test(String(m.ORD))) ? Number(m.ORD) : null,
    estatus: (m.ORD == null)
      ? 'ACREDITADA' // si en tu lógica es “en curso”, cámbialo a 'INSCRITA'
      : (Number(m.ORD) >= 70 ? 'APROBADA' : 'REPROBADA')
  }));

  const meta = {
    expediente: data?.cabecera?.expediente || data?.alumno?.expediente || null,
    plan: data?.cabecera?.plan || null,
    fecha: data?.cabecera?.fecha || null,
    // agrega otros campos si los emites desde Python
  };

  const warnings: string[] = data?.warnings || [];
  const resumen = data?.resumen ?? null;

  return { rows, warnings, meta, resumen};
}
