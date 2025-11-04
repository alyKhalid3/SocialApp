"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendRequestRepo = void 0;
const DBRepo_1 = require("../DBRepo");
const friendRequest_model_1 = require("../models/friendRequest.model");
class FriendRequestRepo extends DBRepo_1.DBRepo {
    constructor() {
        super(friendRequest_model_1.friendRequestModel);
    }
}
exports.FriendRequestRepo = FriendRequestRepo;
