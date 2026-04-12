package com.vestil.dormfix.mobile

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity

/**
 * Host activity for XML layouts + Navigation Component. Open the **mobile** folder in Android Studio (Panda 3 / 2025.3.3).
 */
class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
    }
}
