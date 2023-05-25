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
import androidx.lifecycle.viewModelScope
import androidx.navigation.NavHostController
import isel.seaspot.R
import isel.seaspot.bluetooth.BLE_Manager
import isel.seaspot.screens.Screens
import isel.seaspot.utils.log
import isel.seaspot.utils.toast
import kotlinx.coroutines.launch

class MainViewModel(
    app: Application, //I provide the app context not activity context (this last one is more susceptible to memory leaks) https://stackoverflow.com/a/4128799
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
            viewModelScope.launch {//coroutine to avoid java.lang.RuntimeException: Can't toast on a thread that has not called Looper.prepare()
                log("bleManager.onDisconnect -> $it")
                toast(R.string.disconnected, app)
                navController.popBackStack().also {
                    log("poppedBack -> $it. Curr destination = ${navController.currentDestination?.navigatorName}")
                    if(navController.currentDestination?.navigatorName==null || !it){
                        log("Some android state error occurred, going to home by default")
                        navController.navigate(Screens.Home.routeName)
                    }
                }
            }
        }
    }

    @SuppressLint("MissingPermission")
    fun connect(address: String, onServicesDiscovered: () -> Unit) {
        val device = devicesFound.get(address) ?: throw Exception("Device not found for connection")
        bleManager.connectGatt(device,
        {
           log("connected")
        },
        {
            viewModelScope.launch { //In order to avoid "java.lang.IllegalStateException: Method setCurrentState must be called on the main thread". Because it's called in the bleCallback thread
                onServicesDiscovered()
            }
        })
    }

    fun scanForDevices() = bleManager.scanForDevices()
    fun disconnect() = bleManager.disconnect()
    fun getConnectedDevice() = bleManager.getConnectedDevice()
    fun getConnectedDeviceGatt() = bleManager.getConnectedDeviceGatt()
    fun getConnectedDeviceServices() = bleManager.getConnectedDeviceServices()
    fun readCharacteristics(characteristics: List<BluetoothGattCharacteristic>) = bleManager.readCharacteristics(characteristics)
}
