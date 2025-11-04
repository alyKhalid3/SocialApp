"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatRepo = void 0;
const DBRepo_1 = require("../../DB/DBRepo");
const chat_model_1 = require("../../DB/models/chat.model");
class ChatRepo extends DBRepo_1.DBRepo {
    model;
    constructor(model = chat_model_1.chatModel) {
        super(model);
        this.model = model;
    }
}
exports.ChatRepo = ChatRepo;
