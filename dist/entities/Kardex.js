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
exports.Kardex = void 0;
const typeorm_1 = require("typeorm");
const Alumno_1 = require("./Alumno");
const Materia_1 = require("./Materia");
const Periodo_1 = require("./Periodo");
const Calificacion_1 = require("./Calificacion");
let Kardex = class Kardex {
};
exports.Kardex = Kardex;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Kardex.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Alumno_1.Alumno, (a) => a.kardex, { nullable: false }),
    __metadata("design:type", Alumno_1.Alumno)
], Kardex.prototype, "alumno", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Materia_1.Materia, (m) => m.kardex, { nullable: false }),
    __metadata("design:type", Materia_1.Materia)
], Kardex.prototype, "materia", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Periodo_1.Periodo, (p) => p.kardex, { nullable: false }),
    __metadata("design:type", Periodo_1.Periodo)
], Kardex.prototype, "periodo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Object)
], Kardex.prototype, "calificacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 30 }),
    __metadata("design:type", String)
], Kardex.prototype, "estatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Kardex.prototype, "promedio_kardex", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Kardex.prototype, "promedio_sem_act", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Calificacion_1.Calificacion, (c) => c.kardex),
    __metadata("design:type", Calificacion_1.Calificacion)
], Kardex.prototype, "detalleCalificacion", void 0);
exports.Kardex = Kardex = __decorate([
    (0, typeorm_1.Entity)('kardex'),
    (0, typeorm_1.Unique)('uq_kardex_alumno_materia_periodo', ['alumno', 'materia', 'periodo'])
], Kardex);
