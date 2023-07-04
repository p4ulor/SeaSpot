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
     * @param {String} applicationId
     * @param {String} deviceAdress 260B893E
     * @param {Location} location 
     * 
     * @param {String} name AKA Userdata string
     * @param {Number} batteryLevel 
     * @param {String} phone 
     * @param {String} string
     * 
     * @param {Date} latestUpdate Indicates the date & time at which one of the mutable properties have been changed
     */
    constructor(applicationId, deviceAdress, location, name, batteryLevel, phone, string, latestUpdate) {
        this.applicationId = applicationId
        this.deviceAdress = deviceAdress
        this.location = location
        this.name = name
        this.batteryLevel = batteryLevel
        this.phone = phone
        this.string = string
        this.latestUpdate = latestUpdate 
    }
}

export class Location {
    /**
     * @param {Number} latitude 
     * @param {Number} longitude 
     */
    constructor(latitude, longitude) {
        this.latitude = latitude
        this.longitude = longitude
    }
}
