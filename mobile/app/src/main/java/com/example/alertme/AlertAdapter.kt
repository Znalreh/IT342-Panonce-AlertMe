package com.example.alertme

import android.graphics.Color
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.alertme.data.models.Alert
import java.util.Locale

class AlertAdapter(
    private val alerts: List<Alert>,
    private val onAlertClick: (Alert) -> Unit
) : RecyclerView.Adapter<AlertAdapter.AlertViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): AlertViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_alert, parent, false)
        return AlertViewHolder(view)
    }

    override fun onBindViewHolder(holder: AlertViewHolder, position: Int) {
        holder.bind(alerts[position])
    }

    override fun getItemCount(): Int = alerts.size

    inner class AlertViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val titleView: TextView = itemView.findViewById(R.id.tvAlertTitle)
        private val descriptionView: TextView = itemView.findViewById(R.id.tvAlertDescription)
        private val locationView: TextView = itemView.findViewById(R.id.tvLocation)
        private val statusView: TextView = itemView.findViewById(R.id.tvStatus)
        private val priorityView: TextView = itemView.findViewById(R.id.tvPriority)
        private val timeView: TextView = itemView.findViewById(R.id.tvTime)

        fun bind(alert: Alert) {
            titleView.text = alert.title?.takeIf { it.isNotBlank() }?.let {
                if (it.length > 40) it.substring(0, 40).trimEnd() + "..." else it
            } ?: alert.description.substringBefore('\n').takeIf { it.isNotBlank() }?.let {
                if (it.length > 40) it.substring(0, 40).trimEnd() + "..." else it
            } ?: alert.category

            descriptionView.text = alert.description
            locationView.text = alert.locationText ?: alert.geocodedAddress ?: "Unknown location"
            statusView.text = alert.status.replace('_', ' ').lowercase(Locale.getDefault()).replaceFirstChar { it.titlecase(Locale.getDefault()) }
            priorityView.text = alert.priority.replace('_', ' ').lowercase(Locale.getDefault()).replaceFirstChar { it.titlecase(Locale.getDefault()) }
            timeView.text = alert.createdAt

            // Simple color adjustment for priority badges
            val priorityColor = when (alert.priority.uppercase(Locale.getDefault())) {
                "HIGH" -> Color.parseColor("#DC2626")
                "MEDIUM" -> Color.parseColor("#D97706")
                "LOW" -> Color.parseColor("#047857")
                else -> Color.parseColor("#374151")
            }
            priorityView.setTextColor(Color.WHITE)
            priorityView.setBackgroundColor(priorityColor)

            itemView.setOnClickListener {
                onAlertClick(alert)
            }
        }
    }
}
