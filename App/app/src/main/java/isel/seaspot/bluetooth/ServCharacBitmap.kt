package isel.seaspot.bluetooth

import isel.seaspot.R

enum class ServCharacBitmap(val fport: Byte, val characName_R_ID: Int) {
    ID_USERDATA_STRING(0x3, R.string.userdata_string),
    ID_BATTERY_ENERGY_STATUS(0x4, R.string.battery_energy),
    ID_LOCATION_LATITUDE(0x5, R.string.loc_latitude),
    ID_LOCATION_LONGITUDE(0x6, R.string.loc_longitude),
    ID_PHONE_ID(0x7, R.string.phone_id),
    ID_BROADCAST_STRING (0x8, R.string.broadcast_string),
    ID_LOCATION_REFRESH (0x9, R.string.loc_refresh);
    companion object {
        fun interpretFport(fport: Byte) : ServCharacBitmap? {
            ServCharacBitmap.values().forEach {
                if(it.fport==fport) return it
            }
            return null
        }
    }
}