package isel.seaspot.bluetooth

import java.util.*

const val maximumBytes = 512 //https://stackoverflow.com/a/38742859

data class Characteristic(
    val uuid: AssignedNumbersCharacteristics,
    val fullUUID: String,
    val value: ByteArray = ByteArray(0),
    val isWritable: Boolean = false,
    //val permissions: Int = 0 //The permission parameter specifies whether the characteristic value can be read and/or written by the client
) {
    init { require(value.size<=maximumBytes) }
    constructor(uuid: UUID, fullUUID: UUID, value: ByteArray, isWritable: Boolean = false) :
            this(AssignedNumbersCharacteristics.uuidToEnum(uuid), fullUUID.toString(), value, isWritable, )

    fun getFullUUID() = UUID.fromString(fullUUID)

    fun isNumber() = uuid.type==ValueType.Number
    fun isAction() = uuid.type==ValueType.ActionButton
}

data class Service(
    val uuid: AssignedNumbersService,
    val fullUUID: String,
    var characteristics: MutableList<Characteristic> = mutableListOf()
) {
    constructor(uuid: UUID, fullUUID: UUID, value: MutableList<Characteristic> = mutableListOf()) :
            this(AssignedNumbersService.uuidToEnum(uuid), fullUUID.toString(), value)
}

fun doesItContainField(fullInt: Int, field: CharacteristicField) : Boolean {
    if (field.code!=1){
        val isPotencyOf2 = field.code.and(field.code - 1) == 0
        if(!isPotencyOf2) throw IllegalArgumentException("The value of $field isn't a power of 2, meaning this propertyCode is probably incorrect") //see BluetoothGattCharacteristic.class for the backing of this claim of power of 2
    }
    val res = fullInt.and(field.code)
    return res==field.code
}
