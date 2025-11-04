"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = exports.connectedSockets = void 0;
const socket_io_1 = require("socket.io");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const chat_gateway_1 = require("../chatModule/chat.gateway");
exports.connectedSockets = new Map();
const connect = (socket) => {
    const currentSockets = exports.connectedSockets.get(socket.user?._id.toString()) || [];
    currentSockets.push(socket.id);
    exports.connectedSockets.set(socket.user?._id.toString(), currentSockets);
};
const disconnect = (socket) => {
    socket.on('disconnect', () => {
        let currentSockets = exports.connectedSockets.get(socket.user?._id.toString()) || [];
        currentSockets = currentSockets.filter(id => {
            return id !== socket.id;
        });
        exports.connectedSockets.set(socket.user?._id.toString(), currentSockets);
    });
};
const initialize = (httpServer) => {
    const chatGateway = new chat_gateway_1.ChatGateway();
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: "*",
        }
    });
    io.use(async (socket, next) => {
        try {
            const data = await (0, auth_middleware_1.decodeToken)({ authorization: socket.handshake.auth.authorization, tokenType: auth_middleware_1.tokenTypeEnum.access });
            socket.user = data.user;
            next();
        }
        catch (error) {
            console.log(error);
        }
    });
    io.on('connection', (socket) => {
        chatGateway.register(socket);
        connect(socket);
        disconnect(socket);
    });
};
exports.initialize = initialize;
