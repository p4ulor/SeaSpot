package isel.seaspot.utils

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.location.LocationManager
import androidx.activity.ComponentActivity
import androidx.core.app.ActivityCompat
import kotlin.math.roundToInt

val permissions = arrayOf(
    Manifest.permission.BLUETOOTH_SCAN,
    Manifest.permission.BLUETOOTH_CONNECT,
    Manifest.permission.BLUETOOTH_ADVERTISE,
    Manifest.permission.BLUETOOTH_ADMIN,

    Manifest.permission.ACCESS_FINE_LOCATION,
    Manifest.permission.ACCESS_COARSE_LOCATION,
    //Manifest.permission.ACCESS_BACKGROUND_LOCATION //Note: Adding this somehow breaks the prompts to ask for the permissions, and it won't show
)

fun haveThePermissionsBeenGranted(activity: ComponentActivity) : Boolean {
    return permissions.all {
        isGranted(it, activity)
    }
}

private fun isGranted(permission: String, activity: ComponentActivity) : Boolean {
    return ActivityCompat.checkSelfPermission(activity, permission) == PackageManager.PERMISSION_GRANTED
}

fun isLocationOn(activity: ComponentActivity) : Boolean {
    val lm: LocationManager = activity.getSystemService(Context.LOCATION_SERVICE) as LocationManager
    return lm.isProviderEnabled(LocationManager.GPS_PROVIDER)
}

//Opens up all embed prompts needed to obtain the permissions
fun askForPermissions(activity: ComponentActivity) {
    log("Asking for permissions")
    activity.requestPermissions(permissions, Math.random().roundToInt())
}
