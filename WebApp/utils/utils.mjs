import { Message } from "../data/Message.mjs"
import { service_characteristic } from "../data/services-characteristics.mjs"

/**
 * Converting payload received as base64 to hexadecimal
 * @param {express.Request.body}
 */
export function base64ToHex(payload) {
    const buffer = Buffer.from(payload, 'base64')
    const decoded = buffer.toString('hex')
    console.log("base64ToHex decoded =", decoded)
    return decoded
}

/**
 * @param {integer} f_port 
 * @return {integer} service_characteristic
 */
export function getCharacteristicID(f_port){
    const characs = Object.values(service_characteristic)

    const diesFportIdentifyCharacteristic = characs.some(value => {
        return value==f_port
    })

    if(! diesFportIdentifyCharacteristic) {
        console.log("Characteristic identifier not found, publishing the message in BROADCAST_STRING")
        return service_characteristic.ID_BROADCAST_STRING //by default treat this as broadcast string
    }
    return f_port
}
