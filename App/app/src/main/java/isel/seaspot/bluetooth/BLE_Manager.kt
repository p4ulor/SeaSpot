package isel.seaspot.bluetooth

import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothManager
import android.bluetooth.le.ScanCallback
import android.bluetooth.le.ScanFilter
import android.bluetooth.le.ScanResult
import android.bluetooth.le.ScanSettings
import android.content.Intent
import android.os.Handler
import androidx.activity.ComponentActivity
import androidx.activity.result.ActivityResultLauncher
import isel.seaspot.R
import isel.seaspot.utils.*

//https://developer.android.com/guide/topics/connectivity/bluetooth/setup
//https://developer.android.com/guide/topics/connectivity/bluetooth/find-ble-devices
@SuppressLint("MissingPermission") //because we already call askForPermissions
class BLE_Manager(
    private val activity: ComponentActivity,
    private val handleResultOfAskingForBTEnabling: ActivityResultLauncher<Intent>
){
    var postScan: () -> Unit = {}
    private val bluetoothManager: BluetoothManager = activity.getSystemService(BluetoothManager::class.java)
    private val bluetoothAdapter: BluetoothAdapter? = bluetoothManager.adapter

    private var scanning = false
    private val handler = Handler()
    private val SCAN_PERIOD: Long = 10000

    var bleDevices = hashMapOf<String, String>()

    init {
        if(! haveThePermissionsBeenGranted(activity)){
            askForPermissions(activity)
        }
    }

    private fun bluetoothLeScanner() = bluetoothAdapter?.bluetoothLeScanner //if bluetooth is not turned on, this value will be null
    private fun isBluetoothOn() = bluetoothAdapter?.isEnabled == true

    private fun start(){
        log("---start---")
        if (bluetoothAdapter == null) {
            toast(R.string.device_no_bluet, activity)
            return
        }

        if (! isBluetoothOn()) {
            val enableBtIntent = Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE)
            handleResultOfAskingForBTEnabling.launch(enableBtIntent)
        }

        toast("start leScanner = "+bluetoothLeScanner().toString(), activity)
    }

    fun scanLeDevice() { // Stops scanning after a pre-defined scan period.
        log("---scanLeDevice---")
        try {
            if(! isBluetoothOn()) start()
            else if (!scanning) {
                handler.postDelayed({
                    scanning = false
                    postScan()
                    toast(R.string.scanningDone, activity)
                    bluetoothLeScanner()?.stopScan(leScanCallback)
                }, SCAN_PERIOD)
                scanning = true
                log("---started scanning---")
                //log("LeScanner = "+bluetoothLeScanner().toString())
                toast(R.string.scanning, activity)

                //EXPLORING TO FIND MORE DEVICES
                val filters: MutableList<ScanFilter> = ArrayList()
                val scanFilterBuilder = ScanFilter.Builder()
                filters.add(scanFilterBuilder.build())

                val settingsBuilder = ScanSettings.Builder()

                settingsBuilder.setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
                settingsBuilder.setMatchMode(ScanSettings.MATCH_MODE_AGGRESSIVE)
                // END EXPLORING TO FIND MORE DEVICES

                bluetoothLeScanner()?.startScan(null, settingsBuilder.build(), leScanCallback)
            } else {
                scanning = false
                bluetoothLeScanner()?.stopScan(leScanCallback)
            }
        } catch (e: SecurityException){
            log("Security exception, permissions weren't given")
            //askForPermissions(activity) //Note: asking for the permissions again, won't work purposely https://stackoverflow.com/a/67834147/9375488
            toast(R.string.provide_permissions, activity)
        }
    }

    //Note: Location need to be turned in order for the ScanCallback to work ... https://stackoverflow.com/a/35476512/9375488
    private val leScanCallback: ScanCallback = object : ScanCallback() {
        override fun onScanFailed(errorCode: Int) {
            super.onScanFailed(errorCode)
            toast(R.string.scanError, activity)
        }

        override fun onScanResult(callbackType: Int, result: ScanResult) { //Note: this method is called multiple times
            try {
                super.onScanResult(callbackType, result)
                val name = if(result.device.name == null) "<${activity.getString(R.string.no_name)}>" else result.device.name
                bleDevices.set(result.device.address, name)
                log(result.toString())
            } catch (e: Exception){
                log("Exception occured in onScanResult -> $e")
            }
        }

        override fun onBatchScanResults(results: List<ScanResult>) {
            log("BLE// onBatchScanResults")
            for (sr in results) {
                log("ScanResult - Results $sr")
            }
        }
    }
}