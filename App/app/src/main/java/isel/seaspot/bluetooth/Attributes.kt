package isel.seaspot.bluetooth

import java.util.*

data class Characteristic(
    val uuid: AssignedNumbersCharacteristics,
    val fullUUID: String,
    val value: ByteArray = ByteArray(0)
) {
    constructor(uuid: UUID, fullUUID: UUID, value: ByteArray) :
            this(AssignedNumbersCharacteristics.uuidToEnum(uuid) ?: AssignedNumbersCharacteristics.Unknown, fullUUID.toString(), value)
}

data class Service(
    val uuid: AssignedNumbersService,
    val fullUUID: String,
    var characteristics: MutableList<Characteristic> = mutableListOf()
) {
    constructor(uuid: UUID, fullUUID: UUID, value: MutableList<Characteristic> = mutableListOf()) :
            this(AssignedNumbersService.uuidToEnum(uuid) ?: AssignedNumbersService.Unknown, fullUUID.toString(), value)
}