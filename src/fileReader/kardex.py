import re

class Kardex:
    def __init__(self, raw_text: str):
        self.raw_text = raw_text
        self.cleaned = self._limpiar_texto(raw_text)
        self.cabecera = self._extraer_cabecera()
        self.materias = self._extraer_materias()
        self.resumen = self._extraer_resumen()

    # ----------------------------
    # Métodos de acceso públicos
    # ----------------------------
    def alumno(self):
        return self.cabecera
    
    def materias(self):
        return self.materias
    
    def resumen(self):
        return self.resumen
    
    # ----------------------------
    # Métodos internos
    # ----------------------------
    def _limpiar_texto(self, texto):
        # Quitar encabezados y pies innecesarios
        patrones_remover = [
            r"Universidad de Sonora.*?KÁRDEX ELECTRÓNICO", 
            r"Pagina \d+ de \d+",
            r"La impresión de esta información no es de carácter oficial",
            r" .. Alumno activo....",
            r"^-+$"
        ]
        for p in patrones_remover:
            texto = re.sub(p, "", texto, flags=re.S | re.M)
        return texto.strip()

    def _extraer_cabecera(self):
        cabecera = {}
        patrones = {
            "fecha": r"Fecha:\s*(.*)",
            "programa": r"PROGRAMA:\s*(.*)",
            "plan": r"PLAN:\s*(\d+)",
            "unidad": r"UNIDAD:\s*(.*)",
            "expediente": r"EXPEDIENTE:\s*(\d+)",
            "alumno": r"EXPEDIENTE:\s*\d+\s+(.*)",
            "estatus": r"ESTATUS:\s*(.*)"
        }
        for key, pat in patrones.items():
            m = re.search(pat, self.cleaned)
            if m:
                cabecera[key] = m.group(1).strip()
        return cabecera

    def _extraer_materias(self):
        materias = []
        pattern = (
            r"(\d{2})\s+"                 # CR
            r"(\d{4})\s+"                 # CVE
            r"([A-ZÁÉÍÓÚÑ0-9 ,.'-]+?)\s+" # Nombre materia
            r"([IA])\s+"                  # E1
            r"([A1])\s+"                  # E2
            r"([0-9A-Z*]{1,3})?\s*"       # ORD (opcional)
            r"(\d{4})\s+"                 # CIC
            r"(\d{2})\s+"                 # I
            r"(\d{2})\s+"                 # R
            r"(\d{2})"                    # B
        )

        for match in re.finditer(pattern, self.cleaned, re.S):
            cr, cve, nombre, e1, e2, ord_, cic, i, r, b = match.groups()
            materias.append({
                "CR": cr,
                "CVE": cve,
                "Materia": nombre.strip(),
                "E1": e1,
                "E2": e2,
                "ORD": ord_ if ord_ else None,  # None si no hay calificación (esta en curso la materia)
                "CIC": cic,
                "I": i,
                "R": r,
                "B": b
            })
        return materias

    def _extraer_resumen(self):
        """
        Extrae la información de la sección de resumen del documento.
        """
        text = self.cleaned
        lines = [l.strip() for l in text.splitlines() if l.strip()]

        # Unir las últimas líneas del documento para capturar el bloque de resumen
        # Esto es más robusto que buscar en cada línea por separado
        # Se busca desde el final porque el resumen está siempre al final del documento
        summary_block = " ".join(lines[-22:])
        
        # Normalizar los asteriscos y los espacios para una búsqueda más consistente
        normalized_block = re.sub(r'\*+', '', summary_block)
        normalized_block = re.sub(r'\s+', ' ', normalized_block)
        normalized_block = re.sub(r'\-------------------+', '', normalized_block)
        #print("Normalized Block:", normalized_block)  # Debugging line
        resumen = {
        "promedios": {},
        "creditos": {},
        "materias": {}
        }
        
        periodoPattern = re.search(r'(\d{4}-\d+)', normalized_block, re.IGNORECASE)
        if periodoPattern:
            (
                periodo
            )= periodoPattern.groups()

        promPeriodoPattern = re.search(r'(\d+\.\d+)', normalized_block, re.IGNORECASE)
        if promPeriodoPattern:
            (
                promedio_periodo
            )= promPeriodoPattern.groups()

        promKardexPattern = re.search(r'(\d+\.\d+) CREDITOS', normalized_block, re.IGNORECASE)
        if promKardexPattern:
            (
                promedio_kardex
            )= promKardexPattern.groups()
        
        aprPattern = re.search(r'APR REP INS (\d+)', normalized_block, re.IGNORECASE)
        if aprPattern:
            (
                creditos_apr
            )= aprPattern.groups()
        
        repPattern = re.search(r'APR REP INS \d+ (\d+)', normalized_block, re.IGNORECASE)
        if repPattern:
            (
                creditos_rep
            )= repPattern.groups()
        
        insPattern = re.search(r'APR REP INS \d+ \d+ (\d+)', normalized_block, re.IGNORECASE)
        if insPattern:
            (
                creditos_ins
            )= insPattern.groups()
        
        aprMatPattern = re.search(r'APR REP NMR INS (\d+)', normalized_block, re.IGNORECASE)
        if aprMatPattern:
            (
                materias_apr
            )= aprMatPattern.groups()
        
        repMatPattern = re.search(r'APR REP NMR INS \d+ (\d+)', normalized_block, re.IGNORECASE)
        if repMatPattern:
            (
                materias_rep
            )= repMatPattern.groups()
        
        nmrMatPattern = re.search(r'APR REP NMR INS \d+ \d+ (\d+)', normalized_block, re.IGNORECASE)
        if nmrMatPattern:
            (
                materias_nmr
            )= nmrMatPattern.groups()
        
        insMatPattern = re.search(r'APR REP NMR INS \d+ \d+ \d+ (\d+)', normalized_block, re.IGNORECASE)
        if insMatPattern:
            (
                materias_ins
            )= insMatPattern.groups()
        

        #resumen["promedios"]["periodo"] = periodo.__getitem__(0)
        resumen["promedios"][periodo.__getitem__(0)] = float(promedio_periodo.__getitem__(0))
        resumen["promedios"]["kardex"] = float(promedio_kardex.__getitem__(0))
        resumen["creditos"]["APR"] = int(creditos_apr.__getitem__(0))
        resumen["creditos"]["REP"] = int(creditos_rep.__getitem__(0))
        resumen["creditos"]["INS"] = int(creditos_ins.__getitem__(0))
        resumen["materias"]["APR"] = int(materias_apr.__getitem__(0))
        resumen["materias"]["REP"] = int(materias_rep.__getitem__(0))
        resumen["materias"]["NMR"] = int(materias_nmr.__getitem__(0))
        resumen["materias"]["INS"] = int(materias_ins.__getitem__(0))
        return resumen