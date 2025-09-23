
import EventEmitter from "events"
import { sendEmail } from "./sendEmail"
type UserEventType = 'send-email-activation-code' | 'send-reset-password-code'



export class UserEvents {
    constructor(private readonly emitter: EventEmitter) { }
    subscripe = (event: UserEventType, cb: (payload: any) => void) => this.emitter.on(event, cb)
    publish = (event: UserEventType, payload: any) => {
        this.emitter.emit(event, payload)
    }
}

const emitter = new EventEmitter()
export const emailEmitter = new UserEvents(emitter)


emailEmitter.subscripe('send-email-activation-code', async ({to,subject,html}
    :{to:string,subject:string,html:string}) =>{
        await sendEmail({to,subject,html})
})