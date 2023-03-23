package isel.seaspot.activities

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import isel.seaspot.bluetooth.BLE_Manager

class MainViewModel(bleManager: BLE_Manager) : ViewModel() {
    var bleManager by mutableStateOf(bleManager)
}