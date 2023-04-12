package isel.seaspot.activities

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Intent
import android.content.pm.ActivityInfo
import android.content.res.Configuration
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import isel.seaspot.R
import isel.seaspot.ui.element.Button
import isel.seaspot.ui.element.Header
import isel.seaspot.ui.element.ListOfDevices
import isel.seaspot.ui.theme.SeaSpotTheme
import isel.seaspot.utils.*


class MainActivity : ComponentActivity() {

    private val viewModel: MainViewModel by viewModels {
        viewModelInit {
            MainViewModel(application, handleResultOfAskingForBTEnabling)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MainScreen(viewModel)
        }
    }

    override fun onStart() {
        super.onStart()
        if(! haveThePermissionsBeenGranted(this)){
            askForPermissions(this)
        }
    }

    //https://stackoverflow.com/a/63654043/9375488 This must be declared here or it causes this https://stackoverflow.com/q/64476827/9375488
    private var handleResultOfAskingForBTEnabling = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            if (! isLocationOn(this)) {
                //Goes to settings. Easier approach. To enable GPS without existing the app, which requires more code, see: https://stackoverflow.com/q/29801368/9375488 https://youtu.be/nTgmnjg2pa0
                val intent = Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS)
                handleResultOfAskingForLocationEnabling.launch(intent)
            }
        }
    }

    private var handleResultOfAskingForLocationEnabling = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
        }
    }

    //Solely to disable screen rotation, and thus we won't need to handle it (I think)
    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
    }
}

@Composable @SuppressLint("MissingPermission")
fun MainScreen(vm: MainViewModel) {
    val ctx = LocalContext.current
    SeaSpotTheme {

        Header("SeaSpot")

        Column(
            modifier = Modifier
                .fillMaxWidth().padding(paddingValues = PaddingValues(top = 150.dp)) ,
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Row(modifier = Modifier.padding(vertical = 1.dp)) {
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
                        items(items = vm.devicesFound.toList()) {
                            ListOfDevices({
                                try {
                                    vm.connect(it.first)
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
}
