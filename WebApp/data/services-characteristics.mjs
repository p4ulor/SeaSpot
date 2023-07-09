export class Characteristic {
    /**
     * @param {Int} code 
     * @param {String} inString I gave the prop name inString and not toString so the IDE doesn't auto-detects it and can confuse us
     */
    constructor(code, inString){
        this.code = code
        this.inString = inString
    }
}

// _Service _ Characteristic. I gave the prop name inString and not toString so the IDE doesn't auto-detects it and can confuse us
export const service_characteristics = {
    ID_USERDATA_STRING: new Characteristic(0x3, "Userdata string"),
    ID_BATTERY_LEVEL: new Characteristic(0x4, "Battery level"),
    ID_LOCATION_LATITUDE: new Characteristic(0x5, "Latitude"),
    ID_LOCATION_LONGITUDE: new Characteristic(0x6, "Longitude"),
    ID_PHONE_ID: new Characteristic(0x7, "Phone"),
    ID_BROADCAST_STRING: new Characteristic(0x8, "Broadcast string"),
    ID_LOCATION: new Characteristic(0x9, "Latitude and Longitude")
}
