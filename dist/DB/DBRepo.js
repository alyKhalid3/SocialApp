"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBRepo = void 0;
class DBRepo {
    model;
    constructor(model) {
        this.model = model;
    }
    create = async ({ data }) => {
        const doc = await this.model.create(data);
        return doc;
    };
    findOne = async ({ filter, projection, options }) => {
        const query = this.model.findOne(filter, projection, options);
        if (options?.lean) {
            query.lean();
        }
        const doc = await query.exec();
        return doc;
    };
    update = async ({ filter, data, options }) => {
        const query = this.model.findOneAndUpdate(filter, data, options);
        if (options?.lean) {
            query.lean();
        }
        const doc = await query.exec();
        return doc;
    };
    findById = async ({ id, projection, options }) => {
        const query = this.model.findById(id, projection, options);
        if (options?.lean) {
            query.lean();
        }
        const doc = await query.exec();
        return doc;
    };
}
exports.DBRepo = DBRepo;
