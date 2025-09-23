import mongoose from 'mongoose'

export const connectDB=async():Promise<void>=>{
   await mongoose.connect(process.env.MONGO_URL as string).then(()=>{
        console.log('DB connected')
    }).catch((err)=>{
        console.log('db connection error',err)
    })
}