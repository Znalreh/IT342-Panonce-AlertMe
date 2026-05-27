package com.example.alertme

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.location.Geocoder
import android.location.LocationManager
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.lifecycle.lifecycleScope
import androidx.preference.PreferenceManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.osmdroid.config.Configuration
import org.osmdroid.tileprovider.tilesource.TileSourceFactory
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.MapView
import org.osmdroid.views.overlay.Marker
import org.osmdroid.views.overlay.MapEventsOverlay
import org.osmdroid.events.MapEventsReceiver
import org.osmdroid.views.overlay.mylocation.MyLocationNewOverlay
import java.util.Locale

class PickLocationActivity : AppCompatActivity() {

    private lateinit var map: MapView
    private var selectedMarker: Marker? = null
    private var myLocationOverlay: MyLocationNewOverlay? = null
    private val tag = "PickLocationActivity"
    private val locationPermissionLauncher = registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        if (granted) {
            enableLocationOverlay()
            centerToLastKnownLocation()
        } else {
            Toast.makeText(this, "Location permission denied. Showing default map center.", Toast.LENGTH_SHORT).show()
            centerDefaultLocation()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Load osmdroid configuration (cache path, user agent etc.)
        Configuration.getInstance().load(applicationContext, PreferenceManager.getDefaultSharedPreferences(applicationContext))

        setContentView(R.layout.activity_pick_location)

        map = findViewById(R.id.map)
        map.setTileSource(TileSourceFactory.MAPNIK)
        map.setMultiTouchControls(true)
        map.controller.setZoom(12.0)

        // Request permission and center map on device location when available
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            enableLocationOverlay()
            centerToLastKnownLocation()
        } else {
            locationPermissionLauncher.launch(Manifest.permission.ACCESS_FINE_LOCATION)
        }

        // Map tap receiver to place a marker
        val receiver = object : MapEventsReceiver {
            override fun singleTapConfirmedHelper(p: GeoPoint): Boolean {
                runOnUiThread {
                    selectedMarker?.let { map.overlays.remove(it) }
                    val marker = Marker(map)
                    marker.position = p
                    marker.setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM)
                    marker.title = "Selected location"
                    map.overlays.add(marker)
                    selectedMarker = marker
                    findViewById<Button>(R.id.btnConfirmLocation).isEnabled = true
                    map.controller.animateTo(p)
                }
                return true
            }

            override fun longPressHelper(p: GeoPoint): Boolean = false
        }
        map.overlays.add(MapEventsOverlay(receiver))

        val btnConfirm = findViewById<Button>(R.id.btnConfirmLocation)
        val btnCancel = findViewById<Button>(R.id.btnCancelPick)

        btnConfirm.setOnClickListener {
            val marker = selectedMarker
            if (marker == null) {
                Toast.makeText(this, "No location selected", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val lat = marker.position.latitude
            val lon = marker.position.longitude

            // Reverse geocode on background thread then return a full, readable address
            lifecycleScope.launch(Dispatchers.IO) {
                var fullAddress: String? = null
                try {
                    val geocoder = Geocoder(this@PickLocationActivity, Locale.getDefault())
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                        geocoder.getFromLocation(lat, lon, 1) { addresses ->
                            if (addresses.isNotEmpty()) {
                                fullAddress = formatAddress(addresses[0])
                                lifecycleScope.launch {
                                    finishWithResult(lat, lon, fullAddress)
                                }
                            } else {
                                lifecycleScope.launch {
                                    finishWithResult(lat, lon, null)
                                }
                            }
                        }
                    } else {
                        @Suppress("DEPRECATION")
                        val list = geocoder.getFromLocation(lat, lon, 1)
                        if (!list.isNullOrEmpty()) {
                            fullAddress = formatAddress(list[0])
                        }
                        finishWithResult(lat, lon, fullAddress)
                    }
                } catch (e: Exception) {
                    Log.e(tag, "Geocoding failed", e)
                    finishWithResult(lat, lon, null)
                }
            }
        }

        btnCancel.setOnClickListener {
            setResult(RESULT_CANCELED)
            finish()
        }
    }

    private fun formatAddress(addr: android.location.Address): String {
        val parts = listOf(
            addr.featureName,
            addr.subThoroughfare,
            addr.thoroughfare,
            addr.subLocality,
            addr.locality,
            addr.adminArea,
            addr.postalCode,
            addr.countryName
        ).mapNotNull { it?.trim() }.filter { it.isNotEmpty() }
        return parts.joinToString(separator = ", ")
    }

    private suspend fun finishWithResult(lat: Double, lon: Double, address: String?) {
        withContext(Dispatchers.Main) {
            val intent = Intent()
            intent.putExtra("latitude", lat)
            intent.putExtra("longitude", lon)
            if (address != null) intent.putExtra("address", address)
            setResult(RESULT_OK, intent)
            finish()
        }
    }

    private fun enableLocationOverlay() {
        try {
            val overlay = MyLocationNewOverlay(map)
            overlay.enableMyLocation()
            map.overlays.add(overlay)
            myLocationOverlay = overlay
        } catch (e: Exception) {
            Log.w(tag, "Failed to enable my-location overlay: ${e.message}")
        }
    }

    private fun centerToLastKnownLocation() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED && 
            ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            centerDefaultLocation()
            return
        }
        try {
            val lm = getSystemService(LOCATION_SERVICE) as LocationManager
            val last = lm.getLastKnownLocation(LocationManager.GPS_PROVIDER)
                ?: lm.getLastKnownLocation(LocationManager.NETWORK_PROVIDER)
            if (last != null) {
                map.controller.setCenter(GeoPoint(last.latitude, last.longitude))
                map.controller.setZoom(17.0)
                return
            }
        } catch (e: Exception) {
            Log.w(tag, "Failed to get last known location: ${e.message}")
        }
        centerDefaultLocation()
    }

    private fun centerDefaultLocation() {
        map.controller.setCenter(GeoPoint(10.3167, 123.8854))
        map.controller.setZoom(12.0)
    }

    override fun onResume() {
        super.onResume()
        map.onResume()
    }

    override fun onPause() {
        map.onPause()
        super.onPause()
    }
}
