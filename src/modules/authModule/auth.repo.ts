import { FlattenMaps, HydratedDocument, Model, QueryOptions } from "mongoose";
import { DBRepo } from "../../DB/DBRepo";
import { IUser, userModel } from "../../DB/models/user.model";


export class UserRepo extends DBRepo<IUser> {
    constructor(protected override readonly model: Model<IUser>=userModel) {
        super(model);
    }
    findByEmail=async({email,projection,options}:{email:string,projection?:string,options?:QueryOptions<IUser>}):Promise<FlattenMaps<HydratedDocument<IUser>>|HydratedDocument<IUser>|null>=>{
        const query= this.model.findOne({email},projection,options)
        if(options?.lean){
            query.lean(true)
        }
        const doc=query.exec()
        return doc
    }
}