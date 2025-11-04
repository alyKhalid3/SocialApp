import { Model } from "mongoose";
import { DBRepo } from "../../DB/DBRepo";
import { commentModel, IComment } from "../../DB/models/comment.model";




export class CommentRepo extends DBRepo<IComment>{
  constructor(protected override readonly model: Model<IComment>=commentModel) {
    super(model);
  }
} 