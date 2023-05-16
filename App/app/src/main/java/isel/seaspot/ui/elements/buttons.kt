package isel.seaspot.ui.elements

import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.material.Button
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.sp
import isel.seaspot.R

@Composable
fun Button(onClick: () -> Unit, text: String, isEnabled: Boolean = true){
    Button(onClick, text, Modifier, isEnabled)
}
@Composable
fun Button(onClick: () -> Unit, text: String, modifier: Modifier? = Modifier, isEnabled: Boolean){
    Button(onClick = { onClick() }, modifier = modifier!!, enabled = isEnabled){
        Text(text)
    }
}

@Composable
fun ListOfDevices(onClick: () -> Unit, address: String, name: String){
    Button(onClick = { onClick() }) {
        Text(text = "${stringResource(R.string.addr)}: $address, ${stringResource(R.string.name)}: $name",
            fontSize = 24.sp,
            modifier = Modifier.fillMaxHeight(),
            textAlign = TextAlign.Center,
            color = Color.White
        )
    }
}