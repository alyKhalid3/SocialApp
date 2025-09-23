"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrap = void 0;
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({
    path: path_1.default.resolve('./src/config/.env')
});
const routes_1 = __importDefault(require("./routes"));
const db_connection_1 = require("./DB/db.connection");
const bootstrap = () => {
    const port = process.env.PORT;
    (0, db_connection_1.connectDB)();
    app.use(express_1.default.json());
    app.use('/api/v1', routes_1.default);
    app.use((err, req, res, next) => {
        return res.status(err.statusCode || 500).json({
            errMsg: err.message,
            cause: err.statusCode || 500,
            stack: err.stack
        });
    });
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`);
    });
};
exports.bootstrap = bootstrap;
