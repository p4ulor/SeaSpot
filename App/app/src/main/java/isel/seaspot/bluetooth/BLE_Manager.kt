package isel.seaspot.bluetooth

import android.annotation.SuppressLint
import android.bluetooth.*
import android.bluetooth.le.ScanCallback
import android.bluetooth.le.ScanFilter
import android.bluetooth.le.ScanResult
import android.bluetooth.le.ScanSettings
import android.content.Context
import android.content.Intent
import android.os.Handler
import androidx.activity.result.ActivityResultLauncher
import isel.seaspot.R
import isel.seaspot.utils.*
import java.util.*
import java.util.concurrent.TimeUnit
import java.util.concurrent.locks.Condition
import java.util.concurrent.locks.ReentrantLock
import kotlin.concurrent.withLock

//https://developer.android.com/guide/topics/connectivity/bluetooth/setup
//https://developer.android.com/guide/topics/connectivity/bluetooth/find-ble-devices
//https://punchthrough.com/android-ble-guide/#:~:text=device%20from%20there.-,Implementing%20a%20basic%20queuing%20mechanism,-In%20this%20section
@SuppressLint("MissingPermission") //because we already call askForPermissions
class BLE_Manager(
    private val ctx: Context,
    private val handleResultOfAskingForBTEnabling: ActivityResultLauncher<Intent>
){
    private val bluetoothManager: BluetoothManager = ctx.getSystemService(BluetoothManager::class.java)
    private val bluetoothAdapter: BluetoothAdapter? = bluetoothManager.adapter
    private var currentlyConnectedDevice: BluetoothDevice? = null
    private var currentlyConnectedDeviceGatt: BluetoothGatt? = null

    private var scanning = false
    private val handler = Handler()
    private val SCAN_PERIOD: Long = 5000

    var bleDevices = hashMapOf<String, BluetoothDevice>()

    private fun bluetoothLeScanner() = bluetoothAdapter?.bluetoothLeScanner //if bluetooth is not turned on, this value will be null
    private fun isBluetoothOn() = bluetoothAdapter?.isEnabled == true

    var postScan: () -> Unit = {}
    var onConnectSuccessful: () -> Unit = {}
    var onServicesDiscovered: () -> Unit = {}
    var onDisconnect: (msg: String) -> Unit = {}

    private fun turnOnBluetooth(){
        log("---turnOnBluetooth---")
        if (bluetoothAdapter == null) {
            toast(R.string.device_no_bluet, ctx)
            return
        }

        if (! isBluetoothOn()) {
            val enableBtIntent = Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE)
            handleResultOfAskingForBTEnabling.launch(enableBtIntent)
        }
        //toast("start leScanner = "+bluetoothLeScanner().toString(), ctx)
    }

    @Throws(SecurityException::class)
    fun scanForDevices() { // Stops scanning after a pre-defined scan period.
        log("---scanLeDevice---")
        if(! isBluetoothOn()) turnOnBluetooth()
        else if (!scanning) {
            handler.postDelayed({
                scanning = false
                postScan()
                toast(R.string.scanningDone, ctx)
                bluetoothLeScanner()?.stopScan(leScanCallback)
            }, SCAN_PERIOD)
            scanning = true
            log("---started scanning---")
            //log("LeScanner = "+bluetoothLeScanner().toString())
            toast(R.string.scanning, ctx)

            //Configurations of the scan methods
            val filters: MutableList<ScanFilter> = ArrayList()
            val scanFilterBuilder = ScanFilter.Builder()
            filters.add(scanFilterBuilder.build())

            val settingsBuilder = ScanSettings.Builder()
            settingsBuilder.setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
            settingsBuilder.setMatchMode(ScanSettings.MATCH_MODE_AGGRESSIVE)

            bluetoothLeScanner()?.startScan(null, settingsBuilder.build(), leScanCallback)
        } else {
            log("Already scanning")
        }
    }

    private fun stopScanning(){
        if(scanning){
            scanning = false
            bluetoothLeScanner()?.stopScan(leScanCallback)
        }
    }

    //Note: Location need to be turned in order for the ScanCallback to work ... https://stackoverflow.com/a/35476512/9375488
    private val leScanCallback: ScanCallback = object : ScanCallback() {
        override fun onScanFailed(errorCode: Int) {
            super.onScanFailed(errorCode)
            toast(R.string.scanError, ctx)
        }

        override fun onScanResult(callbackType: Int, result: ScanResult) { //Note: this method is called multiple times
            try {
                super.onScanResult(callbackType, result)
                bleDevices.set(result.device.address, result.device)
                log(result.toString())
            } catch (e: Exception){
                log("Exception occurred in onScanResult -> $e")
            }
        }

        override fun onBatchScanResults(results: List<ScanResult>) {
            log("onBatchScanResults")
            for (sr in results) {
                log("ScanResult - Results $sr")
            }
        }
    }

    fun connectGatt(device: BluetoothDevice, onConnectSuccessful: () -> Unit, onServicesDiscovered: () -> Unit) { //https://developer.android.com/guide/topics/connectivity/bluetooth/connect-gatt-server
        stopScanning()
        this.onConnectSuccessful = onConnectSuccessful
        this.onServicesDiscovered = onServicesDiscovered
        currentlyConnectedDeviceGatt = device.connectGatt(ctx, false, bluetoothGattCallback, BluetoothDevice.TRANSPORT_LE) //autoConnect = false because -> https://medium.com/@martijn.van.welie/making-android-ble-work-part-2-47a3cdaade07#:~:text=Autoconnect%20only%20works%20for%20cached%20or%20bonded%20devices!
        currentlyConnectedDevice = device
    }

    fun disconnect() = currentlyConnectedDeviceGatt?.disconnect()
    fun getConnectedDevice() = currentlyConnectedDevice
    fun getConnectedDeviceGatt() = currentlyConnectedDeviceGatt

    private val bluetoothGattCallback: BluetoothGattCallback = object : BluetoothGattCallback(){
        override fun onConnectionStateChange(gatt: BluetoothGatt?, status: Int, newState: Int) {
            if(status == BluetoothGatt.GATT_SUCCESS) { //it means the connection state change was the result of a successful operation like connecting but it could also be because you wanted to disconnect. https://medium.com/@martijn.van.welie/making-android-ble-work-part-2-47a3cdaade07#:~:text=it%20means%20the%20connection%20state
                log("GATT_SUCCESS")
                when (newState) {
                    BluetoothProfile.STATE_CONNECTED -> {
                        log("STATE_CONNECTED")
                        val bondState = currentlyConnectedDevice?.bondState //https://medium.com/@martijn.van.welie/making-android-ble-work-part-2-47a3cdaade07#:~:text=int%20bondstate%20%3D-,device.getBondState()%3B,-The%20bond%20state
                        if(bondState == BluetoothDevice.BOND_NONE || bondState == BluetoothDevice.BOND_BONDED) {
                            //handler.postDelayed({
                                log("BOND_BONDED")
                                val areThereServices = gatt?.discoverServices() //https://developer.android.com/reference/android/bluetooth/BluetoothGatt#discoverServices()
                                if(areThereServices == true) log("Will call onServicesDiscovered()")
                                else log("No services")
                            //}, 1000)
                        } else if (bondState == BluetoothDevice.BOND_BONDING) {
                            log("waiting for bonding to complete")
                        }
                    }
                    BluetoothProfile.STATE_CONNECTING -> {
                        log("STATE_CONNECTING")
                    }
                    else -> { //STATE_DISCONNECTED or STATE_DISCONNECTING
                        gatt?.close()
                        log("Disconnected, State = $newState")
                    }
                }
            } else {
                log("Unexpected error occurred in onConnectionStateChange. Status = $status. Gatt = $gatt")
                gatt?.close()
                currentlyConnectedDeviceGatt = null
                currentlyConnectedDevice = null
                clearServicesCache()
            }
        }

        override fun onServicesDiscovered(gatt: BluetoothGatt?, status: Int) {
            if (status == BluetoothGatt.GATT_SUCCESS) {
                log("onServicesDiscovered received -> GATT_SUCCESS")
                log("Services = ${gatt?.services}")
                val x = gatt?.services?.get(0)
                log("Characteristics - ${x?.characteristics}")
                gatt?.readCharacteristic(x?.characteristics?.get(0))
                onServicesDiscovered()
            }
            else log("onServicesDiscovered received: $status")
        }

        override fun onCharacteristicRead(gatt: BluetoothGatt, characteristic: BluetoothGattCharacteristic, value: ByteArray, status: Int) {
            runBlockingCallback {
                when (status) {
                    BluetoothGatt.GATT_SUCCESS -> {
                        log("characteristic.value -> String = ${value.decodeToString()}. Raw = ${value}. uuid = ${characteristic.uuid}")
                        characteristicsRead.add(value)
                    }
                    BluetoothGatt.GATT_READ_NOT_PERMITTED -> {
                        log("onCharacteristicRead received GATT_READ_NOT_PERMITTED")
                    }
                    else -> {
                        log("onCharacteristicRead failed? received: $status")
                    }
                }
            }
        }

        override fun onCharacteristicWrite(gatt: BluetoothGatt?, characteristic: BluetoothGattCharacteristic?, status: Int) {
            log("onCharacteristicWrite")
            log("Characteristic value: ${characteristic?.value?.decodeToString()}")
            log("status = $status")
            super.onCharacteristicWrite(gatt, characteristic, status)
        }

        override fun onCharacteristicChanged(gatt: BluetoothGatt?, characteristic: BluetoothGattCharacteristic?) {
            log("onCharacteristicChanged()")
        }

        override fun onDescriptorRead(gatt: BluetoothGatt, descriptor: BluetoothGattDescriptor, status: Int, value: ByteArray) { //https://developer.android.com/reference/android/bluetooth/BluetoothGattCallback#onDescriptorRead(android.bluetooth.BluetoothGatt,%20android.bluetooth.BluetoothGattDescriptor,%20int,%20byte[])
            log("Value = ${value.decodeToString()}")
        }
    }

    //Command queueing variables & methods:
    private val lock = ReentrantLock()
    private var isOperationRunning = false
    private var threadsWaiting: Condition = lock.newCondition()
    private var characteristicsRead = mutableListOf<ByteArray>()

    fun readCharacteristics(characteristic: List<BluetoothGattCharacteristic>) : List<ByteArray>{
        try {
            characteristicsRead.clear()
            log("readCharacteristics ${Thread.currentThread()}")
            lock.withLock{
                characteristic.forEach{
                    while(true){ //todo dont make infinite while
                        if(!isOperationRunning) {
                            log("Will readCharacteristic")
                            isOperationRunning = true
                            currentlyConnectedDeviceGatt?.readCharacteristic(it)
                            break
                        }
                        log("Will wait")
                        threadsWaiting.await(1, TimeUnit.SECONDS)
                        log("wokeup")
                    }
                }
                if(isOperationRunning) threadsWaiting.await() //💡
                return characteristicsRead
            }
        } catch (e: Exception) {
            log("executeCharacteristicRead exception: $e")
            return mutableListOf()
        }
    }

    private fun runBlockingCallback(operation: () -> Unit){ //Utility func. Meant be used when we want to make many BLE operations at the same time or to sync the function that call a BLE callback with it's completion state
        operation()
        lock.withLock {
            isOperationRunning = false
            log("Finished, will signal")
            threadsWaiting.signal()
        }
    }

    private fun clearServicesCache() : Boolean { //https://medium.com/@martijn.van.welie/making-android-ble-work-part-2-47a3cdaade07#:~:text=the%20services%0A...-,Caching%20of%20services,-The%20Android%20stack
        var result = false
        log("Will try to clear cache")
        try {
            val refreshMethod = currentlyConnectedDevice?.javaClass?.getMethod("refresh")
            if (refreshMethod != null) {
                result = refreshMethod.invoke(currentlyConnectedDevice) as Boolean
            }
        } catch (e: Exception) {
            log("ERROR: Could not invoke refresh method")
        }
        return result
    }

    //Later
    fun setCharacteristicNotification(characteristic: BluetoothGattCharacteristic, enabled: Boolean) { //https://developer.android.com/guide/topics/connectivity/bluetooth/transfer-ble-data#notification
        currentlyConnectedDeviceGatt?.let { gatt ->
            gatt.setCharacteristicNotification(characteristic, enabled)

            val descriptor = characteristic.getDescriptor(UUID.fromString("SampleGattAttributes.CLIENT_CHARACTERISTIC_CONFIG"))
            descriptor.value = BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE
            gatt.writeDescriptor(descriptor)
        } ?: run {
            log("BluetoothGatt not initialized")
        }
    }
}

fun getCharacteristic(services: List<BluetoothGattService>, service: Service, characUUID: UUID) : BluetoothGattCharacteristic? {
    val thisService = services.find {
        it.uuid.toString()==service.fullUUID //more accurate search, in case it's an Unknown service
    }
    return thisService?.getCharacteristic(characUUID)
}
