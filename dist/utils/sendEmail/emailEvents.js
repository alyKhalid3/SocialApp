"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailEmitter = exports.UserEvents = void 0;
const events_1 = __importDefault(require("events"));
const sendEmail_1 = require("./sendEmail");
class UserEvents {
    emitter;
    constructor(emitter) {
        this.emitter = emitter;
    }
    subscripe = (event, cb) => this.emitter.on(event, cb);
    publish = (event, payload) => {
        this.emitter.emit(event, payload);
    };
}
exports.UserEvents = UserEvents;
const emitter = new events_1.default();
exports.emailEmitter = new UserEvents(emitter);
exports.emailEmitter.subscripe('send-email-activation-code', async ({ to, subject, html }) => {
    await (0, sendEmail_1.sendEmail)({ to, subject, html });
});
exports.emailEmitter.subscripe('send-reset-password-code', async ({ to, subject, html }) => {
    await (0, sendEmail_1.sendEmail)({ to, subject, html });
});
