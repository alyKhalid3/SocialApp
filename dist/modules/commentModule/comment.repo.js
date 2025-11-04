"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentRepo = void 0;
const DBRepo_1 = require("../../DB/DBRepo");
const comment_model_1 = require("../../DB/models/comment.model");
class CommentRepo extends DBRepo_1.DBRepo {
    model;
    constructor(model = comment_model_1.commentModel) {
        super(model);
        this.model = model;
    }
}
exports.CommentRepo = CommentRepo;
