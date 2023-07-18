package isel.seaspot.screens

import android.annotation.SuppressLint
import android.app.Application
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Settings
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.navigation.NavController
import isel.seaspot.R
import isel.seaspot.activities.MainViewModel
import isel.seaspot.ui.elements.Button
import isel.seaspot.ui.elements.Header
import isel.seaspot.ui.elements.ListOfDevices
import isel.seaspot.ui.theme.DarkBlue
import isel.seaspot.ui.theme.VeryLightBlue
import isel.seaspot.ui.theme.topBarIconBlue
import isel.seaspot.utils.log
import isel.seaspot.utils.readExpectedDeviceAddress
import isel.seaspot.utils.toast
import isel.seaspot.utils.writeExpectedDeviceAddress
import kotlinx.coroutines.launch

@Composable @SuppressLint("MissingPermission")
fun MainScreen(vm: MainViewModel, navController: NavController) {
    val ctx = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    var isDialogOpen by remember { mutableStateOf(false) }
    var isSnackbarOpen by remember { mutableStateOf(false) }
    var onSnackbarOk: () -> Unit by remember { mutableStateOf({}) }

    Column {
        TopAppBar(
            title = {
                Row(
                    Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp), Arrangement.End) {
                    IconButton(onClick = { isDialogOpen = !isDialogOpen }) {
                        Icon(
                            imageVector = Icons.Default.Settings,
                            contentDescription = "Settings",
                            tint = Color.White,
                        )
                    }

                }
            },
            backgroundColor = topBarIconBlue
        )

        Header("SeaSpot")
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(paddingValues = PaddingValues(top = 150.dp)),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Column(Modifier.padding(paddingValues = PaddingValues(top = 50.dp))) {
            Button({
                try {
                    vm.scanForDevices()
                }
                catch (e: SecurityException) {
                    log("Security exception, permissions weren't given")
                    toast(R.string.provide_permissions, ctx)
                }
            }, stringResource(R.string.turnOnBlue))
        }

        Row(modifier = Modifier.padding(vertical = 1.dp)) {
            if (vm.devicesFound.isNotEmpty()) {
                LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(vm.devicesFound.toList().sortedByDescending { it.second.name!=null }) {
                        ListOfDevices({ //it -> Pair.first = deviceAddress, Pair.second = BluetoothDevice
                            val onClick = {
                                log("will connect to device")
                                toast(R.string.connecting, ctx)
                                try {
                                    vm.connect(it.first){
                                        navController.navigate(Screens.ConnectedDevice.routeName)
                                    }
                                } catch (e: Exception){
                                    toast(R.string.failed, ctx)
                                    log("Connecting failed: $e")
                                }
                                Unit
                            }

                            if(it.first!=readExpectedDeviceAddress(ctx)){
                                log("Clicked on unregistered device")
                                onSnackbarOk = onClick
                                isSnackbarOpen = true
                            } else onClick()

                        }, it.first, if(it.second.name == null) "<${ctx.getString(R.string.no_name)}>" else it.second.name)
                    }
                }
            }
        }
    }

    if (isDialogOpen) {
        DialogScreen(onDialogDismiss = { isDialogOpen = false })
    }

    if(isSnackbarOpen){
        Snackbar(stringResource(R.string.note_dev_addr), {
            onSnackbarOk()
        }) {
            isSnackbarOpen = false
        }
    }
}

@Composable
fun DialogScreen(onDialogDismiss: () -> Unit) {
    val ctx = LocalContext.current
    val currentRegistredDevAddr = readExpectedDeviceAddress(ctx)
    var text by remember { mutableStateOf(currentRegistredDevAddr) }

    Dialog(onDismissRequest = { onDialogDismiss() }) {
        Card {
            Column(
                modifier = Modifier.padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(stringResource(R.string.expected_device_addr))
                TextField(
                    value = text,
                    onValueChange = { text = it },
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(16.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    Button(onClick = { onDialogDismiss() }) {
                        Text(stringResource(R.string.cancel))
                    }
                    Button(onClick = {
                        writeExpectedDeviceAddress(ctx, text)
                        onDialogDismiss()
                    }) {
                        Text(stringResource(R.string.ok))
                    }
                }
            }
        }
    }
}

@Composable
fun Snackbar(text: String, onSnackbarOk: () -> Unit, onDismiss: () -> Unit) {
    Snackbar(
        action = {
            Row {
                TextButton(onClick = {
                    log("snack bar ok")
                    onSnackbarOk()
                    onDismiss()
                }) {
                    Text(stringResource(R.string.ok))
                }
                TextButton(onClick = {
                    onDismiss()
                }) {
                    Text(stringResource(R.string.cancel))
                }
            }
        },
        modifier = Modifier.padding(16.dp)
    ) {
        Text(text)
    }
}
