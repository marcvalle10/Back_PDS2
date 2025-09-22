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
exports.Profesor = void 0;
const typeorm_1 = require("typeorm");
const AsignacionProfesor_1 = require("./AsignacionProfesor");
const Incidencia_1 = require("./Incidencia");
const Sancion_1 = require("./Sancion");
let Profesor = class Profesor {
};
exports.Profesor = Profesor;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Profesor.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Profesor.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Profesor.prototype, "apellido_paterno", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], Profesor.prototype, "apellido_materno", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 150 }),
    __metadata("design:type", String)
], Profesor.prototype, "correo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Profesor.prototype, "num_empleado", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => AsignacionProfesor_1.AsignacionProfesor, (ap) => ap.profesor),
    __metadata("design:type", Array)
], Profesor.prototype, "asignaciones", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Incidencia_1.Incidencia, (i) => i.profesor),
    __metadata("design:type", Array)
], Profesor.prototype, "incidencias", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Sancion_1.Sancion, (s) => s.profesor),
    __metadata("design:type", Array)
], Profesor.prototype, "sanciones", void 0);
exports.Profesor = Profesor = __decorate([
    (0, typeorm_1.Entity)('profesor'),
    (0, typeorm_1.Unique)('uq_profesor_num_empleado', ['num_empleado'])
], Profesor);
