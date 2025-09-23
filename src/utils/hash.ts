import bcrypt from 'bcrypt'
import 'dotenv/config'

export const createHash=async ({text}:{text:string}):Promise<string>=>{
    const data =await bcrypt.hash(text,Number(process.env.SALT))
    return data
}

export const compareHash=async ({text,hash}:{text:string,hash:string}):Promise<boolean>=>{
    const data =await bcrypt.compare(text,hash)
    return data
}