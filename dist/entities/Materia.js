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
exports.Materia = exports.TipoMateria = void 0;
const typeorm_1 = require("typeorm");
const PlanEstudio_1 = require("./PlanEstudio");
const Grupo_1 = require("./Grupo");
const Kardex_1 = require("./Kardex");
const Calificacion_1 = require("./Calificacion");
var TipoMateria;
(function (TipoMateria) {
    TipoMateria["OBLIGATORIA"] = "OBLIGATORIA";
    TipoMateria["OPTATIVA"] = "OPTATIVA";
})(TipoMateria || (exports.TipoMateria = TipoMateria = {}));
let Materia = class Materia {
};
exports.Materia = Materia;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Materia.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], Materia.prototype, "codigo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 150 }),
    __metadata("design:type", String)
], Materia.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Materia.prototype, "creditos", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: TipoMateria, default: TipoMateria.OBLIGATORIA }),
    __metadata("design:type", String)
], Materia.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => PlanEstudio_1.PlanEstudio, (p) => p.materias, { nullable: false }),
    __metadata("design:type", PlanEstudio_1.PlanEstudio)
], Materia.prototype, "planEstudio", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Grupo_1.Grupo, (g) => g.materia),
    __metadata("design:type", Array)
], Materia.prototype, "grupos", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Kardex_1.Kardex, (k) => k.materia),
    __metadata("design:type", Array)
], Materia.prototype, "kardex", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Calificacion_1.Calificacion, (c) => c.materia),
    __metadata("design:type", Array)
], Materia.prototype, "calificaciones", void 0);
exports.Materia = Materia = __decorate([
    (0, typeorm_1.Entity)('materia'),
    (0, typeorm_1.Unique)('uq_materia_codigo', ['codigo'])
], Materia);
