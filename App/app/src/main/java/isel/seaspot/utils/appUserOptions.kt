package isel.seaspot.utils

import android.app.Application
import android.content.Context
import androidx.appcompat.app.AppCompatActivity
import java.io.FileNotFoundException

const val expectedDeviceAddressFile = "expectedDeviceAddress.txt"

fun writeExpectedDeviceAddress(context: Context, address: String) { //https://developer.android.com/training/data-storage/app-specific
    context.openFileOutput(expectedDeviceAddressFile, Context.MODE_PRIVATE).use {
        it.write(address.toByteArray())
        val filesDir = context.filesDir
        log("Saved $address to $filesDir/$expectedDeviceAddressFile") //data/user/0/isel.seaspot/files/latest_data_fetch_data.txt
    }
}

fun readExpectedDeviceAddress(context: Context) : String { //https://developer.android.com/training/data-storage/app-specific
    var sb = StringBuilder()
    try {
        context.openFileInput(expectedDeviceAddressFile).bufferedReader().useLines { lines ->
            lines.forEach { line -> sb.append(line) }
        }
        log("$sb was read")
        return sb.toString()
    } catch (e: FileNotFoundException){
        log("$e creating new file...")
        context.openFileOutput(expectedDeviceAddressFile, AppCompatActivity.MODE_PRIVATE)
    }
    return ""
}