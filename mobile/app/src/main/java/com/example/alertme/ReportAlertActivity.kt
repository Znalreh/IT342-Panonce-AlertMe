package com.example.alertme

import android.content.Intent
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
import androidx.lifecycle.lifecycleScope
import com.example.alertme.data.api.RetrofitClient
import com.google.android.material.button.MaterialButton
import com.google.android.material.textfield.TextInputEditText
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody
import okhttp3.RequestBody.Companion.toRequestBody

class ReportAlertActivity : AppCompatActivity() {

    private var selectedImagePart: MultipartBody.Part? = null
    private lateinit var uploadedFilesContainer: LinearLayout

    private val imagePickerLauncher = registerForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        uri?.let { handleImagePicked(it) }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_report_alert)

        val categoryRadioGroup = findViewById<RadioGroup>(R.id.rgCategory)
        val alertTitleEditText = findViewById<TextInputEditText>(R.id.etAlertTitle)
        val buildingEditText = findViewById<TextInputEditText>(R.id.etBuilding)
        val roomSectionEditText = findViewById<TextInputEditText>(R.id.etRoomSection)
        val descriptionEditText = findViewById<TextInputEditText>(R.id.etDescription)
        val priorityAutoComplete = findViewById<AutoCompleteTextView>(R.id.actvPriority)
        val cancelButton = findViewById<MaterialButton>(R.id.btnCancel)
        val submitButton = findViewById<MaterialButton>(R.id.btnSubmitReport)
        val takePhotoButton = findViewById<MaterialButton>(R.id.btnTakePhoto)
        uploadedFilesContainer = findViewById(R.id.uploadedFilesContainer)

        takePhotoButton.setOnClickListener {
            imagePickerLauncher.launch("image/*")
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
                val locationText = buildLocationText(building, roomSection)!!
                submitAlert(
                    category = category,
                    title = title,
                    building = building,
                    roomSection = roomSection,
                    description = description,
                    priority = priority,
                    locationText = locationText
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
        if (building.isEmpty() && roomSection.isEmpty()) {
            Toast.makeText(this, "Please enter a building or room/section", Toast.LENGTH_SHORT).show()
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
        locationText: String
    ) {
        lifecycleScope.launch {
            try {
                val apiService = RetrofitClient.getApiService(this@ReportAlertActivity)
                val textMediaType = "text/plain".toMediaTypeOrNull()
                val alert = apiService.createAlert(
                    category = category.toRequestBody(textMediaType),
                    priority = priority.toRequestBody(textMediaType),
                    title = title.takeIf { it.isNotBlank() }?.toRequestBody(textMediaType),
                    description = description.takeIf { it.isNotBlank() }?.toRequestBody(textMediaType),
                    locationText = locationText.toRequestBody(textMediaType),
                    latitude = null,
                    longitude = null,
                    geocodedAddress = null,
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
}
