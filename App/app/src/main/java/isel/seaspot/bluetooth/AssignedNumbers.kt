package isel.seaspot.bluetooth

import java.util.*

// For now android only includes Company ID values in BluetoothAssignedNumbers. https://developer.android.com/reference/android/bluetooth/BluetoothAssignedNumbers#APPLE:~:text=For%20now%20we%20only%20include%20Company%20ID%20values.
enum class AssignedNumbersService(val value: Int){
    Battery(0x180F),
    CurrentTime(0x1805),
    DeviceInformation(0x180A),
    GenericAccess(0x1800), //exists (by default) for every ble device
    GenericAttribute(0x1801), //exists (by default) for every ble device
    LocationAndNavigation(0x1819),
    ObjectTransfer(0x1825), //Will be used as what represents "updating the characteristics" from the TTN
    Phone(0x180E), //(PhoneAlertStatus)
    PublicBroadcast(0x1856), // (Public Broadcast Announcement)
    UserData(0x181C),
    VolumeControl(0x1844),
    WeightScale(0x181D),
    Unknown(0xfffffff);

    companion object {
        fun uuidToEnum(uuid: UUID) : AssignedNumbersService {
            var assignedNumber = Unknown
            AssignedNumbersService.values().forEach {
                val value = Integer.toHexString(it.value)
                val bleUUID = cutUUIDIntoBLE_UUID(uuid)
                //log("bleUUID = $bleUUID")
                if(bleUUID.equals(value)) assignedNumber = it
            }
            return assignedNumber
        }
    }
}

//These 2 services show up on all BLE devices as said in the specification https://devzone.nordicsemi.com/f/nordic-q-a/15118/how-to-remove-generic-access-and-generic-attribute-profiles
// They are read only and aren't relevant to the App user
val ignoredServices = mutableListOf(
    AssignedNumbersService.GenericAccess, AssignedNumbersService.GenericAttribute
)

enum class AssignedNumbersCharacteristics(val value: Int, val type: ValueType){
    AlertLevel(0x2A06, ValueType.Number),
    Altitude(0x2AB3, ValueType.Number),
    AverageCurrent(0x2AE0, ValueType.Number),
    AverageVoltage(0x2AE1, ValueType.Number),
    BatteryLevel(0x2A19, ValueType.Number),
    CurrentTime(0x2A2B, ValueType.Number),
    String(0x2BDE, ValueType.Text), //(Fixed String 64)
    Height(0x2A8E, ValueType.Number),
    Humidity(0x2A6F, ValueType.Number),
    Latitude(0x2AAE, ValueType.Number),
    Longitude(0x2AAF, ValueType.Number),
    LocationName(0x2AB5, ValueType.Text),
    ObjectName(0x2ABE, ValueType.Text),
    ObjectProperties(0x2AC4, ValueType.Text),
    ObjectID(0x2AC3, ValueType.Number),
    SensorLocation(0x2A5D, ValueType.Number),
    SerialNumberString(0x2A25, ValueType.Text),
    Refresh(0x2A31, ValueType.ActionButton), //(ScanRefresh)
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
                val bleUUID = cutUUIDIntoBLE_UUID(uuid)
                //log("bleUUID = $bleUUID")
                if(bleUUID.equals(value)) assignedNumber = it
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
    Number,
    ActionButton //meaning the value of the characteristic is not meant to be changed, it's just that a write operation can be done, in order to trigger an operation in the TTGO
}

private fun cutUUIDIntoBLE_UUID(uuid: UUID) : String { //UUID to Bluetooth SIG UUID
    return uuid.toString().substring(4, 8)
}
