import { DBRepo } from "../DBRepo";
import { friendRequestModel, IFriendRequest } from "../models/friendRequest.model";



export class FriendRequestRepo extends DBRepo<IFriendRequest> {
    constructor() {
        super(friendRequestModel);
    }
}