
import EventEmitter from "events"
import { sendEmail } from "./sendEmail"
type UserEventType = 'send-email-activation-code' | 'send-reset-password-code'|'enable-two-step-verification'



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
emailEmitter.subscripe('send-reset-password-code', async ({to,subject,html}
    :{to:string,subject:string,html:string}) =>{
        await sendEmail({to,subject,html})
})
emailEmitter.subscripe('enable-two-step-verification', async ({to,subject,html}
    :{to:string,subject:string,html:string}) =>{
        await sendEmail({to,subject,html})
})