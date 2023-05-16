package isel.seaspot.bluetooth

import java.util.*

// For now android only includes Company ID values in BluetoothAssignedNumbers. https://developer.android.com/reference/android/bluetooth/BluetoothAssignedNumbers#APPLE:~:text=For%20now%20we%20only%20include%20Company%20ID%20values.
enum class AssignedNumbersService(val value: Int){
    Battery(0x180F),
    CurrentTime(0x1805),
    DeviceInformation(0x180A),
    GenericAccess(0x1800),
    GenericAttribute(0x1801),
    LocationAndNavigation(0x1819),
    UserData(0x181C),
    VolumeControl(0x1844),
    WeightScale(0x181D),
    Unknown(0xfffffff);

    companion object {
        fun uuidToEnum(uuid: UUID) : AssignedNumbersService {
            var assignedNumber = Unknown
            AssignedNumbersService.values().forEach {
                val value = Integer.toHexString(it.value)
                if(cutUUIDIntoBLE_UUID(uuid).equals(value)) assignedNumber = it
            }
            return assignedNumber
        }
    }
}

enum class AssignedNumbersCharacteristics(val value: Int, val type: ValueType){
    AlertLevel(0x2A06, ValueType.Number),
    Altitude(0x2AB3, ValueType.Number),
    AverageCurrent(0x2AE0, ValueType.Number),
    AverageVoltage(0x2AE1, ValueType.Number),
    BatteryLevel(0x2A19, ValueType.Number),
    CurrentTime(0x2A2B, ValueType.Number),
    Height(0x2A8E, ValueType.Number),
    Humidity(0x2A6F, ValueType.Number),
    Latitude(0x2AAE, ValueType.Number),
    Longitude(0x2AAF, ValueType.Number),
    LocationName(0x2AB5, ValueType.Text),
    ObjectName(0x2ABE, ValueType.Text),
    ObjectProperties(0x2AC4, ValueType.Text),
    SensorLocation(0x2A5D, ValueType.Number),
    SerialNumberString(0x2A25, ValueType.Text),
    Temperature(0x2A6E, ValueType.Number),
    TimeZone(0x2A0E, ValueType.Text),
    URI(0x2AB6, ValueType.Text),
    VolumeState(0x2B7D, ValueType.Text),
    Weight(0x2A98, ValueType.Number),
    Unknown(0xfffffff, ValueType.Text);

    companion object {
        fun uuidToEnum(uuid: UUID) : AssignedNumbersCharacteristics {
            var assignedNumber = Unknown
            AssignedNumbersCharacteristics.values().forEach {
                val value = Integer.toHexString(it.value)
                if(cutUUIDIntoBLE_UUID(uuid).equals(value)) assignedNumber = it
            }
            return assignedNumber
        }
    }
}

enum class AssignedNumbersDescriptors(val value: Int){ //Not being used
    CharacteristicExtendedProperties(0x2900),
    NumberOfDigitals(0x2909)
}

enum class ValueType {
    Text,
    Number
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
