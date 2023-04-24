package isel.seaspot.utils

import android.content.Context
import android.util.Log
import android.widget.Toast
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import java.util.concurrent.Executors

private const val TAG = "MYLOG_"

fun log(s: String) = Log.i(TAG, s)

fun toast(s: String, ctx: Context) = Toast.makeText(ctx, s, Toast.LENGTH_LONG).show() //Note: setGravity no longer works in recent versions https://developer.android.com/reference/android/widget/Toast#getGravity()

fun toast(id: Int, ctx: Context) = toast(ctx.getString(id), ctx)

/**
 * Utility method by Teacher Paulo Pereira. Allows the initialization of ViewModels
 */
@Suppress("UNCHECKED_CAST")
fun <T> viewModelInit(block: () -> T) =
    object : ViewModelProvider.Factory {
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            return block() as T
        }
    }

private val dataAccessExecutor = Executors.newSingleThreadExecutor() // allocates a task to execute on a new thread

fun doAsync(action: () -> Unit) = dataAccessExecutor.submit(action)!!
