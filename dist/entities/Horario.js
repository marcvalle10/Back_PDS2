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
exports.Horario = void 0;
const typeorm_1 = require("typeorm");
const Grupo_1 = require("./Grupo");
let Horario = class Horario {
};
exports.Horario = Horario;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Horario.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Grupo_1.Grupo, (g) => g.horarios, { nullable: false, onDelete: 'CASCADE' }),
    __metadata("design:type", Grupo_1.Grupo)
], Horario.prototype, "grupo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', comment: '1=Lunes ... 7=Domingo' }),
    __metadata("design:type", Number)
], Horario.prototype, "dia_semana", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time without time zone' }),
    __metadata("design:type", String)
], Horario.prototype, "hora_inicio", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time without time zone' }),
    __metadata("design:type", String)
], Horario.prototype, "hora_fin", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], Horario.prototype, "aula", void 0);
exports.Horario = Horario = __decorate([
    (0, typeorm_1.Entity)('horario'),
    (0, typeorm_1.Unique)('uq_horario_bloque', ['grupo', 'dia_semana', 'hora_inicio', 'hora_fin', 'aula'])
], Horario);
