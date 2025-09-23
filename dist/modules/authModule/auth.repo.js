"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepo = void 0;
const DBRepo_1 = require("../../DB/DBRepo");
const user_model_1 = require("../../DB/models/user.model");
class UserRepo extends DBRepo_1.DBRepo {
    model;
    constructor(model = user_model_1.userModel) {
        super(model);
        this.model = model;
    }
    findByEmail = async ({ email, projection, options }) => {
        const query = this.model.findOne({ email }, projection, options);
        if (options?.lean) {
            query.lean(true);
        }
        const doc = query.exec();
        return doc;
    };
}
exports.UserRepo = UserRepo;
