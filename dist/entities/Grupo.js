"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Grupo = void 0;
const typeorm_1 = require("typeorm");
const Materia_1 = require("./Materia");
const Periodo_1 = require("./Periodo");
const Horario_1 = require("./Horario");
const AsignacionProfesor_1 = require("./AsignacionProfesor");
const Incidencia_1 = require("./Incidencia");
let Grupo = class Grupo {
};
exports.Grupo = Grupo;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Grupo.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Materia_1.Materia, (m) => m.grupos, { nullable: false }),
    __metadata("design:type", Materia_1.Materia)
], Grupo.prototype, "materia", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Periodo_1.Periodo, (p) => p.grupos, { nullable: false }),
    __metadata("design:type", Periodo_1.Periodo)
], Grupo.prototype, "periodo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 30 }),
    __metadata("design:type", String)
], Grupo.prototype, "clave_grupo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Grupo.prototype, "cupo", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Horario_1.Horario, (h) => h.grupo),
    __metadata("design:type", Array)
], Grupo.prototype, "horarios", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => AsignacionProfesor_1.AsignacionProfesor, (ap) => ap.grupo),
    __metadata("design:type", Array)
], Grupo.prototype, "asignaciones", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Incidencia_1.Incidencia, (i) => i.grupo),
    __metadata("design:type", Array)
], Grupo.prototype, "incidencias", void 0);
exports.Grupo = Grupo = __decorate([
    (0, typeorm_1.Entity)('grupo'),
    (0, typeorm_1.Unique)('uq_grupo_periodo_materia_clave', ['materia', 'periodo', 'clave_grupo'])
], Grupo);
