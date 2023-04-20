package isel.seaspot.screens

import android.annotation.SuppressLint
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import isel.seaspot.activities.MainViewModel
import isel.seaspot.ui.element.Button
import isel.seaspot.ui.element.MediumHeader

@Composable @SuppressLint("MissingPermission")
fun ConnectedDeviceScreen(vm: MainViewModel?, navController: NavHostController?) {
    MediumHeader("Connected to ${vm?.connectedDevice?.name}")
    Column(
        modifier = Modifier.fillMaxWidth().fillMaxHeight().padding(PaddingValues(bottom = 50.dp)),
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
