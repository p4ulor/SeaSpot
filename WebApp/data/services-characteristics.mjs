// _Service _ Characteristic. I gave the prop name inString and not toString so the IDE doesn't auto-detects it and can confuse us
export const service_characteristic = {
    ID_USERDATA_STRING: {
        code: 0x3,
        inString: "Userdata string"
    },
    ID_BATTERY_LEVEL: {
        code: 0x4,
        inString: "Battery level"
    },
    ID_LOCATION_LATITUDE: {
        code: 0x5,
        inString: "Latitude"
    },
    ID_LOCATION_LONGITUDE: {
        code: 0x6,
        inString: "Longitude"
    },
    ID_PHONE_ID: {
        code: 0x7,
        inString: "Phone"
    },
    ID_BROADCAST_STRING: {
        code: 0x8,
        inString: "Broadcast string"
    }
}
