import { diskStorage } from 'multer';
import { createReadStream } from 'fs';
import { StoreIn } from './multer';
import { DeleteObjectCommand, DeleteObjectCommandOutput, DeleteObjectsCommand, ObjectCannedACL, PutObjectCommand } from "@aws-sdk/client-s3"
import { s3Config } from './s3Config';
import { BadRequestException, FileUploadException } from '../Error';
import { Upload } from '@aws-sdk/lib-storage';
import { nanoid } from 'nanoid';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const uploadSingleFile = async ({
    Bucket = process.env.BUCKET_NAME as string,
    ACL = "private",
    path = 'general',
    file,
    storeIn = StoreIn.MEMORY
}:
    {
        Bucket?: string,
        ACL?: ObjectCannedACL,
        path?: string,
        file: Express.Multer.File,
        storeIn?: StoreIn
    }): Promise<string> => {
    const command = new PutObjectCommand({
        Bucket,
        ACL,
        Key: `SocialApp/${path}/${nanoid(15)}_${file.originalname}`,
        Body: storeIn === StoreIn.MEMORY ? file.buffer : createReadStream(file.path),
        ContentType: file.mimetype
    })
    await s3Config().send(command)
    if (!command.input.Key) throw new FileUploadException()
    return command.input.Key
}


export const uploadSingleLargeFile = async ({
    Bucket = process.env.BUCKET_NAME as string,
    ACL = "private",
    path = 'general',
    file,
    storeIn = StoreIn.DISK
}:
    {
        Bucket?: string,
        ACL?: ObjectCannedACL,
        path?: string,
        file: Express.Multer.File,
        storeIn?: StoreIn
    }): Promise<string> => {
    const upload = new Upload({
        client: s3Config(),
        params: {
            Bucket,
            ACL,
            Key: `SocialApp/${path}/${nanoid(15)}_${file.originalname}`,
            Body: storeIn === StoreIn.MEMORY ? file.buffer : createReadStream(file.path),
            ContentType: file.mimetype
        }
    })
    upload.on('httpUploadProgress', (progress) => {
        console.log(progress)
    })
    const { Key } = await upload.done()
    if (!Key) throw new FileUploadException()
    return Key

}



export const uploadMultiFiles = async ({
    Bucket = process.env.BUCKET_NAME as string,
    ACL = "private",
    path = 'general',
    files,
    storeIn = StoreIn.MEMORY
}:
    {
        Bucket?: string,
        ACL?: ObjectCannedACL,
        path?: string,
        files: Express.Multer.File[],
        storeIn?: StoreIn
    }): Promise<string[]> => {
    const keys = Promise.all(
        storeIn === StoreIn.MEMORY ?
            files.map((file) => {
                return uploadSingleFile({ Bucket, ACL, path, file, storeIn })
            }) : files.map((file) => {
                return uploadSingleLargeFile({ Bucket, ACL, path, file, storeIn })
            })
    )

    return keys

}


export const createPreSignUrl = async ({
    Bucket = process.env.BUCKET_NAME as string,
    path = 'general',
    ContentType,
    originalname,
    expiresIn = 120
}: {
    Bucket?: string,
    path?: string,
    ContentType: string,
    originalname: string,
    expiresIn?: number
}) => {
    const command = new PutObjectCommand({
        Bucket,
        Key: `SocialApp/${path}/${nanoid(15)}-presigned-${originalname}`,
        ContentType
    })
    const url = await getSignedUrl(s3Config(), command, {
        expiresIn
    })
    if (!url || !command.input.Key) throw new BadRequestException('error creating presigned url')
    return { url, Key: command.input.Key }
}


export const deleteFile = async ({ Bucket = process.env.BUCKET_NAME as string, Key }: 
    { Bucket: string, Key: string }):
     Promise<DeleteObjectCommandOutput> => {
    const command = new DeleteObjectCommand({
        Bucket,
        Key
    })
    return await s3Config().send(command)
}

export const deleteFiles = async ({ Bucket = process.env.BUCKET_NAME as string, urls,Quiet=false }: 
    { Bucket?: string, urls: string[],Quiet?:boolean }):
     Promise<DeleteObjectCommandOutput> => {
        const Objects=urls.map(url=>({Key:url}))
    const command = new DeleteObjectsCommand({
        Bucket,
        Delete:{
            Objects,
            Quiet
        }
    })
    return await s3Config().send(command)
}