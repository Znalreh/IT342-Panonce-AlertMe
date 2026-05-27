package com.example.alertme

import android.os.Bundle
import android.text.format.DateUtils
import android.util.Log
import android.view.View
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.cardview.widget.CardView
import androidx.lifecycle.lifecycleScope
import retrofit2.HttpException
import coil.load
import com.example.alertme.adapters.CommentsAdapter
import com.example.alertme.data.dto.AddCommentRequest
import com.example.alertme.data.dto.AlertCommentResponse
import com.example.alertme.data.models.User
import com.google.android.material.textfield.TextInputEditText
import com.google.android.material.button.MaterialButton
import com.example.alertme.data.api.RetrofitClient
import kotlinx.coroutines.launch
import java.time.Instant

class AlertDetailActivity : AppCompatActivity() {

    companion object {
        const val EXTRA_ALERT_ID = "alertId"
    }

    private lateinit var alertIdView: TextView
    private lateinit var statusTitleView: TextView
    private lateinit var statusUpdatedView: TextView
    private lateinit var statusBadgeView: TextView
    private lateinit var titleView: TextView
    private lateinit var locationView: TextView
    private lateinit var reportedAtView: TextView
    private lateinit var reportedByView: TextView
    private lateinit var assignedToView: TextView
    private lateinit var descriptionView: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_alert_detail)

        alertIdView = findViewById(R.id.tvAlertId)
        statusTitleView = findViewById(R.id.tvStatusTitle)
        statusUpdatedView = findViewById(R.id.tvStatusUpdated)
        statusBadgeView = findViewById(R.id.tvStatusBadge)
        titleView = findViewById(R.id.tvAlertTitle)
        locationView = findViewById(R.id.tvLocation)
        reportedAtView = findViewById(R.id.tvReportedAt)
        reportedByView = findViewById(R.id.tvReportedBy)
        assignedToView = findViewById(R.id.tvAssignedTo)
        descriptionView = findViewById(R.id.tvDescription)

        val btnBack = findViewById<ImageView>(R.id.btnBack)
        btnBack.setOnClickListener { finish() }

        val alertId = intent.getStringExtra(EXTRA_ALERT_ID)
        if (alertId.isNullOrBlank()) {
            Toast.makeText(this, "No alert selected", Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        loadAlertDetails(alertId)
    }

    private fun loadAlertDetails(alertId: String) {
        lifecycleScope.launch {
            try {
                val apiService = RetrofitClient.getApiService(this@AlertDetailActivity)
                val alert = try {
                    apiService.getAlert(alertId)
                } catch (e: HttpException) {
                    if (e.code() == 404) {
                        // Backend may not expose GET /{id} — fallback to fetching all and finding locally
                        val alerts = apiService.getAllAlerts()
                        alerts.find { it.id == alertId } ?: throw e
                    } else {
                        throw e
                    }
                }

                alertIdView.text = "Alert ID: ${alert.id}"
                statusTitleView.text = "Status: ${alert.status.replace('_', ' ').lowercase().replaceFirstChar { it.titlecase() }}"
                statusUpdatedView.text = alert.updatedAt
                statusBadgeView.text = alert.status.replace('_', ' ').lowercase().replaceFirstChar { it.titlecase() }
                titleView.text = alert.title?.takeIf { it.isNotBlank() } ?: alert.description.substringBefore('\n').takeIf { it.isNotBlank() } ?: alert.category
                locationView.text = alert.locationText ?: alert.geocodedAddress ?: "Unknown location"
                reportedAtView.text = alert.createdAt
                reportedByView.text = alert.reporter?.let { "${it.firstName} ${it.lastName} (${it.role})" } ?: "Unknown reporter"
                assignedToView.text = alert.assignedTo?.let { "${it.firstName} ${it.lastName} (${it.role})" } ?: "Unassigned"
                descriptionView.text = alert.description
                // Photos: populate the two placeholders if mediaAttachments available
                val photos = alert.mediaAttachments ?: emptyList()
                val img1Card = findViewById<CardView>(R.id.cardAttachment1)
                val img2Card = findViewById<CardView>(R.id.cardAttachment2)
                val img1 = findViewById<ImageView>(R.id.imgAttachment1)
                val img2 = findViewById<ImageView>(R.id.imgAttachment2)
                val photosTitle = findViewById<TextView>(R.id.tvPhotosTitle)
                photosTitle.text = "Photos (${photos.size})"
                val publicBase = "https://rjnshudkyinfhwyrxbmh.supabase.co/storage/v1/object/public/alerts/"
                val base = com.example.alertme.BuildConfig.API_BASE_URL.trimEnd('/') + "/"

                img1Card.visibility = View.GONE
                img2Card.visibility = View.GONE

                if (photos.size > 0) {
                    img1Card.visibility = View.VISIBLE
                    val mediaUrl = if (!photos[0].storageKey.isNullOrBlank()) {
                        publicBase + photos[0].storageKey
                    } else {
                        base + "api/v1/media/" + photos[0].id
                    }
                    img1.load(mediaUrl) {
                        crossfade(true)
                        placeholder(R.drawable.ic_camera)
                        error(R.drawable.ic_camera)
                        listener(onError = { _, result ->
                            Log.e("AlertDetail", "Failed to load image: $mediaUrl", result.throwable)
                        })
                    }
                }
                if (photos.size > 1) {
                    img2Card.visibility = View.VISIBLE
                    val mediaUrl = if (!photos[1].storageKey.isNullOrBlank()) {
                        publicBase + photos[1].storageKey
                    } else {
                        base + "api/v1/media/" + photos[1].id
                    }
                    img2.load(mediaUrl) {
                        crossfade(true)
                        placeholder(R.drawable.ic_camera)
                        error(R.drawable.ic_camera)
                        listener(onError = { _, result ->
                            Log.e("AlertDetail", "Failed to load image: $mediaUrl", result.throwable)
                        })
                    }
                }

                // Status timeline: populate timelineContainer from statusHistory
                val timelineEntries = (alert.statusHistory ?: emptyList()).sortedBy { it.createdAt }
                val timelineContainer = findViewById<android.widget.LinearLayout>(R.id.timelineContainer)
                timelineContainer.removeAllViews()
                val inflater = layoutInflater
                for (entry in timelineEntries) {
                    val item = inflater.inflate(R.layout.item_status_timeline, timelineContainer, false)
                    val tvTitle = item.findViewById<TextView>(R.id.tvStatusTitleItem)
                    val tvTime = item.findViewById<TextView>(R.id.tvStatusTimeItem)
                    val tvComment = item.findViewById<TextView>(R.id.tvStatusCommentItem)
                    val titleText = when {
                        !entry.toStatus.isNullOrBlank() -> entry.toStatus
                        !entry.fromStatus.isNullOrBlank() -> entry.fromStatus
                        !entry.comment.isNullOrBlank() -> "Comment"
                        else -> "Status"
                    }
                    tvTitle.text = titleText.replace('_', ' ').lowercase().replaceFirstChar { it.titlecase() }
                    tvTime.text = formatRelativeTime(entry.createdAt)
                    if (!entry.comment.isNullOrBlank()) {
                        tvComment.text = entry.comment
                        tvComment.visibility = android.view.View.VISIBLE
                    } else {
                        tvComment.visibility = android.view.View.GONE
                    }
                    timelineContainer.addView(item)
                }

                // Comments: use statusHistory entries with comment text
                val commentEntries = (alert.statusHistory ?: emptyList()).filter { !it.comment.isNullOrBlank() }
                val rvComments = findViewById<androidx.recyclerview.widget.RecyclerView>(R.id.rvComments)
                rvComments.layoutManager = androidx.recyclerview.widget.LinearLayoutManager(this@AlertDetailActivity)
                val commentsList = commentEntries.map {
                    AlertCommentResponse(
                        it.id ?: "",
                        it.comment ?: "",
                        it.changedByName ?: "Unknown",
                        formatRelativeTime(it.createdAt)
                    )
                }.toMutableList()
                val commentsAdapter = CommentsAdapter(commentsList)
                rvComments.adapter = commentsAdapter

                val tvCommentsTitle = findViewById<TextView>(R.id.tvCommentsTitle)
                tvCommentsTitle.text = getString(R.string.comments_count, commentsList.size)

                // Post comment
                val etComment = findViewById<TextInputEditText>(R.id.etComment)
                val btnPost = findViewById<MaterialButton>(R.id.btnPostComment)
                btnPost.setOnClickListener {
                    val text = etComment.text?.toString()?.trim() ?: ""
                    if (text.isBlank()) {
                        Toast.makeText(this@AlertDetailActivity, "Comment cannot be empty", Toast.LENGTH_SHORT).show()
                        return@setOnClickListener
                    }
                    lifecycleScope.launch {
                        try {
                            val added = apiService.addComment(alert.id, AddCommentRequest(text))
                            val formatted = added.copy(createdAt = formatRelativeTime(added.createdAt))
                            commentsAdapter.add(formatted)
                            tvCommentsTitle.text = getString(R.string.comments_count, commentsAdapter.itemCount)
                            etComment.setText("")
                        } catch (e: Exception) {
                            Toast.makeText(this@AlertDetailActivity, "Failed to post comment: ${e.message}", Toast.LENGTH_SHORT).show()
                        }
                    }
                }
            } catch (e: Exception) {
                Toast.makeText(
                    this@AlertDetailActivity,
                    "Unable to load alert details: ${e.message}",
                    Toast.LENGTH_SHORT
                ).show()
                finish()
            }
        }
    }

    private fun formatRelativeTime(createdAt: String?): String {
        if (createdAt.isNullOrBlank()) return ""
        return try {
            val instant = Instant.parse(createdAt)
            DateUtils.getRelativeTimeSpanString(
                instant.toEpochMilli(),
                System.currentTimeMillis(),
                DateUtils.MINUTE_IN_MILLIS,
                DateUtils.FORMAT_ABBREV_RELATIVE
            ).toString()
        } catch (e: Exception) {
            Log.w("AlertDetail", "Cannot parse timestamp: $createdAt", e)
            createdAt
        }
    }
}
