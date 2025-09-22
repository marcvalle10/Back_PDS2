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
exports.Alumno = exports.EstadoAcademico = void 0;
const typeorm_1 = require("typeorm");
const PlanEstudio_1 = require("./PlanEstudio");
const Inscripcion_1 = require("./Inscripcion");
const Kardex_1 = require("./Kardex");
const OptativaProgreso_1 = require("./OptativaProgreso");
const Incidencia_1 = require("./Incidencia");
const Sancion_1 = require("./Sancion");
var EstadoAcademico;
(function (EstadoAcademico) {
    EstadoAcademico["ACTIVO"] = "ACTIVO";
    EstadoAcademico["INACTIVO"] = "INACTIVO";
    EstadoAcademico["BAJA"] = "BAJA";
    EstadoAcademico["EGRESADO"] = "EGRESADO";
})(EstadoAcademico || (exports.EstadoAcademico = EstadoAcademico = {}));
let Alumno = class Alumno {
};
exports.Alumno = Alumno;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Alumno.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], Alumno.prototype, "matricula", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", Object)
], Alumno.prototype, "expediente", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Alumno.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Alumno.prototype, "apellido_paterno", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], Alumno.prototype, "apellido_materno", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 150 }),
    __metadata("design:type", String)
], Alumno.prototype, "correo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: EstadoAcademico, default: EstadoAcademico.ACTIVO }),
    __metadata("design:type", String)
], Alumno.prototype, "estado_academico", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", Object)
], Alumno.prototype, "nivel_ingles_actual", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Alumno.prototype, "total_creditos", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => PlanEstudio_1.PlanEstudio, (p) => p.alumnos, { nullable: false }),
    __metadata("design:type", PlanEstudio_1.PlanEstudio)
], Alumno.prototype, "planEstudio", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Inscripcion_1.Inscripcion, (i) => i.alumno),
    __metadata("design:type", Array)
], Alumno.prototype, "inscripciones", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Kardex_1.Kardex, (k) => k.alumno),
    __metadata("design:type", Array)
], Alumno.prototype, "kardex", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => OptativaProgreso_1.OptativaProgreso, (op) => op.alumno),
    __metadata("design:type", OptativaProgreso_1.OptativaProgreso)
], Alumno.prototype, "optativaProgreso", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Incidencia_1.Incidencia, (i) => i.alumno),
    __metadata("design:type", Array)
], Alumno.prototype, "incidencias", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Sancion_1.Sancion, (s) => s.alumno),
    __metadata("design:type", Array)
], Alumno.prototype, "sanciones", void 0);
exports.Alumno = Alumno = __decorate([
    (0, typeorm_1.Entity)('alumno'),
    (0, typeorm_1.Unique)('uq_alumno_matricula', ['matricula']),
    (0, typeorm_1.Index)('ix_alumno_nombre', ['nombre', 'apellido_paterno', 'apellido_materno'])
], Alumno);
