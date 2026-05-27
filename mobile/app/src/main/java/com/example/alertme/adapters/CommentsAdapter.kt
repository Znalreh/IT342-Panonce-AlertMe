package com.example.alertme.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.alertme.R
import com.example.alertme.data.dto.AlertCommentResponse

class CommentsAdapter(private val items: MutableList<AlertCommentResponse>) : RecyclerView.Adapter<CommentsAdapter.VH>() {
    class VH(view: View) : RecyclerView.ViewHolder(view) {
        val author: TextView = view.findViewById(R.id.tvCommentAuthor)
        val text: TextView = view.findViewById(R.id.tvCommentText)
        val time: TextView = view.findViewById(R.id.tvCommentTime)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_comment, parent, false)
        return VH(view)
    }

    override fun onBindViewHolder(holder: VH, position: Int) {
        val c = items[position]
        holder.author.text = c.changedByName.ifBlank { "Unknown" }
        holder.text.text = c.comment
        holder.time.text = c.createdAt
    }

    override fun getItemCount(): Int = items.size

    fun add(comment: AlertCommentResponse) {
        items.add(0, comment)
        notifyItemInserted(0)
    }
}
