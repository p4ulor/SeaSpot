package isel.seaspot.activities

import android.app.Activity
import android.content.Intent
import android.content.pm.ActivityInfo
import android.content.res.Configuration
import android.location.LocationRequest
import android.os.Bundle
import android.provider.Settings
import android.renderscript.RenderScript.Priority
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import isel.seaspot.bluetooth.BLE_Manager
import isel.seaspot.ui.theme.SeaSpotTheme
import isel.seaspot.utils.isLocationOn
import isel.seaspot.utils.log
import isel.seaspot.utils.toast
import isel.seaspot.utils.viewModelInit


class MainActivity : ComponentActivity() {

    private val viewModel: MainViewModel by viewModels {
        viewModelInit {
            MainViewModel(BLE_Manager(this, handleResultOfAskingForBTEnabling))
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MainScreen(viewModel)
        }
    }

    //https://stackoverflow.com/a/63654043/9375488 This must be declared here or it causes this https://stackoverflow.com/q/64476827/9375488
    private var handleResultOfAskingForBTEnabling = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            if(! isLocationOn(this)){
                //Goes to settings. Easier approach. To enable GPS without existing the app, which requires more code, see: https://stackoverflow.com/q/29801368/9375488 https://youtu.be/nTgmnjg2pa0
                val intent = Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS)
                handleResultOfAskingForLocationEnabling.launch(intent)
            }
        }
    }

    private var handleResultOfAskingForLocationEnabling = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
        }
    }

    //Solely to disable screen rotation, and thus we won't need to handle it (I think)
    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
    }
}

@Composable
fun MainScreen(vm: MainViewModel) {
    SeaSpotTheme {
        Surface(
            color = MaterialTheme.colors.background
        ) {
            Header("SeaSpot")
        }

        Column(
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Row {
                Button(onClick = {
                    vm.bleManager.scanLeDevice()
                }){
                    Text("Turn on bluetooth and scan for devices")
                }
            }

            Row (modifier = Modifier.padding(vertical = 20.dp)) {
                if(vm.devicesFound.isNotEmpty()){
                    LazyColumn (verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        items(items = vm.devicesFound.toList()){
                            Button(onClick = {

                            }) {
                                Text(text = "Addr: ${it.first}, name: ${it.second}",
                                    fontSize = 24.sp,
                                    modifier = Modifier.fillMaxHeight(),
                                    textAlign = TextAlign.Center,
                                    color = Color.White
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun Header(s: String) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .fillMaxHeight(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = s
        )
    }
}
