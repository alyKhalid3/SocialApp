"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFiles = exports.deleteFile = exports.createPreSignUrl = exports.uploadMultiFiles = exports.uploadSingleLargeFile = exports.uploadSingleFile = void 0;
const fs_1 = require("fs");
const multer_1 = require("./multer");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3Config_1 = require("./s3Config");
const Error_1 = require("../Error");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const nanoid_1 = require("nanoid");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const uploadSingleFile = async ({ Bucket = process.env.BUCKET_NAME, ACL = "private", path = 'general', file, storeIn = multer_1.StoreIn.MEMORY }) => {
    const command = new client_s3_1.PutObjectCommand({
        Bucket,
        ACL,
        Key: `SocialApp/${path}/${(0, nanoid_1.nanoid)(15)}_${file.originalname}`,
        Body: storeIn === multer_1.StoreIn.MEMORY ? file.buffer : (0, fs_1.createReadStream)(file.path),
        ContentType: file.mimetype
    });
    await (0, s3Config_1.s3Config)().send(command);
    if (!command.input.Key)
        throw new Error_1.FileUploadException();
    return command.input.Key;
};
exports.uploadSingleFile = uploadSingleFile;
const uploadSingleLargeFile = async ({ Bucket = process.env.BUCKET_NAME, ACL = "private", path = 'general', file, storeIn = multer_1.StoreIn.DISK }) => {
    const upload = new lib_storage_1.Upload({
        client: (0, s3Config_1.s3Config)(),
        params: {
            Bucket,
            ACL,
            Key: `SocialApp/${path}/${(0, nanoid_1.nanoid)(15)}_${file.originalname}`,
            Body: storeIn === multer_1.StoreIn.MEMORY ? file.buffer : (0, fs_1.createReadStream)(file.path),
            ContentType: file.mimetype
        }
    });
    upload.on('httpUploadProgress', (progress) => {
        console.log(progress);
    });
    const { Key } = await upload.done();
    if (!Key)
        throw new Error_1.FileUploadException();
    return Key;
};
exports.uploadSingleLargeFile = uploadSingleLargeFile;
const uploadMultiFiles = async ({ Bucket = process.env.BUCKET_NAME, ACL = "private", path = 'general', files, storeIn = multer_1.StoreIn.MEMORY }) => {
    const keys = Promise.all(storeIn === multer_1.StoreIn.MEMORY ?
        files.map((file) => {
            return (0, exports.uploadSingleFile)({ Bucket, ACL, path, file, storeIn });
        }) : files.map((file) => {
        return (0, exports.uploadSingleLargeFile)({ Bucket, ACL, path, file, storeIn });
    }));
    return keys;
};
exports.uploadMultiFiles = uploadMultiFiles;
const createPreSignUrl = async ({ Bucket = process.env.BUCKET_NAME, path = 'general', ContentType, originalname, expiresIn = 120 }) => {
    const command = new client_s3_1.PutObjectCommand({
        Bucket,
        Key: `SocialApp/${path}/${(0, nanoid_1.nanoid)(15)}-presigned-${originalname}`,
        ContentType
    });
    const url = await (0, s3_request_presigner_1.getSignedUrl)((0, s3Config_1.s3Config)(), command, {
        expiresIn
    });
    if (!url || !command.input.Key)
        throw new Error_1.BadRequestException('error creating presigned url');
    return { url, Key: command.input.Key };
};
exports.createPreSignUrl = createPreSignUrl;
const deleteFile = async ({ Bucket = process.env.BUCKET_NAME, Key }) => {
    const command = new client_s3_1.DeleteObjectCommand({
        Bucket,
        Key
    });
    return await (0, s3Config_1.s3Config)().send(command);
};
exports.deleteFile = deleteFile;
const deleteFiles = async ({ Bucket = process.env.BUCKET_NAME, urls, Quiet = false }) => {
    const Objects = urls.map(url => ({ Key: url }));
    const command = new client_s3_1.DeleteObjectsCommand({
        Bucket,
        Delete: {
            Objects,
            Quiet
        }
    });
    return await (0, s3Config_1.s3Config)().send(command);
};
exports.deleteFiles = deleteFiles;
