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
exports.Incidencia = void 0;
const typeorm_1 = require("typeorm");
const Alumno_1 = require("./Alumno");
const Profesor_1 = require("./Profesor");
const Materia_1 = require("./Materia");
const Grupo_1 = require("./Grupo");
let Incidencia = class Incidencia {
};
exports.Incidencia = Incidencia;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Incidencia.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Alumno_1.Alumno, (a) => a.incidencias, { nullable: false }),
    __metadata("design:type", Alumno_1.Alumno)
], Incidencia.prototype, "alumno", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Profesor_1.Profesor, (p) => p.incidencias, { nullable: false }),
    __metadata("design:type", Profesor_1.Profesor)
], Incidencia.prototype, "profesor", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Materia_1.Materia, (m) => m.kardex, { nullable: false }),
    __metadata("design:type", Materia_1.Materia)
], Incidencia.prototype, "materia", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Grupo_1.Grupo, (g) => g.incidencias, { nullable: false }),
    __metadata("design:type", Grupo_1.Grupo)
], Incidencia.prototype, "grupo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], Incidencia.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], Incidencia.prototype, "fecha", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Incidencia.prototype, "descripcion", void 0);
exports.Incidencia = Incidencia = __decorate([
    (0, typeorm_1.Entity)('incidencia')
], Incidencia);
