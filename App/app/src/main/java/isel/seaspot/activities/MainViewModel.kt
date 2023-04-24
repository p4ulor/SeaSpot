package isel.seaspot.activities

import android.annotation.SuppressLint
import android.app.Application
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothGattCharacteristic
import android.content.Intent
import androidx.activity.result.ActivityResultLauncher
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.AndroidViewModel
import androidx.navigation.NavHostController
import isel.seaspot.bluetooth.BLE_Manager

class MainViewModel(
    app: Application,
    handleResultOfAskingForBTEnabling: ActivityResultLauncher<Intent>,
    navController: NavHostController,
) : AndroidViewModel(app) {

    private val bleManager = BLE_Manager(app, handleResultOfAskingForBTEnabling)
    var devicesFound by mutableStateOf(hashMapOf<String, BluetoothDevice>())

    init {
        bleManager.postScan = {
            val devices = hashMapOf<String, BluetoothDevice>() //This is needed in order for the mutableStateOf() to detect that the reference changed, and thus update the view
            bleManager.bleDevices.forEach {
                devices.set(it.key, it.value)
            }
            devicesFound = devices
        }

        bleManager.onDisconnect = {

        }
    }

    fun scanForDevices() = bleManager.scanForDevices()

    @SuppressLint("MissingPermission")
    fun connect(address: String, onSuccess: () -> Unit) {
        val device = devicesFound.get(address) ?: throw Exception("Device not found for connection")
        bleManager.connectGatt(device, {}, {
            onSuccess()
        })
    }

    fun disconnect() = bleManager.disconnect()
    fun getConnectedDevice() = bleManager.getConnectedDevice()
    fun getConnectedDeviceGatt() = bleManager.getConnectedDeviceGatt()
    fun readCharacteristics(characteristics: List<BluetoothGattCharacteristic>) = bleManager.readCharacteristics(characteristics)
}