package isel.seaspot.bluetooth

import java.util.*

// For now android only includes Company ID values in BluetoothAssignedNumbers. https://developer.android.com/reference/android/bluetooth/BluetoothAssignedNumbers#APPLE:~:text=For%20now%20we%20only%20include%20Company%20ID%20values.
enum class AssignedNumbersService(val value: Int){
    LocationAndNavigation(0x1819),
    GenericAccess(0x1800),
    Battery(0x180F),
    Unknown(0xfffffff);

    companion object {
        fun uuidToEnum(uuid: UUID) : AssignedNumbersService? {
            var assignedNumber: AssignedNumbersService? = null
            AssignedNumbersService.values().forEach {
                val value = Integer.toHexString(it.value)
                if(cutUUIDIntoBLE_UUID(uuid).equals(value)) assignedNumber = it
            }
            return assignedNumber
        }
    }
}

enum class AssignedNumbersCharacteristics(val value: Int){
    BatteryLevel(0x2A19),
    Latitude(0x2AAE),
    Longitude(0x2AAF),
    LocationName(0x2AB5),
    ObjectName(0x2ABE),
    Unknown(0xfffffff);

    companion object {
        fun uuidToEnum(uuid: UUID) : AssignedNumbersCharacteristics? {
            var assignedNumber: AssignedNumbersCharacteristics? = null
            AssignedNumbersCharacteristics.values().forEach {
                val value = Integer.toHexString(it.value)
                if(cutUUIDIntoBLE_UUID(uuid).equals(value)) assignedNumber = it
            }
            return assignedNumber
        }
    }
}

private fun cutUUIDIntoBLE_UUID(uuid: UUID) : String { //UUID to Bluetooth SIG UUID
    val sb = StringBuilder()
    uuid.toString().forEach {
        if(it=='-') return sb.toString()
        if(it!='0') sb.append(it)
    }
    return sb.toString()
}

private fun cutUUIDIntoBLE_UUID_withZeros(uuid: UUID) : String { //UUID to Bluetooth SIG UUID
    return uuid.toString().substring(0, 8)
}

enum class AssignedNumbersDescriptors(val value: Int){ //Not being used
    CharacteristicExtendedProperties(0x2900),
    NumberOfDigitals(0x2909)
}