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
exports.ArchivoCargado = void 0;
const typeorm_1 = require("typeorm");
const ValidacionResultado_1 = require("./ValidacionResultado");
const AuditoriaCargas_1 = require("./AuditoriaCargas");
let ArchivoCargado = class ArchivoCargado {
};
exports.ArchivoCargado = ArchivoCargado;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ArchivoCargado.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], ArchivoCargado.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], ArchivoCargado.prototype, "nombre_archivo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 128 }),
    __metadata("design:type", String)
], ArchivoCargado.prototype, "hash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], ArchivoCargado.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], ArchivoCargado.prototype, "fecha", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: 'PENDIENTE' }),
    __metadata("design:type", String)
], ArchivoCargado.prototype, "estado_proceso", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ValidacionResultado_1.ValidacionResultado, (v) => v.archivo),
    __metadata("design:type", Array)
], ArchivoCargado.prototype, "validaciones", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => AuditoriaCargas_1.AuditoriaCargas, (a) => a.archivo),
    __metadata("design:type", Array)
], ArchivoCargado.prototype, "auditorias", void 0);
exports.ArchivoCargado = ArchivoCargado = __decorate([
    (0, typeorm_1.Entity)('archivo_cargado'),
    (0, typeorm_1.Index)('ix_archivo_tipo_fecha', ['tipo', 'fecha'])
], ArchivoCargado);
