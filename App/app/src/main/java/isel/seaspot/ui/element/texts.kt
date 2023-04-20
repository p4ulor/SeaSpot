package isel.seaspot.ui.element

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun Header(s: String) {
    Column(
        modifier = Modifier.fillMaxWidth().fillMaxHeight().padding(vertical = 40.dp, horizontal = 40.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(
            text = s,
            fontSize = 50.sp,
            fontFamily = FontFamily.Monospace,
            color = Color(20, 138, 255, 255)
        )
    }
}

@Composable
fun MediumHeader(s: String) {
    Column(
        modifier = Modifier.fillMaxWidth().fillMaxHeight().padding(vertical = 40.dp, horizontal = 40.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(
            text = s,
            fontSize = 30.sp,
            fontFamily = FontFamily.Monospace,
        )
    }
}