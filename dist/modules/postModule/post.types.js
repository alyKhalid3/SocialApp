"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postAvailabilityEnum = exports.AvailabilityCondition = void 0;
/**
 * createdBy
 * conent
 * attachments
 * comments
 * availability
 * likes
 * tags
 * allowComments
 * isDeleted
 * createdAt
 * updatedAt
 * assetsFolderId
 *
 */
const AvailabilityCondition = (user) => {
    return [
        { availability: postAvailabilityEnum.PUBLIC },
        {
            availability: postAvailabilityEnum.FRIENDS,
            createdBy: { $in: [user._id, ...user.friends] }
        },
        {
            availability: postAvailabilityEnum.PRIVATE,
            createdBy: user._id
        }
    ];
};
exports.AvailabilityCondition = AvailabilityCondition;
var postAvailabilityEnum;
(function (postAvailabilityEnum) {
    postAvailabilityEnum["PUBLIC"] = "public";
    postAvailabilityEnum["PRIVATE"] = "private";
    postAvailabilityEnum["FRIENDS"] = "friends";
})(postAvailabilityEnum || (exports.postAvailabilityEnum = postAvailabilityEnum = {}));
