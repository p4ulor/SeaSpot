import { checkAllString as areAllString } from "../utils/utils.mjs"
import { Location } from "./Location.mjs"
import { Characteristic, service_characteristics } from "./services-characteristics.mjs"

export class Field {
    /**
     * @param {String | Number | Location} value 
     * @param {Characteristic} characteristic
     * @param {String | null} unit
     */
    constructor(value, characteristic, unit){
        this.value = value
        this.characteristic = characteristic
        this.unit = unit
    }
}

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
     * @param {Field} location the actual GPS location of the TTGO
     * 
     * @param {Field} name AKA Userdata string
     * @param {Field} batteryLevel 
     * @param {Field} phone 
     * @param {Field} string
     * 
     * @param {Date} latestUpdate Indicates the date & time at which one of the mutable properties have been changed
     *  
    */
    constructor(applicationId, deviceAdress, location, name, batteryLevel, phone, string, latestUpdate) {
        if(! areAllString([applicationId, deviceAdress])) throw new Error("Invalid params in DeviceObj")
        
        this.applicationId = applicationId
        this.deviceAdress = deviceAdress

        const loc = location ? location : new Location(undefined, undefined)
        this.location = new Field(loc, service_characteristics.ID_LOCATION)

        this.name = new Field(name, service_characteristics.ID_USERDATA_STRING)
        this.batteryLevel = new Field(batteryLevel, service_characteristics.ID_BATTERY_LEVEL, "mV (Millivolts)")
        this.phone = new Field(phone, service_characteristics.ID_PHONE_ID)
        this.string = new Field(string, service_characteristics.ID_BROADCAST_STRING)

        this.latestUpdate = latestUpdate ? latestUpdate : new Date()

        /**
        * An alternative to this would be to make each chracteristic field have the props field and value
        * We think this approach is more simple
        * @param {Characteristic}
        * @param {Object} value
        * @returns {Boolean} true on success
        */
        this.setCharacteristic = function (characteristic, value){ 
            let wasSet = false
            Object.values(this).forEach(field => {
                if(field.characteristic!=undefined) {
                    if(field.characteristic.code==characteristic.code){
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

