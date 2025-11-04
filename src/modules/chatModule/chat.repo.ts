import { Model } from "mongoose";
import { DBRepo } from "../../DB/DBRepo";
import { chatModel, IChat } from "../../DB/models/chat.model";





export class ChatRepo extends DBRepo<IChat>{
    constructor(protected  override readonly model:Model<IChat>=chatModel){ 
        super(model)
    }
}
