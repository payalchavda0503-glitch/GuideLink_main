package com.app.guidelinked

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import android.view.View
import android.view.ViewGroup
import androidx.core.graphics.Insets
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.updatePadding


import org.devio.rn.splashscreen.SplashScreen
class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "GuideLinked"

    // TODO:-  this onCreate for splash-screen
    override fun onCreate(savedInstanceState: Bundle?) {
        SplashScreen.show(this) // here
        super.onCreate(savedInstanceState)
                
        // This code handles window insets to ensure the app's content
        // does not overlap with system bars and, specifically, the keyboard.
        // This is the native fix for KeyboardAvoidingView issues on Android 15.
        val rootView: View = findViewById(android.R.id.content)
        ViewCompat.setOnApplyWindowInsetsListener(rootView) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            val ime = insets.getInsets(WindowInsetsCompat.Type.ime())
            
            // Apply padding to the root view to accommodate the system bars and keyboard.
            // This prevents content from being hidden by the keyboard.
            v.updatePadding(
                left = systemBars.left,
                right = systemBars.right,
                bottom = ime.bottom
            )
            
            // Consume the insets to prevent them from being passed to other views.
            WindowInsetsCompat.CONSUMED
        }
    }

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
