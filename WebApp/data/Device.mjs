
class Device{
    /**
     * @param {String} application_id
     * @param {String} endDeviceID Ours is eui-70b3d57ed005bfb0
     * @param {String} deviceAdress 260B893E
     * @param {Location} location 
     * 
     * @param {String} name 
     * @param {Number} batteryLevel 
     * @param {String} phone 
     * @param {String} string
     * 
     * @param {Date} latestUpdate Indicates the date & time at which one of the mutable properties have been changed
     */
    constructor(){

    }
}

export class Location {
    /**
     * @param {Number} latitude 
     * @param {Number} longitude 
     */
    constructor(latitude, longitude){
        this.latitude = latitude
        this.longitude = longitude
    }
}