import { Characteristic, service_characteristics } from "./services-characteristics.mjs"
import { Location } from "./Location.mjs"

export class Message {
    /**
    * @param {string} id
    * @param {MessageObj} messageObj 
    */
    constructor(id, messageObj){ 
        this.id = id
        this.messageObj = messageObj
    }
}

export class MessageObj {
    /**
     * @param {String} applicationId
     * @param {String} endDeviceID Ours is eui-70b3d57ed005bfb0
     * @param {String} deviceAdress (dev_addr) 260B893E Note: this field in specific might not be unique or might change at some later time https://www.thethingsnetwork.org/docs/lorawan/addressing/#devices
     * @param {Location} location the location of the gateway the TTGO used to uplink this message
     * 
     * @param {Characteristic} characteristic
     * @param {String} payload in hexadecimal format. Example: 61 62 63
     * 
     * @param {Date} receivedAt
     */
    constructor(applicationId, endDeviceId, deviceAddress, location, characteristic, payload, receivedAt) {
        this.applicationId = applicationId
        this.endDeviceId = endDeviceId
        this.deviceAddress = deviceAddress
        this.location = location
        this.characteristic = characteristic
        this.payload = payload
        this.receivedAt = receivedAt
    }
}
