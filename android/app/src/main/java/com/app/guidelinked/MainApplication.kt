package com.app.guidelinked

import android.app.Application
import android.content.res.Configuration
import android.view.WindowManager
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.soloader.OpenSourceMergedSoMapping
import com.facebook.soloader.SoLoader

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              // Autolinking adds most packages; add manual packages here only if needed.
            }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, OpenSourceMergedSoMapping)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      load()
    }
    adjustFontScale(resources.configuration)
  }

  private fun adjustFontScale(configuration: Configuration) {
    configuration.fontScale = 1.0f
    val metrics = resources.displayMetrics
    val wm = getSystemService(WINDOW_SERVICE) as WindowManager
    @Suppress("DEPRECATION")
    wm.defaultDisplay.getMetrics(metrics)
    metrics.scaledDensity = configuration.fontScale * metrics.density
    baseContext.resources.updateConfiguration(configuration, metrics)
  }
}
