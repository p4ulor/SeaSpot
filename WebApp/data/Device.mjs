import { checkAllString as areAllString } from "../utils/utils.mjs"
import { Location } from "./Location.mjs"
import { service_characteristic } from "./services-characteristics.mjs"

/**
 * Every application in EU starts with 70B3D57ED. 70b3d57ed005bfb0 - 70B3D57ED = 005bfb0 -> 7 alpha numeric symbols
 * There is a tiny chance that searching by this ID could be equal to another application - Read https://www.thethingsnetwork.org/docs/lorawan/addressing/#devices and https://www.thethingsnetwork.org/forum/t/node-ids-not-unique/31343
 * 36 -> Letters (26) + Digits (10)
 * The chance of us storing a device with the same adress = 1/(36^7) = 1.2760935e-11 = 0.000000000012760935
 * The alternative would be to join the appID and devID like appID:devID to form a more unique ID for a device in our DB. But we found this unnecessary
 */
export class Device {
    /**
    * @param {string} id endDeviceID (Ours is eui-70b3d57ed005bfb0)
    * @param {DeviceObj} deviceObj 
    */
    constructor(id, deviceObj){ 
        this.id = id
        this.deviceObj = deviceObj
    }
}

export class DeviceObj {
    /**
     * @param {String} applicationId ttgo-test-g10 (required on initialization)
     * @param {String} deviceAdress 260B893E (required on initialization)
     * @param {Location} location the actual GPS location of the TTGO
     * 
     * @param {String} name AKA Userdata string
     * @param {Number} batteryLevel 
     * @param {String} phone 
     * @param {String} string
     * 
     * @param {Date} latestUpdate Indicates the date & time at which one of the mutable properties have been changed
     *  
    */
    constructor(applicationId, deviceAdress, location, name, batteryLevel, phone, string, latestUpdate) {
        if(! areAllString([applicationId, deviceAdress])) throw new Error("Invalid params in DeviceObj")
        
        this.applicationId = applicationId
        this.deviceAdress = deviceAdress

        this.location = {
            value: location ? location : new Location(0, 0),
            id: service_characteristic.ID_LOCATION
        }
        this.name = {
            value: name,
            id: service_characteristic.ID_USERDATA_STRING
        }
        this.batteryLevel = {
            value: batteryLevel,
            id: service_characteristic.ID_BATTERY_LEVEL
        }
        this.phone = {
            value: phone,
            id: service_characteristic.ID_PHONE_ID
        }
        this.string = {
            value: string,
            id: service_characteristic.ID_BROADCAST_STRING
        }
        this.latestUpdate = latestUpdate ? latestUpdate : new Date()

        /**
        * An alternative to this would be to make each chracteristic field have the props field and value
        * We think this approach is more simple
        * @param {service_characteristic}
        * @param {Object} value
        * @returns {Boolean} true on success
        */
        this.setCharacteristic = function (service_characteristic, value){ 
            let wasSet = false
            Object.values(this).forEach(field => {
                if(field.id!=undefined) {
                    if(field.id.code==service_characteristic.code){
                        field.value = value
                        wasSet = true
                    }
                }
            })
            if(! wasSet) console.log("Warning: No valid characteristic provided. setCharacteristic() had no effect")
            else this.latestUpdate = new Date() //now
            return wasSet
        }
    }
}

