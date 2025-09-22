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
exports.AsignacionProfesor = exports.RolDocente = void 0;
const typeorm_1 = require("typeorm");
const Grupo_1 = require("./Grupo");
const Profesor_1 = require("./Profesor");
var RolDocente;
(function (RolDocente) {
    RolDocente["TITULAR"] = "TITULAR";
    RolDocente["AUXILIAR"] = "AUXILIAR";
    RolDocente["PRACTICAS"] = "PRACTICAS";
})(RolDocente || (exports.RolDocente = RolDocente = {}));
let AsignacionProfesor = class AsignacionProfesor {
};
exports.AsignacionProfesor = AsignacionProfesor;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], AsignacionProfesor.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Grupo_1.Grupo, (g) => g.asignaciones, { nullable: false, onDelete: 'CASCADE' }),
    __metadata("design:type", Grupo_1.Grupo)
], AsignacionProfesor.prototype, "grupo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Profesor_1.Profesor, (p) => p.asignaciones, { nullable: false }),
    __metadata("design:type", Profesor_1.Profesor)
], AsignacionProfesor.prototype, "profesor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: RolDocente, default: RolDocente.TITULAR }),
    __metadata("design:type", String)
], AsignacionProfesor.prototype, "rol_docente", void 0);
exports.AsignacionProfesor = AsignacionProfesor = __decorate([
    (0, typeorm_1.Entity)('asignacion_profesor'),
    (0, typeorm_1.Unique)('uq_asignacion_profesor', ['grupo', 'profesor', 'rol_docente'])
], AsignacionProfesor);
