import { Characteristic, service_characteristics } from "./services-characteristics.mjs"

export class Location {
    /**
     * @param {{value: Number | undefined, id: Characteristic}} latitude
     * @param {{value: Number | undefined, id: Characteristic}} longitude
     */
    constructor(latitude, longitude) {
        this.latitude = {
            value: latitude,
            id: service_characteristics.ID_LOCATION_LATITUDE
        }
        this.longitude = {
            value: longitude,
            id: service_characteristics.ID_LOCATION_LONGITUDE
        }
        this.isUndefined = function isUndefined(){
            return this.latitude.value!=undefined || this.longitude.value!=undefined
        }
    }
}
