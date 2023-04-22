package isel.seaspot.screens

import android.annotation.SuppressLint
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.Card
import androidx.compose.material.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import isel.seaspot.activities.MainViewModel
import isel.seaspot.ui.element.Button
import isel.seaspot.ui.element.HeaderText
import isel.seaspot.R

@Composable @SuppressLint("MissingPermission")
fun ConnectedDeviceScreen(vm: MainViewModel?, navController: NavHostController?) {
    var openChracteristics by remember {
        mutableStateOf(false)
    }

    Column(Modifier.fillMaxWidth().fillMaxHeight().padding(vertical = 40.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        HeaderText("Connected to")
        HeaderText("${vm?.getConnectedDevice()?.name}")
    }

    LazyColumn(
        Modifier.fillMaxWidth().padding(paddingValues = PaddingValues(top = 150.dp, start = 5.dp, end = 5.dp)),
        verticalArrangement = Arrangement.spacedBy(8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        val gatt = vm?.getConnectedDeviceGatt()
        val services = gatt?.services ?: mutableListOf()
        items(services) {
            Card(Modifier.fillMaxWidth().padding(5.dp).clickable {
                        openChracteristics = !openChracteristics
                    },
                elevation = 20.dp
            ) {
                Column (Modifier.padding(if(openChracteristics) 20.dp else 5.dp)) {
                    Text("${stringResource(R.string.service)}: ${it.uuid}", Modifier.padding(5.dp))
                    if(openChracteristics) {
                        Card(Modifier.fillMaxSize().padding(5.dp), elevation = 10.dp) {
                            Column(Modifier.fillMaxHeight(), verticalArrangement = Arrangement.spacedBy(8.dp)){
                                it.characteristics.forEach {
                                    val characteristic = it
                                    Column(Modifier.fillMaxHeight(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                        Text("${stringResource(R.string.characteristic)}: ${characteristic.uuid}")
                                        Column(Modifier.fillMaxHeight(), verticalArrangement = Arrangement.spacedBy(8.dp)){
                                            characteristic.descriptors.forEach{
                                                Text("${stringResource(R.string.descriptor)}: ${it.uuid}. ${gatt?.readDescriptor(it)}") //it.value is deprecated, so it always returns null, https://developer.android.com/reference/android/bluetooth/BluetoothGattDescriptor#getValue() -----> https://developer.android.com/reference/android/bluetooth/BluetoothGatt#readDescriptor(android.bluetooth.BluetoothGattDescriptor)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    Column(
        Modifier
            .fillMaxWidth()
            .fillMaxHeight()
            .padding(PaddingValues(bottom = 50.dp)),
        verticalArrangement = Arrangement.Bottom,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Button({
            vm?.disconnect()
            navController?.popBackStack()
        }, "Disconnect")
    }
}

@Composable @Preview
fun ConnectedDeviceScreenPreview() {
    ConnectedDeviceScreen(null, null) //Best way to be able to solve the necessity of the arguments...
}
