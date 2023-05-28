import { service_characteristic } from "./services-characteristics.mjs"

export class Message {
    /**
     * @param {String} application_id
     * @param {String} endDeviceID Ours is eui-70b3d57ed005bfb0
     * @param {String} deviceAdress 260B893E
     * @param {Location} location
     * 
     * @param {service_characteristic} service_characteristic
     * @param {String} payload
     * 
     * @param {Date} received_at
     */
    constructor(application_id, endDeviceID, deviceAdress, location, service_characteristic, payload, received_at) {
        this.application_id = application_id
        this.endDeviceID = endDeviceID
        this.deviceAdress = deviceAdress
        this.location = location
        this.service_characteristic = service_characteristic
        this.payload = payload
        this.received_at = received_at
    }
}
