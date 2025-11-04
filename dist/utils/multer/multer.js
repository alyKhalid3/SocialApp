"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = exports.fileTypes = exports.StoreIn = void 0;
const multer_1 = __importStar(require("multer"));
const Error_1 = require("../Error");
var StoreIn;
(function (StoreIn) {
    StoreIn["MEMORY"] = "memory";
    StoreIn["DISK"] = "disk";
})(StoreIn || (exports.StoreIn = StoreIn = {}));
exports.fileTypes = {
    images: ['image/jpeg', 'image/png', 'image/jpg'],
    video: ['video/mp4', 'video/ogg', 'video/mkv', 'video/webm']
};
const uploadFile = ({ storeIn = StoreIn.MEMORY, fileType = exports.fileTypes.images }) => {
    const storage = storeIn === StoreIn.MEMORY ? (0, multer_1.memoryStorage)() : (0, multer_1.diskStorage)({});
    const fileFilter = (req, file, callback) => {
        if (file.size > 2000000 && storeIn === StoreIn.MEMORY) {
            return callback(new Error_1.applicationError('File size is too large use disk not memory', 500), false);
        }
        else if (!fileType.includes(file.mimetype)) {
            return callback(new Error('File type is not allowed'), false);
        }
        callback(null, true);
    };
    return (0, multer_1.default)({ storage, fileFilter });
};
exports.uploadFile = uploadFile;
