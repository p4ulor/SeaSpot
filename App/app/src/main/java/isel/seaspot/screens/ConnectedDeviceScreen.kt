package isel.seaspot.screens

import android.annotation.SuppressLint
import android.bluetooth.BluetoothGattCharacteristic
import android.bluetooth.BluetoothGattService
import android.bluetooth.BluetoothStatusCodes
import android.os.Build
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.Card
import androidx.compose.material.Text
import androidx.compose.material.TextField
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import isel.seaspot.R
import isel.seaspot.activities.MainViewModel
import isel.seaspot.bluetooth.*
import isel.seaspot.bluetooth.Properties
import isel.seaspot.ui.elements.Button
import isel.seaspot.ui.elements.HeaderText
import isel.seaspot.utils.log
import isel.seaspot.utils.toast
import kotlinx.coroutines.launch
import java.util.*

@Composable @SuppressLint("MissingPermission")
fun ConnectedDeviceScreen(vm: MainViewModel?, navController: NavHostController?) {
    val ctx = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    val servicesOpen by remember {
        mutableStateOf(mutableStateMapOf<String, Boolean>()) //String = service uuid, Boolean = isOpen. This type of MutableState will update the UI when the list changes
    }

    var servicesData by remember {
        mutableStateOf(mutableListOf<Service>()) //This type of MutableState will need to be set w/ a new obj to update the UI
    }

    Column(Modifier.fillMaxWidth().fillMaxHeight().padding(vertical = 40.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        HeaderText("Connected to")
        HeaderText("${vm?.getConnectedDevice()?.name}")
        Button({
            vm?.disconnect()
            navController?.popBackStack()
        }, stringResource(R.string.disconnect))

        LazyColumn(
            Modifier.fillMaxWidth().padding(paddingValues = PaddingValues(start = 5.dp, end = 5.dp)),
            verticalArrangement = Arrangement.spacedBy(8.dp), horizontalAlignment = Alignment.CenterHorizontally) {

            val gatt = vm?.getConnectedDeviceGatt()
            val services = gatt?.services ?: mutableListOf()

            services.forEach {
                val uuid = it.uuid.toString()
                val x = servicesOpen.get(uuid)
                if(x==null) servicesOpen.set(uuid, false)
            }

            items(services) { service ->
                Card(Modifier.fillMaxWidth().padding(5.dp).clickable {
                    val isItOpen = servicesOpen.get(service.uuid.toString())
                    if(isItOpen!=null){
                        servicesOpen.set(service.uuid.toString(), !isItOpen)
                        if(!isItOpen){ //If it wasn't open, (and now it has been set to open), get the characteristic values
                            coroutineScope.launch {
                                log("Will executeCharacteristicRead ${service.uuid}")
                                val gattCharacteristics = service.characteristics.toMutableList() //to create a copy

                                val characteristicsOfThisService = mutableListOf<Characteristic>()

                                val charsValues = vm?.readCharacteristics(gattCharacteristics) ?: mutableListOf() //blocking

                                log("Values of the characteristics obtained: ${charsValues.map { it.decodeToString() }}")
                                gattCharacteristics.forEachIndexed { index, charac ->

                                    log("properties = ${charac.properties}")
                                    log("permissions = ${charac.permissions}") //There's some problem with the reading of permissions https://github.com/pauldemarco/flutter_blue/issues/6 https://stackoverflow.com/questions/23674668/android-bluetooth-low-energy-characteristic-getpermissions-returns-0
                                    log("Does it contain property read? ${doesItContainField(charac.properties, Properties.READ)}")
                                    log("Does it contain property write? ${doesItContainField(charac.properties, Properties.WRITE)}")
                                    log("Does it contain permission read? ${doesItContainField(charac.permissions, Permissions.READ)}")
                                    log("Does it contain permission write? ${doesItContainField(charac.permissions, Permissions.WRITE)}")
                                    val isWritable = doesItContainField(charac.properties, Properties.WRITE)

                                    characteristicsOfThisService.add(Characteristic(charac.uuid, charac.uuid, charsValues.get(index), isWritable))
                                }
                                val currentServiceData = Service(service.uuid, service.uuid, characteristicsOfThisService)

                                servicesData.removeIf {
                                    it.uuid == currentServiceData.uuid
                                }
                                val newServicesData = servicesData.toMutableList() //to create a copy
                                newServicesData.add(currentServiceData)

                                servicesData = newServicesData
                            }
                        }
                    }
                },
                    elevation = 20.dp
                ) {
                    val isThisServiceViewOpen = isThisServiceOpen(servicesOpen, service)
                    Column (Modifier.padding(if(isThisServiceViewOpen) 20.dp else 5.dp)) {
                        Text("${stringResource(R.string.service)}: ${service.uuid}", Modifier.padding(5.dp))
                        if(isThisServiceViewOpen) {
                            Card(Modifier.fillMaxSize().padding(5.dp), elevation = 10.dp) {
                                Column(Modifier.fillMaxHeight(), verticalArrangement = Arrangement.spacedBy(8.dp)){
                                    val service = servicesData.find { it.fullUUID==service.uuid.toString() }
                                    service?.characteristics?.forEach {
                                        val characteristic = it

                                        Column(Modifier.fillMaxHeight(), verticalArrangement = Arrangement.spacedBy(8.dp)) {

                                            Text("${stringResource(R.string.characteristic)}: ${characteristic.uuid}")
                                            if(characteristic.isWritable) {
                                                var text by rememberSaveable { mutableStateOf(characteristic.value.decodeToString()) }
                                                TextField(text,
                                                    onValueChange = {
                                                        text = it
                                                    }
                                                )
                                                val success = "${stringResource(R.string.success)}" //because "@Composable invocations can only happen from the context of a @Composable function"
                                                val failed = "${stringResource(R.string.failed)}"
                                                Button({

                                                    val charac = getCharacteristic(services, service, characteristic.getFullUUID())

                                                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) { //https://developer.android.com/reference/android/bluetooth/BluetoothGatt#writeCharacteristic(android.bluetooth.BluetoothGattCharacteristic,%20byte[],%20int)
                                                        log("Running w/ ${Build.VERSION_CODES.TIRAMISU}")
                                                        val code = gatt?.writeCharacteristic(charac!!, text.toByteArray(), BluetoothGattCharacteristic.WRITE_TYPE_DEFAULT)
                                                        if(code == BluetoothStatusCodes.SUCCESS) toast("success", ctx) else toast("failed", ctx)
                                                    } else { //https://developer.android.com/reference/android/bluetooth/BluetoothGattCharacteristic#setValue(byte[])
                                                        log("Running bellow ${Build.VERSION_CODES.TIRAMISU}")
                                                        val worked = charac?.setValue(text.toByteArray())
                                                        if(worked==true) toast(success, ctx) else toast(failed, ctx)
                                                    }
                                                }, "${stringResource(R.string.edit)}")
                                            }
                                            else Text("${stringResource(R.string.value)}: ${characteristic.value.decodeToString()}")

                                            //Displays descriptors, we might not end up using descriptors?
                                            /*Column(Modifier.fillMaxHeight(), verticalArrangement = Arrangement.spacedBy(8.dp)){
                                                characteristic.descriptors.forEach{
                                                    Text("${stringResource(R.string.descriptor)}: ${it.uuid}. ${gatt?.readDescriptor(it)}") //it.value is deprecated, so it always returns null, https://developer.android.com/reference/android/bluetooth/BluetoothGattDescriptor#getValue() -----> https://developer.android.com/reference/android/bluetooth/BluetoothGatt#readDescriptor(android.bluetooth.BluetoothGattDescriptor)
                                                }
                                            }*/

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

fun isThisServiceOpen(servicesOpen: MutableMap<String, Boolean>, service: BluetoothGattService?): Boolean {
    return servicesOpen.any {
        it.value && it.key == service?.uuid.toString()
    }
}

@Composable @Preview
fun ConnectedDeviceScreenPreview() {
    ConnectedDeviceScreen(null, null) //Best way to be able to solve the necessity of the arguments...
}
