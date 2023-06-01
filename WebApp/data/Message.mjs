import { service_characteristic } from "./services-characteristics.mjs"




export class Message {
    /**
    * @param {string} id //the same as the imdb key of the movie
    * @param {MessageObj} messageObj 
    */
    constructor(id, messageObj){ 
        this.id = id; this.messageObj = messageObj 
    }
}

export class MessageObj {
    /**
     * @param {String} applicationId
     * @param {String} endDeviceID Ours is eui-70b3d57ed005bfb0
     * @param {String} deviceAdress 260B893E
     * @param {Location} location
     * 
     * @param {service_characteristic} serviceCharacteristic
     * @param {String} payload
     * 
     * @param {Date} receivedAt
     */
    constructor(applicationId, endDeviceID, deviceAdress, location, serviceCharacteristic, payload, receivedAt) {
        this.applicationId = applicationId
        this.endDeviceID = endDeviceID
        this.deviceAdress = deviceAdress
        this.location = location
        this.serviceCharacteristic = serviceCharacteristic
        this.payload = payload
        this.receivedAt = receivedAt
    }
}