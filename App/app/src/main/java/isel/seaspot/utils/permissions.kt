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

fun haveThePermissionsBeenGranted(ctx: Context) : Boolean {
    return permissions.all {
        isGranted(it, ctx)
    }
}

private fun isGranted(permission: String, ctx: Context) : Boolean {
    return ActivityCompat.checkSelfPermission(ctx, permission) == PackageManager.PERMISSION_GRANTED
}

fun isLocationOn(ctx: Context) : Boolean {
    val lm: LocationManager = ctx.getSystemService(Context.LOCATION_SERVICE) as LocationManager
    return lm.isProviderEnabled(LocationManager.GPS_PROVIDER)
}

//Opens up all embed prompts needed to obtain the permissions./Note: asking for the permissions repeatedly, won't work https://stackoverflow.com/a/67834147/9375488
fun askForPermissions(activity: ComponentActivity) {
    log("Asking for permissions")
    activity.requestPermissions(permissions, Math.random().roundToInt())
}
