"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.successHandler = void 0;
const successHandler = ({ res, data = {}, message = 'done', status = 200 }) => {
    return res.status(200).json({ data, msg: message });
};
exports.successHandler = successHandler;
