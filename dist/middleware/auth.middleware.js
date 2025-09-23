"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = exports.decodeToken = exports.tokenTypeEnum = void 0;
const user_model_1 = require("../DB/models/user.model");
const auth_repo_1 = require("../modules/authModule/auth.repo");
const Error_1 = require("../utils/Error");
const jwt_1 = require("../utils/jwt");
var tokenTypeEnum;
(function (tokenTypeEnum) {
    tokenTypeEnum["access"] = "access";
    tokenTypeEnum["refresh"] = "refresh";
})(tokenTypeEnum || (exports.tokenTypeEnum = tokenTypeEnum = {}));
const UserModel = new auth_repo_1.UserRepo(user_model_1.userModel);
const decodeToken = async ({ authorization, tokenType = tokenTypeEnum.access }) => {
    if (!authorization)
        throw new Error_1.InvalidTokenException('invalid token');
    if (!authorization.startsWith(process.env.BEARER))
        throw new Error_1.InvalidTokenException('invalid token');
    const token = authorization.split(' ')[1];
    if (!token)
        throw new Error_1.InvalidTokenException('invalid token');
    const payload = (0, jwt_1.verifyJwt)(token, tokenType == tokenTypeEnum.access ?
        process.env.ACCESS_SIGNATURE
        : process.env.REFRESH_SIGNATURE);
    const user = await UserModel.findById({ id: payload.id });
    if (!user)
        throw new Error_1.NotFoundException('user not found');
    if (!user.isConfirmed)
        throw new Error_1.NotConfirmedException();
    return { user, payload };
};
exports.decodeToken = decodeToken;
const auth = () => {
    return async (req, res, next) => {
        const authorization = req.headers.authorization;
        const { user, payload } = await (0, exports.decodeToken)({ authorization: authorization });
        res.locals.user = user;
        res.locals.payload = payload;
        next();
    };
};
exports.auth = auth;
