"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostRepo = void 0;
const DBRepo_1 = require("../../DB/DBRepo");
const post_model_1 = require("../../DB/models/post.model");
class PostRepo extends DBRepo_1.DBRepo {
    model;
    constructor(model = post_model_1.postModel) {
        super(model);
        this.model = model;
    }
}
exports.PostRepo = PostRepo;
