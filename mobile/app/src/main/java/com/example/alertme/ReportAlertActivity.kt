package com.example.alertme

import android.Manifest
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.location.Geocoder
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.net.Uri
import android.os.Bundle
import android.provider.OpenableColumns
import android.widget.ArrayAdapter
import android.widget.AutoCompleteTextView
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.RadioGroup
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.lifecycle.lifecycleScope
import com.example.alertme.data.api.RetrofitClient
import com.google.android.material.button.MaterialButton
import com.google.android.material.textfield.TextInputEditText
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.Locale

class ReportAlertActivity : AppCompatActivity() {

    private var selectedImagePart: MultipartBody.Part? = null
    private lateinit var uploadedFilesContainer: LinearLayout
    private var currentLatitude: Double? = null
    private var currentLongitude: Double? = null

    private lateinit var buildingEditText: TextInputEditText
    private lateinit var roomSectionEditText: TextInputEditText
    private lateinit var completeAddressEditText: TextInputEditText
    private lateinit var tvGpsCoordinates: TextView
    private lateinit var gpsAcquiredBanner: LinearLayout

    private val imagePickerLauncher = registerForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        uri?.let { handleImagePicked(it) }
    }

    private val locationPermissionLauncher = registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        if (granted) {
            // permission granted; open picker
            openLocationPicker()
        } else {
            Toast.makeText(this, "Location permission denied", Toast.LENGTH_SHORT).show()
        }
    }

    private val pickLocationLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val data = result.data
            val lat = data?.getDoubleExtra("latitude", Double.NaN)
            val lon = data?.getDoubleExtra("longitude", Double.NaN)
            val address = data?.getStringExtra("address")
            if (lat != null && !lat.isNaN() && lon != null && !lon.isNaN()) {
                val location = Location("")
                location.latitude = lat
                location.longitude = lon
                processLocation(location)
                if (!address.isNullOrBlank()) {
                    completeAddressEditText.setText(address)
                    if (buildingEditText.text.isNullOrBlank()) {
                        val firstPart = address.split(",").firstOrNull()?.trim() ?: address
                        buildingEditText.setText(firstPart)
                    }
                }
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_report_alert)

        val categoryRadioGroup = findViewById<RadioGroup>(R.id.rgCategory)
        val alertTitleEditText = findViewById<TextInputEditText>(R.id.etAlertTitle)
        buildingEditText = findViewById<TextInputEditText>(R.id.etBuilding)
        roomSectionEditText = findViewById<TextInputEditText>(R.id.etRoomSection)
        completeAddressEditText = findViewById<TextInputEditText>(R.id.etCompleteAddress)
        val descriptionEditText = findViewById<TextInputEditText>(R.id.etDescription)
        val priorityAutoComplete = findViewById<AutoCompleteTextView>(R.id.actvPriority)
        val cancelButton = findViewById<MaterialButton>(R.id.btnCancel)
        val submitButton = findViewById<MaterialButton>(R.id.btnSubmitReport)
        val takePhotoButton = findViewById<MaterialButton>(R.id.btnTakePhoto)
        val useGpsButton = findViewById<MaterialButton>(R.id.btnUseGPS)
        gpsAcquiredBanner = findViewById(R.id.gpsAcquiredBanner)
        tvGpsCoordinates = findViewById(R.id.tvGpsCoordinates)
        uploadedFilesContainer = findViewById(R.id.uploadedFilesContainer)

        takePhotoButton.setOnClickListener {
            imagePickerLauncher.launch("image/*")
        }

        // Wire GPS button to open map picker
        useGpsButton.setOnClickListener {
            if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
                locationPermissionLauncher.launch(Manifest.permission.ACCESS_FINE_LOCATION)
            } else {
                openLocationPicker()
            }
        }

        // Set up priority dropdown using centralized constants
        val priorities = com.example.alertme.config.AppConfig.Alert.Priorities.ALL
        val adapter = ArrayAdapter(this, android.R.layout.simple_dropdown_item_1line, priorities)
        priorityAutoComplete.setAdapter(adapter)
        priorityAutoComplete.setText(com.example.alertme.config.AppConfig.Alert.Priorities.MEDIUM, false)

        submitButton.setOnClickListener {
            val category = getSelectedCategory(categoryRadioGroup)
            val title = alertTitleEditText.text.toString()
            val building = buildingEditText.text.toString()
            val roomSection = roomSectionEditText.text.toString()
            val description = descriptionEditText.text.toString()
            val priority = priorityAutoComplete.text.toString()

            if (validateInputs(title, description, priority, building, roomSection)) {
                val completeAddress = completeAddressEditText.text?.toString()?.trim().orEmpty()
                val locationText = listOf(completeAddress, building.trim(), roomSection.trim())
                    .filter { it.isNotEmpty() }
                    .joinToString(", ")

                submitAlert(
                    category = category,
                    title = title,
                    building = building,
                    roomSection = roomSection,
                    description = description,
                    priority = priority,
                    locationText = locationText,
                    geocodedAddress = completeAddress.takeIf { it.isNotBlank() }
                )
            }
        }

        cancelButton.setOnClickListener {
            startActivity(Intent(this, DashboardActivity::class.java))
            finish()
        }
    }

    private fun getSelectedCategory(radioGroup: RadioGroup): String {
        return when (radioGroup.checkedRadioButtonId) {
            R.id.rbSecurity -> com.example.alertme.config.AppConfig.Alert.Categories.SECURITY
            R.id.rbInfrastructure -> com.example.alertme.config.AppConfig.Alert.Categories.INFRASTRUCTURE
            R.id.rbEnvironmental -> com.example.alertme.config.AppConfig.Alert.Categories.ENVIRONMENTAL
            else -> com.example.alertme.config.AppConfig.Alert.Categories.OTHER
        }
    }

    private fun validateInputs(title: String, description: String, priority: String, building: String, roomSection: String): Boolean {
        if (title.isEmpty() && description.isEmpty()) {
            Toast.makeText(this, "Please enter an alert title or a description", Toast.LENGTH_SHORT).show()
            return false
        }
        if (priority.isEmpty()) {
            Toast.makeText(this, "Please select a priority level", Toast.LENGTH_SHORT).show()
            return false
        }

        val completeAddress = completeAddressEditText.text?.toString()?.trim().orEmpty()
        val hasLocation = completeAddress.isNotEmpty() || building.isNotBlank() || roomSection.isNotBlank() || (currentLatitude != null && currentLongitude != null)

        if (!hasLocation) {
            Toast.makeText(this, "Please provide a location (address, building, room, or enable GPS)", Toast.LENGTH_SHORT).show()
            return false
        }

        return true
    }

    private fun handleImagePicked(uri: Uri) {
        selectedImagePart = createFilePart(uri)
        if (selectedImagePart == null) {
            Toast.makeText(this, "Unable to prepare selected image", Toast.LENGTH_SHORT).show()
            return
        }
        uploadedFilesContainer.removeAllViews()
        uploadedFilesContainer.visibility = LinearLayout.VISIBLE

        val previewHeight = (180 * resources.displayMetrics.density).toInt()
        val previewImage = ImageView(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                previewHeight
            ).apply {
                bottomMargin = (8 * resources.displayMetrics.density).toInt()
            }
            scaleType = ImageView.ScaleType.CENTER_CROP
            setImageURI(uri)
        }

        val fileNameView = TextView(this).apply {
            text = queryName(uri)
            setTextColor(resources.getColor(com.example.alertme.R.color.navy_blue, null))
            textSize = 14f
        }

        uploadedFilesContainer.addView(previewImage)
        uploadedFilesContainer.addView(fileNameView)
    }

    private fun createFilePart(uri: Uri): MultipartBody.Part? {
        val mimeType = contentResolver.getType(uri) ?: "image/jpeg"
        val fileName = queryName(uri)
        val inputStream = contentResolver.openInputStream(uri) ?: return null
        val bytes = inputStream.readBytes()
        val requestBody = bytes.toRequestBody(mimeType.toMediaTypeOrNull())
        return MultipartBody.Part.createFormData("files", fileName, requestBody)
    }

    private fun queryName(uri: Uri): String {
        var name = "photo.jpg"
        contentResolver.query(uri, null, null, null, null)?.use { cursor ->
            val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
            if (cursor.moveToFirst() && nameIndex != -1) {
                name = cursor.getString(nameIndex)
            }
        }
        return name
    }

    private fun submitAlert(
        category: String,
        title: String,
        building: String,
        roomSection: String,
        description: String,
        priority: String,
        locationText: String,
        geocodedAddress: String?
    ) {
        lifecycleScope.launch {
            try {
                val apiService = RetrofitClient.getApiService(this@ReportAlertActivity)
                val textMediaType = "text/plain".toMediaTypeOrNull()
                val latBody = currentLatitude?.toString()?.toRequestBody(textMediaType)
                val lonBody = currentLongitude?.toString()?.toRequestBody(textMediaType)

                val alert = apiService.createAlert(
                    category = category.toRequestBody(textMediaType),
                    priority = priority.toRequestBody(textMediaType),
                    title = title.takeIf { it.isNotBlank() }?.toRequestBody(textMediaType),
                    description = description.takeIf { it.isNotBlank() }?.toRequestBody(textMediaType),
                    locationText = locationText.toRequestBody(textMediaType),
                    latitude = latBody,
                    longitude = lonBody,
                    geocodedAddress = geocodedAddress?.toRequestBody(textMediaType),
                    files = selectedImagePart?.let { listOf(it) }
                )

                Toast.makeText(
                    this@ReportAlertActivity,
                    "Alert submitted successfully!",
                    Toast.LENGTH_SHORT
                ).show()
                startActivity(Intent(this@ReportAlertActivity, DashboardActivity::class.java))
                finish()
            } catch (e: Exception) {
                Toast.makeText(
                    this@ReportAlertActivity,
                    "Failed to submit alert: ${e.message}",
                    Toast.LENGTH_SHORT
                ).show()
            }
        }
    }

    private fun buildLocationText(building: String, roomSection: String): String? {
        val locationParts = mutableListOf<String>()
        if (building.isNotEmpty()) locationParts.add("Building: $building")
        if (roomSection.isNotEmpty()) locationParts.add("Room/Section: $roomSection")
        return if (locationParts.isNotEmpty()) locationParts.joinToString(", ") else null
    }

    private fun fetchLocation() {
        try {
            val lm = getSystemService(Context.LOCATION_SERVICE) as LocationManager
            if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
                return
            }

            val last = lm.getLastKnownLocation(LocationManager.GPS_PROVIDER)
                ?: lm.getLastKnownLocation(LocationManager.NETWORK_PROVIDER)

            if (last != null) {
                processLocation(last)
                return
            }

            // Fallback: request a single update
            val listener = object : LocationListener {
                override fun onLocationChanged(location: Location) {
                    processLocation(location)
                    try {
                        lm.removeUpdates(this)
                    } catch (_: Exception) {
                    }
                }

                @Deprecated("Deprecated in Java")
                override fun onStatusChanged(provider: String?, status: Int, extras: Bundle?) {}
                override fun onProviderEnabled(provider: String) {}
                override fun onProviderDisabled(provider: String) {}
            }

            // request updates (will be removed after first callback)
            try {
                lm.requestLocationUpdates(LocationManager.GPS_PROVIDER, 0L, 0f, listener)
            } catch (e: Exception) {
                try {
                    lm.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, 0L, 0f, listener)
                } catch (_: Exception) {
                    Toast.makeText(this, "Unable to request location updates", Toast.LENGTH_SHORT).show()
                }
            }
        } catch (e: Exception) {
            Toast.makeText(this, "Failed to fetch location: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }

    private fun processLocation(location: Location) {
        currentLatitude = location.latitude
        currentLongitude = location.longitude

        runOnUiThread {
            gpsAcquiredBanner.visibility = LinearLayout.VISIBLE
            val latStr = String.format(Locale.getDefault(), "%.5f", currentLatitude)
            val lonStr = String.format(Locale.getDefault(), "%.5f", currentLongitude)
            tvGpsCoordinates.text = "Lat: $latStr, Lon: $lonStr"
        }

        // Try reverse geocoding to fill building/area if empty
        lifecycleScope.launch {
            try {
                val geocoder = Geocoder(this@ReportAlertActivity, Locale.getDefault())
                val list = withContext(Dispatchers.IO) {
                    geocoder.getFromLocation(currentLatitude!!, currentLongitude!!, 1)
                }
                if (!list.isNullOrEmpty()) {
                    val addr = list[0]
                    val candidate = listOf(addr.featureName, addr.subLocality, addr.thoroughfare, addr.locality, addr.adminArea)
                        .firstOrNull { !it.isNullOrBlank() }
                    candidate?.let {
                        runOnUiThread {
                            if (buildingEditText.text.isNullOrBlank()) {
                                buildingEditText.setText(it)
                            }
                        }
                    }
                }
            } catch (_: Exception) {
                // ignore geocoder failures
            }
        }
    }

    private fun openLocationPicker() {
        try {
            val intent = Intent(this, PickLocationActivity::class.java)
            pickLocationLauncher.launch(intent)
        } catch (e: Exception) {
            Toast.makeText(this, "Unable to open map picker: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }
}
