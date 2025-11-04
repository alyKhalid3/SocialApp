"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketValidation = exports.validation = void 0;
const Error_1 = require("../utils/Error");
const validation = (schema) => {
    return (req, res, next) => {
        const data = {
            ...req.body,
            ...req.query,
            ...req.params,
            files: req.files,
            ...req.file
        };
        const result = schema.safeParse(data);
        if (!result.success) {
            const errors = result.error.issues.map((error) => {
                return `${error.path}=>${error.message}`;
            });
            throw new Error_1.ValidationError(errors.join(','));
        }
        next();
    };
};
exports.validation = validation;
const socketValidation = (schema, handler) => {
    return async (socket, data) => {
        const result = schema.safeParse(data);
        if (!result.success) {
            const errors = result.error.issues.map((err) => `${err.path.join(".")} => ${err.message}`);
            socket.emit("customError", {
                type: "validation",
                errors,
            });
            return;
        }
        await handler(socket, result.data);
    };
};
exports.socketValidation = socketValidation;
