package isel.seaspot.activities

import android.annotation.SuppressLint
import android.app.Application
import android.bluetooth.BluetoothDevice
import android.content.Intent
import androidx.activity.result.ActivityResultLauncher
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.AndroidViewModel
import isel.seaspot.bluetooth.BLE_Manager

class MainViewModel(
    app: Application,
    handleResultOfAskingForBTEnabling: ActivityResultLauncher<Intent>
) : AndroidViewModel(app) {

    private val bleManager = BLE_Manager(app, handleResultOfAskingForBTEnabling)
    var devicesFound by mutableStateOf( hashMapOf<String, BluetoothDevice>())

    init {
        bleManager.postScan = {
            devicesFound = bleManager.bleDevices
        }
    }

    fun scanForDevices() = bleManager.scanForDevices()

    @SuppressLint("MissingPermission")
    fun connect(address: String) {
        val device = devicesFound.get(address) ?: throw Exception("Device not found for connection")
        bleManager.connectGatt(device)
    }

}