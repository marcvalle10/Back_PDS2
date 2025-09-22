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
exports.Sancion = void 0;
const typeorm_1 = require("typeorm");
const Alumno_1 = require("./Alumno");
const Profesor_1 = require("./Profesor");
let Sancion = class Sancion {
};
exports.Sancion = Sancion;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Sancion.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Alumno_1.Alumno, (a) => a.sanciones, { nullable: false }),
    __metadata("design:type", Alumno_1.Alumno)
], Sancion.prototype, "alumno", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Profesor_1.Profesor, (p) => p.sanciones, { nullable: false }),
    __metadata("design:type", Profesor_1.Profesor)
], Sancion.prototype, "profesor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Sancion.prototype, "regla", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], Sancion.prototype, "fecha", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Sancion.prototype, "detalle", void 0);
exports.Sancion = Sancion = __decorate([
    (0, typeorm_1.Entity)('sancion')
], Sancion);
