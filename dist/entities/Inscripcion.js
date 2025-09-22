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
exports.Inscripcion = exports.EstatusInscripcion = void 0;
const typeorm_1 = require("typeorm");
const Alumno_1 = require("./Alumno");
const Periodo_1 = require("./Periodo");
var EstatusInscripcion;
(function (EstatusInscripcion) {
    EstatusInscripcion["INSCRITO"] = "INSCRITO";
    EstatusInscripcion["BAJA"] = "BAJA";
    EstatusInscripcion["PENDIENTE"] = "PENDIENTE";
})(EstatusInscripcion || (exports.EstatusInscripcion = EstatusInscripcion = {}));
let Inscripcion = class Inscripcion {
};
exports.Inscripcion = Inscripcion;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Inscripcion.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Alumno_1.Alumno, (a) => a.inscripciones, { nullable: false }),
    __metadata("design:type", Alumno_1.Alumno)
], Inscripcion.prototype, "alumno", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Periodo_1.Periodo, (p) => p.inscripciones, { nullable: false }),
    __metadata("design:type", Periodo_1.Periodo)
], Inscripcion.prototype, "periodo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: EstatusInscripcion, default: EstatusInscripcion.INSCRITO }),
    __metadata("design:type", String)
], Inscripcion.prototype, "estatus", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], Inscripcion.prototype, "fecha_alta", void 0);
exports.Inscripcion = Inscripcion = __decorate([
    (0, typeorm_1.Entity)('inscripcion'),
    (0, typeorm_1.Unique)('uq_inscripcion_alumno_periodo', ['alumno', 'periodo'])
], Inscripcion);
