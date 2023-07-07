export class GeneralServerResponse {
    /** @param {string} msg */
    constructor(msg){
        this.msg = msg
    }
}

export const DeleteAllMessagesRequest = {
    deviceId: "",
    appId: "",
}

export function doesBodyContainProps(body, props){ //note: it doesnt check the type!
    var propsKeys = Object.keys(props)
    let missingProp = undefined
    propsKeys.every(key => {
        if(!body.hasOwnProperty(key)){
            missingProp = key
            return false
        }
        else {
            if(typeof body[key] == 'string'){
                const field = body[key]+""
                if(field.trim().length==0) throw new errors.BadRequest(`Field '${key}' is empty or blank`)
            }
            return true
        }
    })
    if(missingProp) throw new errors.BadRequest(`Missing field -> ${missingProp}`)
}