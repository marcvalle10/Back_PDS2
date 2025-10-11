import { spawn } from 'node:child_process';
import path from 'node:path';
import { once } from 'node:events';

export async function parseMateriasWithUserReader(pdfPath: string): Promise<{ cabecera: any; materias: any[]; warnings: string[]; }> {
  const scriptPath = path.resolve(process.cwd(), 'src', 'fileReader', 'main.py');
  const py = process.platform === 'win32' ? ['py', '-3'] : ['python3'];

  const child = spawn(py[0], [...py.slice(1), scriptPath, '--materias', pdfPath], { cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'] });

  let out = '', err = '';
  child.stdout.on('data', b => out += b.toString('utf8'));
  child.stderr.on('data', b => err += b.toString('utf8'));
  const [code] = (await once(child, 'close')) as [number];

  if (code !== 0) throw new Error(`Python materias exited with ${code}. ${err||''}`);

  const data = JSON.parse(out);
  return {
    cabecera: data?.cabecera || {},
    materias: data?.materias || [],
    warnings: data?.warnings || []
  };
}
