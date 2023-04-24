package isel.seaspot.screens

import android.annotation.SuppressLint
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import isel.seaspot.R
import isel.seaspot.activities.MainViewModel
import isel.seaspot.ui.elements.Button
import isel.seaspot.ui.elements.Header
import isel.seaspot.ui.elements.ListOfDevices
import isel.seaspot.utils.log
import isel.seaspot.utils.toast
import kotlinx.coroutines.launch

@Composable @SuppressLint("MissingPermission")
fun MainScreen(vm: MainViewModel, navController: NavController) {
    val ctx = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    Header("SeaSpot")

    Column(
        modifier = Modifier.fillMaxWidth().padding(paddingValues = PaddingValues(top = 150.dp)),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Row {
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
                    items(vm.devicesFound.toList()) {
                        ListOfDevices({
                            try {
                                vm.connect(it.first){
                                    coroutineScope.launch { //In order to avoid "java.lang.IllegalStateException: Method setCurrentState must be called on the main thread"
                                        navController.navigate(Screens.ConnectedDevice.routeName)
                                    }
                                }
                            } catch (e: Exception){
                                toast("$e", ctx)
                            }
                        }, it.first, if(it.second.name == null) "<${ctx.getString(R.string.no_name)}>" else it.second.name)
                    }
                }
            }
        }
    }
}
