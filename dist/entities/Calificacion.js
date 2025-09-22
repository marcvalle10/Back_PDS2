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
exports.Calificacion = void 0;
const typeorm_1 = require("typeorm");
const Kardex_1 = require("./Kardex");
const Materia_1 = require("./Materia");
let Calificacion = class Calificacion {
};
exports.Calificacion = Calificacion;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Calificacion.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Kardex_1.Kardex, (k) => k.detalleCalificacion, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'kardex_id' }),
    __metadata("design:type", Kardex_1.Kardex)
], Calificacion.prototype, "kardex", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Materia_1.Materia, (m) => m.calificaciones, { nullable: false }),
    __metadata("design:type", Materia_1.Materia)
], Calificacion.prototype, "materia", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Object)
], Calificacion.prototype, "ordinario", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Object)
], Calificacion.prototype, "extraordinario", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Object)
], Calificacion.prototype, "final", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Object)
], Calificacion.prototype, "fecha_cierre", void 0);
exports.Calificacion = Calificacion = __decorate([
    (0, typeorm_1.Entity)('calificacion')
], Calificacion);
