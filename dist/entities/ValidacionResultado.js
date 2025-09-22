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
exports.ValidacionResultado = exports.Severidad = void 0;
const typeorm_1 = require("typeorm");
const ArchivoCargado_1 = require("./ArchivoCargado");
var Severidad;
(function (Severidad) {
    Severidad["INFO"] = "INFO";
    Severidad["WARNING"] = "WARNING";
    Severidad["ERROR"] = "ERROR";
})(Severidad || (exports.Severidad = Severidad = {}));
let ValidacionResultado = class ValidacionResultado {
};
exports.ValidacionResultado = ValidacionResultado;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ValidacionResultado.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ArchivoCargado_1.ArchivoCargado, (a) => a.validaciones, { nullable: false, onDelete: 'CASCADE' }),
    __metadata("design:type", ArchivoCargado_1.ArchivoCargado)
], ValidacionResultado.prototype, "archivo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: Severidad, default: Severidad.INFO }),
    __metadata("design:type", String)
], ValidacionResultado.prototype, "severidad", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], ValidacionResultado.prototype, "regla_codigo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], ValidacionResultado.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", Object)
], ValidacionResultado.prototype, "fila_origen", void 0);
exports.ValidacionResultado = ValidacionResultado = __decorate([
    (0, typeorm_1.Entity)('validacion_resultado'),
    (0, typeorm_1.Index)('ix_validacion_archivo_severidad', ['archivo', 'severidad'])
], ValidacionResultado);
