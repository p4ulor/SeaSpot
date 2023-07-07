import { service_characteristic } from "./services-characteristics.mjs"

export class Location {
    /**
     * @param {{value: Number | undefined, id: service_characteristic}} latitude
     * @param {{value: Number | undefined, id: service_characteristic}} longitude
     */
    constructor(latitude, longitude) {
        this.latitude = {
            value: latitude,
            id: service_characteristic.ID_LOCATION_LATITUDE
        }
        this.longitude = {
            value: longitude,
            id: service_characteristic.ID_LOCATION_LONGITUDE
        }
        this.isUndefined = function isUndefined(){
            return this.latitude.value!=undefined || this.longitude.value!=undefined
        }
    }
}
