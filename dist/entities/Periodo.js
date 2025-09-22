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
exports.Periodo = void 0;
const typeorm_1 = require("typeorm");
const Grupo_1 = require("./Grupo");
const Inscripcion_1 = require("./Inscripcion");
const Kardex_1 = require("./Kardex");
let Periodo = class Periodo {
};
exports.Periodo = Periodo;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Periodo.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Periodo.prototype, "anio", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', comment: '1=Ene-Jun, 2=Ago-Dic, o similar' }),
    __metadata("design:type", Number)
], Periodo.prototype, "ciclo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], Periodo.prototype, "etiqueta", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], Periodo.prototype, "fecha_inicio", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], Periodo.prototype, "fecha_fin", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Grupo_1.Grupo, (g) => g.periodo),
    __metadata("design:type", Array)
], Periodo.prototype, "grupos", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Inscripcion_1.Inscripcion, (i) => i.periodo),
    __metadata("design:type", Array)
], Periodo.prototype, "inscripciones", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Kardex_1.Kardex, (k) => k.periodo),
    __metadata("design:type", Array)
], Periodo.prototype, "kardex", void 0);
exports.Periodo = Periodo = __decorate([
    (0, typeorm_1.Entity)('periodo'),
    (0, typeorm_1.Unique)('uq_periodo_etiqueta', ['etiqueta'])
], Periodo);
