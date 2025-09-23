"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validation = void 0;
const Error_1 = require("../utils/Error");
const validation = (schema) => {
    return (req, res, next) => {
        const data = {
            ...req.body,
            ...req.query,
            ...req.params
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
