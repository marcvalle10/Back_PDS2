import re

class Materias:
    def __init__(self, raw_text: str):
        self.raw_text = raw_text
        self.cleaned = self._limpiar_texto(raw_text)
        self.cabecera = self._extraer_cabecera()
        self.materias = self._extraer_materias()
        self.acentuaciones = self._extraer_acentuaciones()

    # ----------------------------
    # Métodos de acceso públicos
    # ----------------------------
    def resumen(self):
        return {
            "cabecera":self.cabecera,
            "materias": self.materias,
            "acentuaciones": self.acentuaciones
        }

    # ----------------------------
    # Métodos internos
    # ----------------------------
    def _limpiar_texto(self, texto):
        patrones_remover = [
            r"Universidad de Sonora.*?PLAN DE ESTUDIOS", 
            r"Pagina \d+ de \d+",
            r"La impresión de esta información no es de carácter oficial",
            r"^-+$"
        ]
        for p in patrones_remover:
            texto = re.sub(p, "", texto, flags=re.S | re.M)
        return texto.strip()
    
    def _extraer_cabecera(self):
        cabecera = {}
        patrones = {
            "nivel": r"OPCIÓN:\s*(.*)",
            "programa": r"OPCIÓN:\s*.*\s(.*)",
            "plan": r"OPCIÓN:\s*.*\s.*\s(.*)",
            #"especialidad": r"OPCIÓN:\s*.*\s.*\s.*\s(.*)",
            #"opcion": r"OPCIÓN:\s*.*\s.*\s.*\s.*\s(.*)",
        }
        for key, pat in patrones.items():
            m = re.search(pat, self.cleaned, re.I)
            if m:
                cabecera[key] = m.group(1).strip()
        return cabecera
    
    def _extraer_materias(self):
        materias = []
        pattern = re.compile(
            r'(?P<clave>\d{3,4})\s+'
            r'(?P<nombre>[A-ZÁÉÍÓÚÑ\s,.\-0-9]+?)\s+'
            r'(?P<tipo>OBL|OPT|SEL)\s+'
            r'(?P<creditos>\d+)\s+'
            r'(?P<horas_teoria>\d+)\s+'
            r'(?P<horas_lab>\d+)\s+'
            r'(?P<eje>C|B|P||I|E)\s+'
            r'(?P<creditos_req>\d+)'
            r'(?:\s+Aprobar:\s*(?P<requisitos>\d+))?'
        )

        for match in pattern.finditer(self.cleaned):
            materias.append({
                "clave": match.group("clave"),
                "nombre": match.group("nombre").strip(),    
                "tipo": match.group("tipo"),
                "creditos": int(match.group("creditos")),
                "horas_teoria": int(match.group("horas_teoria")),
                "horas_lab": int(match.group("horas_lab")),
                "eje": match.group("eje") if match.group("eje") else None,
                "creditos_req": int(match.group("creditos_req")),
                "requisitos": match.group("requisitos") if match.group("requisitos") else None
            })
        return materias

    def _extraer_acentuaciones(self):
        acentuaciones = {}
        categoria_actual = None

        # Patron para materias dentro de acentuaciones
        patron_acento = re.compile(
            r'^(?P<clave>\d{3,4})\s+(?P<materia>[A-ZÁÉÍÓÚÑ\s,.\-0-9]+?)\s+(?P<creditos>\d+)$'
        )

        for linea in self.cleaned.splitlines():
            linea = linea.strip()
            if not linea:
                continue

            # Detectar encabezado de acentuación
            if linea.isupper() and not linea[0].isdigit():
                categoria_actual = linea
                acentuaciones[categoria_actual] = []
                continue

            # Materia de acentuación
            if categoria_actual:
                ma = patron_acento.match(linea)
                if ma:
                    acentuaciones[categoria_actual].append({
                        "clave": ma.group("clave"),
                        "nombre": ma.group("nombre").strip(),
                        "creditos": int(ma.group("creditos"))
                    })
        return acentuaciones
