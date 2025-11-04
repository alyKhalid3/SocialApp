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
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config({
    path: path_1.default.resolve('./src/config/.env')
});
const routes_1 = __importDefault(require("./routes"));
const db_connection_1 = require("./DB/db.connection");
const graphql_1 = require("graphql");
const express_2 = require("graphql-http/lib/use/express");
const gateway_1 = require("./modules/gateway/gateway");
const bootstrap = () => {
    const port = process.env.PORT;
    (0, db_connection_1.connectDB)();
    app.use((0, cors_1.default)());
    app.get("uploads/:id", express_1.default.static(path_1.default.resolve('./src/uploads')));
    app.use(express_1.default.json());
    app.use('/api/v1', routes_1.default);
    app.use((err, req, res, next) => {
        return res.status(err.statusCode || 500).json({
            errMsg: err.message,
            cause: err.statusCode || 500,
            stack: err.stack
        });
    });
    const schema = new graphql_1.GraphQLSchema({
        query: new graphql_1.GraphQLObjectType({
            name: 'Query',
            fields: {
                hello: {
                    type: graphql_1.GraphQLString,
                    resolve: () => 'hello world',
                },
            },
        })
    });
    app.all('/graphql', (0, express_2.createHandler)({ schema }));
    const httpServer = app.listen(port, () => {
        console.log(`app listening on port ${port}`);
    });
    (0, gateway_1.initialize)(httpServer);
};
exports.bootstrap = bootstrap;
