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
 * @param {string} payload decoded 
 * @return {CharacIDandValue}
 */
export function extractCharacteristicAndValue(payload){
    let firstByte = new Number(payload.slice(0, 2))
    if(isNaN(firstByte)) firstByte = service_characteristic.ID_BROADCAST_STRING
    let characteristicValue = payload.slice(2) //contains the rest of the string after the first character
    const characs = Object.values(service_characteristic)

    const doesByteIdentifyCharacteristic = characs.some(value => {
        return value==firstByte
    })

    if(! doesByteIdentifyCharacteristic) {
        console.log("Characteristic identifier not found, publishing the message in BROADCAST_STRING")
        firstByte = service_characteristic.ID_BROADCAST_STRING //by default treat this as broadcast string
        return new CharacIDandValue(firstByte, payload) //and use the entirery of the payload as the message
    }
    return new CharacIDandValue(firstByte, characteristicValue)
}

export class CharacIDandValue {
    /**
     * @param {number} charac 
     * @param {string} value 
     */
    constructor(charac, value){
        this.charac = charac
        this.value = value
    }
}