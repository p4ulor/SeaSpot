package isel.seaspot.bluetooth

import android.bluetooth.BluetoothGattCharacteristic.*

enum class Permissions(override val code: Int) : CharacteristicField{
    NONE(0),
    READ(PERMISSION_READ),
    WRITE(PERMISSION_WRITE);
}

enum class Properties(override val code: Int) : CharacteristicField {
    NONE(0),
    WRITE(PROPERTY_WRITE),
    READ(PROPERTY_READ);
}

interface CharacteristicField{
    val code: Int
}
