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
exports.PlanEstudio = void 0;
const typeorm_1 = require("typeorm");
const Alumno_1 = require("./Alumno");
const Materia_1 = require("./Materia");
let PlanEstudio = class PlanEstudio {
};
exports.PlanEstudio = PlanEstudio;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PlanEstudio.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 150 }),
    __metadata("design:type", String)
], PlanEstudio.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], PlanEstudio.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], PlanEstudio.prototype, "total_creditos", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], PlanEstudio.prototype, "semestres_sugeridos", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Alumno_1.Alumno, (a) => a.planEstudio),
    __metadata("design:type", Array)
], PlanEstudio.prototype, "alumnos", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Materia_1.Materia, (m) => m.planEstudio),
    __metadata("design:type", Array)
], PlanEstudio.prototype, "materias", void 0);
exports.PlanEstudio = PlanEstudio = __decorate([
    (0, typeorm_1.Entity)('plan_estudio')
], PlanEstudio);
