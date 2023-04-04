package isel.seaspot.bluetooth

import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothManager
import android.bluetooth.le.ScanCallback
import android.bluetooth.le.ScanResult
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
                    bluetoothLeScanner()?.stopScan(leScanCallback)
                }, SCAN_PERIOD)
                scanning = true
                log("---started scanning---")
                toast("LeScanner = "+bluetoothLeScanner().toString(), activity)
                bluetoothLeScanner()?.startScan(leScanCallback)
            } else {
                scanning = false
                bluetoothLeScanner()?.stopScan(leScanCallback)
            }
        } catch (e: SecurityException){
            log("Security exceptions, permissions weren't given")
            //askForPermissions(activity) //Note: asking for the permissions again, won't work purposely https://stackoverflow.com/a/67834147/9375488
            toast(R.string.provide_permissions, activity)
        }
    }

    //Note: Location need to be turned in order for the ScanCallback to work ... https://stackoverflow.com/a/35476512/9375488
    private val leScanCallback: ScanCallback = object : ScanCallback() {
        override fun onScanFailed(errorCode: Int) {
            super.onScanFailed(errorCode)
            toast("failed", activity)
        }

        override fun onScanResult(callbackType: Int, result: ScanResult) { //Note: this method is called multiple times
            try {
                super.onScanResult(callbackType, result)
                bleDevices.set(result.device.address, result.device.name)
                log(result.toString())
            } catch (e: Exception){

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