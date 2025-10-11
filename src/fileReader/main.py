# src/fileReader/main.py
# CLI para leer PDFs (kárdex, materias, plan) y devolver JSON por stdout.
# Lo usa Node/TS mediante un spawn (adapter). Requiere PyMuPDF (fitz).

import sys
import json
import argparse
import fitz  # PyMuPDF
import kardex as kx         # tus módulos en el mismo directorio
import materias as mx
import plan as px

def leer_texto(path: str) -> str:
    doc = fitz.open(path)
    texto = ""
    for page in doc:
        texto += page.get_text("text") + "\n"
    return texto

def run_kardex(path: str) -> None:
    """
    Procesa un PDF de kárdex y emite JSON con:
    {
      "cabecera": {...},
      "materias": [...],
      "resumen": {...?},
      "warnings": [...]
    }
    """
    texto = leer_texto(path)
    k = kx.Kardex(texto)

    out = {
        "cabecera": getattr(k, "cabecera", {}),
        "materias": getattr(k, "materias", []),
        "resumen": getattr(k, "resumen", {}),
        "warnings": []
    }

    if not out["materias"]:
        out["warnings"].append("No se detectaron materias en el documento.")
    if "expediente" not in out["cabecera"]:
        out["warnings"].append("No se detectó EXPEDIENTE en cabecera.")

    print(json.dumps(out, ensure_ascii=False))

def run_materias(path: str) -> None:
    """
    Procesa un PDF del listado de materias (por si lo quieres usar después).
    """
    texto = leer_texto(path)
    m = mx.Materias(texto)
    out = {
        "cabecera": getattr(m, "cabecera", {}),
        "materias": getattr(m, "materias", []),
        "warnings": []
    }
    print(json.dumps(out, ensure_ascii=False))

def run_plan(path: str) -> None:
    """
    Procesa un PDF del plan (por si lo quieres usar después).
    """
    texto = leer_texto(path)
    # Si px.Plan ya arma algo, descomenta y adapta:
    # p = px.Plan(texto)
    out = {
        "cabecera": {},
        "contenido": texto[:2000],  # placeholder (evitar salida enorme)
        "warnings": ["Parser de plan no implementado aún"]
    }
    print(json.dumps(out, ensure_ascii=False))

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Lector de PDFs (Kárdex/Materias/Plan) → JSON")
    parser.add_argument("--kardex", type=str, help="Ruta del PDF de kárdex")
    parser.add_argument("--materias", type=str, help="Ruta del PDF de listado de materias")
    parser.add_argument("--plan", type=str, help="Ruta del PDF del plan")
    args = parser.parse_args()

    try:
        if args.kardex:
            run_kardex(args.kardex)
            sys.exit(0)
        if args.materias:
            run_materias(args.materias)
            sys.exit(0)
        if args.plan:
            run_plan(args.plan)
            sys.exit(0)

        print("Uso: python main.py --kardex <ruta_pdf> | --materias <ruta_pdf> | --plan <ruta_pdf>", file=sys.stderr)
        sys.exit(2)
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)

    sys.exit(0)
# Fin de src/fileReader/main.py