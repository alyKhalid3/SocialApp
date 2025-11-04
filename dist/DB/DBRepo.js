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
    find = async ({ filter, projection, options }) => {
        const query = this.model.find(filter, projection, options);
        if (options?.lean) {
            query.lean();
        }
        const doc = await query.exec();
        return doc;
    };
    findOne = async ({ filter, projection, options }) => {
        let query = this.model.findOne(filter, projection, options);
        if (options?.populate) {
            query.populate(options.populate);
        }
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
    updateMany = async ({ filter, data, options }) => {
        const query = this.model.updateMany(filter, data, options);
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
    deleteMany = async ({ filter, options }) => {
        const query = this.model.deleteMany(filter, options);
        const doc = await query.exec();
        return doc;
    };
}
exports.DBRepo = DBRepo;
