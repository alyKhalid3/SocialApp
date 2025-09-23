import { email } from 'zod';
import { Options } from './../../node_modules/raw-body/index.d';



export class applicationError extends Error{
    statusCode:number

    constructor(message:string,statusCode:number,Options?:Options){
        super(message)
        this.statusCode=statusCode
    }
}
export interface IError extends Error{
    statusCode:number
}


export class ValidationError extends applicationError{
    constructor(message:string){
        super(message,422)
    }
}   
export class EmailIsExist extends applicationError{
    constructor(message:string='email already exist'){  
        super(message,400)
    }
}   

export class NotFoundException extends applicationError{
    constructor(message:string){
        super(message,404)
    }
}
export class ExpiredOTPException extends applicationError{
    constructor(message:string){
        super(message,410)
    }
}
export class InvalidCredentialsException extends applicationError{
    constructor(message:string='invalid credentials'){
        super(message,409)
    }
}
export class NotConfirmedException extends applicationError{
    constructor(message:string='confirm your email first'){
        super(message,400)
    }
}
export class InvalidTokenException extends applicationError{
    constructor(message:string){
        super(message,409)
    }
}
