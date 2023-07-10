package isel.seaspot.activities

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
import androidx.navigation.NavHostController
import androidx.navigation.compose.rememberNavController
import isel.seaspot.currTTGOdevID
import isel.seaspot.screens.NavGraph
import isel.seaspot.screens.Screens
import isel.seaspot.screens.checkIfScreenNamesAreGood
import isel.seaspot.utils.*
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch


class MainActivity : ComponentActivity() {

    lateinit var navController: NavHostController

    private val viewModel: MainViewModel by viewModels {
        viewModelInit {
            MainViewModel(application, handleResultOfAskingForBTEnabling, navController)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        checkIfScreenNamesAreGood()

        setContent {
            navController = rememberNavController()
            NavGraph(viewModel, navController)
        }

        val currDevID = readExpectedDeviceAddress(application)
        if(currDevID.isEmpty())
            writeExpectedDeviceAddress(application, currTTGOdevID)
    }

    override fun onStart() {
        super.onStart()
        if(! haveThePermissionsBeenGranted(this)){
            askForPermissions(this)
        }
    }

    override fun onStop() {
        super.onStop(); log("onStop")
    }

    override fun onDestroy() {
        super.onDestroy(); log("onDestroy")
        viewModel.disconnect()
    }

    override fun onBackPressed() {
        when(navController.currentDestination?.route){
            Screens.ConnectedDevice.routeName -> {
                viewModel.disconnect()
                onBackPressedDispatcher.onBackPressed() //because super.onBackpressed() is deprecated https://stackoverflow.com/a/73934895
            }
            Screens.Home.routeName -> {
                moveTaskToBack(true) //In order to not destroy the activity
            }
            else -> { //sometimes the destination is null for unknown reasons
                log("Screen ${navController.currentDestination?.route} not included in the 'when' of onBackPressed(). Going to home")
                navController.navigate(Screens.Home.routeName)
            }
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


