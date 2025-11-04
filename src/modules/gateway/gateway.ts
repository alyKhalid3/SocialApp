import { Server, Socket } from "socket.io";

import { Server as httpServer } from "http";
import { HydratedDocument } from "mongoose";
import { IUser } from "../../DB/models/user.model";
import { decodeToken, tokenTypeEnum } from "../../middleware/auth.middleware";
import { ChatGateway } from "../chatModule/chat.gateway";
export interface AuthenticatedSocket extends Socket {
    user?: HydratedDocument<IUser>;
}
export const connectedSockets = new Map<string, string[]>()
const connect = (socket: AuthenticatedSocket) => {

    const currentSockets = connectedSockets.get(socket.user?._id.toString() as string) || []
    currentSockets.push(socket.id)
    connectedSockets.set(socket.user?._id.toString() as string, currentSockets)
    
}
const disconnect = (socket: AuthenticatedSocket) => {
    socket.on('disconnect', () => {
        let currentSockets = connectedSockets.get(socket.user?._id.toString() as string) || []
        currentSockets = currentSockets.filter(id => {
            return id !== socket.id
        })
        connectedSockets.set(socket.user?._id.toString() as string, currentSockets)


    })
}

export const initialize = (httpServer: httpServer) => {
    const chatGateway=new ChatGateway()
    
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
        }
    })

    io.use(async (socket: AuthenticatedSocket, next) => {
        try {
            const data = await decodeToken({ authorization: socket.handshake.auth.authorization, tokenType: tokenTypeEnum.access })
            socket.user = data.user
            next()
        } catch (error) {
            console.log(error);
            
        }

    })
    io.on('connection', (socket: AuthenticatedSocket) => {
        chatGateway.register(socket)
        connect(socket)
        disconnect(socket)

    });

}