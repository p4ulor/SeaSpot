package isel.seaspot.screens

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import isel.seaspot.activities.MainViewModel

//Defines the different navigable screens

@Composable
fun NavGraph(viewModel: MainViewModel, navController: NavHostController){
    NavHost(navController = navController, startDestination = Screens.Home.routeName){
        composable(route = Screens.Home.routeName){
            MainScreen(viewModel, navController)
        }
        composable(route = Screens.ConnectedDevice.routeName){
            ConnectedDeviceScreen(viewModel, navController)
        }
    }
}

enum class Screens(val routeName: String){
    Home("home_screen"),
    ConnectedDevice("connected_device_screen");
}