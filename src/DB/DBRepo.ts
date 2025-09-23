import { HydratedDocument, Model ,FilterQuery,QueryOptions, FlattenMaps, ObjectId} from "mongoose";
import { IUser } from "./models/user.model";

export abstract class DBRepo<T> {
    constructor(protected readonly model: Model<T>) { }

    create = async({ data }: { data: Partial<T> }) : Promise < HydratedDocument<T> >=> {
        const doc = await this.model.create(data)
    return doc
    }
    findOne=async({filter,projection,options}:
        {filter:FilterQuery<T>,projection?:string,options?:QueryOptions<T>}): Promise<FlattenMaps<HydratedDocument<T>>|HydratedDocument<T>|null>=>{
      const query =this.model.findOne(filter,projection,options)
      if(options?.lean){
          query.lean()
      }
      const doc= await query.exec()
      return doc
    }
    update=async({ filter, data, options }:{ filter: FilterQuery<T>; data: Partial<T>; options?: QueryOptions<T>; }):Promise<FlattenMaps<HydratedDocument<T>>|HydratedDocument<T>|null>=>{
      const query= this.model.findOneAndUpdate(filter,data,options)
      if(options?.lean){
          query.lean()
      }
      const doc=await query.exec()
      return doc
    }
       findById=async({id,projection,options}:
        {id:string,projection?:string,options?:QueryOptions<T>}): Promise<FlattenMaps<HydratedDocument<T>>|HydratedDocument<T>|null>=>{
      const query =this.model.findById(id,projection,options)
      if(options?.lean){
          query.lean()
      }
      const doc= await query.exec()
      return doc
    }
    
}