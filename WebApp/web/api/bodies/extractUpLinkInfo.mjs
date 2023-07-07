import { MessageObj} from "../../../data/Message.mjs"
import { Location } from "../../../data/Location.mjs"
import { base64ToHex, getCharacteristicID} from "../../../utils/utils.mjs"

/**
 * 
 * @param {Object} body 
 * @returns {}
 */
export function extractUplinkInfo(body) {
    const applicationId = body.end_device_ids.application_ids.application_id
    const endDeviceID = body.end_device_ids.device_id
    const deviceAdress = body.end_device_ids.dev_addr

    let location = new Location(undefined, undefined)
    const locations = body.uplink_message.locations
    if(locations!=undefined){
        const loc = locations['frm-payload'] //using locaitons.user will get the hardcoded location (done in the TTN)
        if(loc){
            console.log("Location source =", loc.source)
            location = new Location(loc.latitude, loc.longitude)  
        } else console.log("Warning: No GPS location provided")
    }
    
    const payload = body.uplink_message.frm_payload
    const decodedPayload = base64ToHex(payload)
    const fPort = body.uplink_message.f_port
    const characID = getCharacteristicID(fPort)

    // characteristic can be read from the f_port, so no ExtratCharar

    const receivedAt = body.received_at

    const msgObj = new MessageObj(applicationId, endDeviceID, deviceAdress, location, 
                                    characID, decodedPayload, 
                                    receivedAt)
    let ttnDecodedPayload = body.uplink_message.decoded_payload
    if(Object.keys(ttnDecodedPayload).length==0) ttnDecodedPayload = undefined
    return {
        msg: msgObj,
        ttnDecodedPayload: ttnDecodedPayload
    }
}

export class UpLinkInfo {
    /**
     * 
     * @param {MessageObj} msg 
     * @param {Object | undefined} ttnDecodedPayload 
     */
    constructor(msg, ttnDecodedPayload){
        this.msg = msg
        this.ttnDecodedPayload = ttnDecodedPayload
    }
}
