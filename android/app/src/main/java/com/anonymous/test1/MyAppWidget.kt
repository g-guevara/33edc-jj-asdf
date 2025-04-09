package com.anonymous.test1

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import android.util.Log
import android.view.View
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.*

// Data class to match the Swift SavedEvent model
data class SavedEvent(
    val id: String,
    val text: String,
    val type: String?,
    val room: String?,
    val color: String?,
    val startTime: String?,
    val endTime: String?,
    val building: String?
) {
    companion object {
        // Create from JSON object
        fun fromJson(json: JSONObject): SavedEvent {
            return SavedEvent(
                id = json.optString("id", ""),
                text = json.optString("text", ""),
                type = if (json.has("type")) json.getString("type") else null,
                room = if (json.has("room")) json.getString("room") else null,
                color = if (json.has("color")) json.getString("color") else null,
                startTime = if (json.has("startTime")) json.getString("startTime") else null,
                endTime = if (json.has("endTime")) json.getString("endTime") else null,
                building = if (json.has("building")) json.getString("building") else null
            )
        }
    }
}

class MyAppWidget : AppWidgetProvider() {
    private val TAG = "MyAppWidget"

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        Log.d(TAG, "onUpdate llamado para widget IDs: ${appWidgetIds.joinToString()}")
        
        // Actualiza todos los widgets
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }
    
    // También capturamos los eventos de habilitación para debugging
    override fun onEnabled(context: Context) {
        super.onEnabled(context)
        Log.d(TAG, "onEnabled: Widget habilitado por primera vez")
    }
    
    override fun onDisabled(context: Context) {
        super.onDisabled(context)
        Log.d(TAG, "onDisabled: Todos los widgets fueron eliminados")
    }
    
    // Capturamos el evento de recepción para ver si está llegando
    override fun onReceive(context: Context, intent: Intent) {
        Log.d(TAG, "onReceive: Acción recibida: ${intent.action}")
        super.onReceive(context, intent)
    }

    companion object {
        fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            Log.d("MyAppWidget", "Actualizando widget ID: $appWidgetId")
            
            // Construye la vista del widget
            val views = RemoteViews(context.packageName, R.layout.app_widget)
            
            // Obtiene la fecha actual
            val calendar = Calendar.getInstance()
            val dayOfWeekFormat = SimpleDateFormat("EEE", Locale("es", "ES"))
            val dayNumberFormat = SimpleDateFormat("d", Locale.getDefault())
            
            val dayOfWeek = dayOfWeekFormat.format(calendar.time).uppercase()
            val dayNumber = dayNumberFormat.format(calendar.time)
            
            // Actualiza la fecha en el widget
            views.setTextViewText(R.id.text_day_of_week, dayOfWeek)
            views.setTextViewText(R.id.text_day_number, dayNumber)
            
            // Obtiene los eventos guardados
            val savedEventsJson = getSavedTexts(context)
            Log.d("MyAppWidget", "Eventos recuperados: $savedEventsJson")
            
            try {
                val eventsArray = JSONArray(savedEventsJson)
                Log.d("MyAppWidget", "Número de eventos guardados: ${eventsArray.length()}")
                
                // Parse JSON to SavedEvent objects
                val savedEvents = ArrayList<SavedEvent>()
                for (i in 0 until eventsArray.length()) {
                    try {
                        val eventObj = eventsArray.getJSONObject(i)
                        savedEvents.add(SavedEvent.fromJson(eventObj))
                    } catch (e: JSONException) {
                        Log.e("MyAppWidget", "Error al parsear evento $i: ${e.message}")
                    }
                }
                
                if (savedEvents.isEmpty()) {
                    // Si no hay eventos, mostrar mensaje "No hay eventos"
                    views.setViewVisibility(R.id.text_no_events, View.VISIBLE)
                    views.setViewVisibility(R.id.event_container_1, View.GONE)
                    views.setViewVisibility(R.id.event_container_2, View.GONE)
                    views.setViewVisibility(R.id.event_container_3, View.GONE)
                    views.setViewVisibility(R.id.text_more_events, View.GONE)
                    Log.d("MyAppWidget", "No hay eventos para mostrar")
                } else {
                    // Ocultar mensaje "No hay eventos"
                    views.setViewVisibility(R.id.text_no_events, View.GONE)
                    
                    // Determinar cuántos eventos mostrar (máximo 3)
                    val eventsToShow = minOf(3, savedEvents.size)
                    
                    // Mostrar cada evento en su contenedor
                    for (i in 0 until 3) {
                        val containerId = when (i) {
                            0 -> R.id.event_container_1
                            1 -> R.id.event_container_2
                            2 -> R.id.event_container_3
                            else -> 0 // No debería llegar aquí
                        }
                        
                        if (i < eventsToShow) {
                            // Este slot debe mostrarse
                            val event = savedEvents[i]
                            
                            // Formatear hora (solo mostrar HH:MM si tiene formato HH:MM:SS)
                            val formattedTime = event.startTime?.let { 
                                if (it.length >= 5) it.substring(0, 5) else it 
                            } ?: ""
                            
                            // Configurar textos
                            views.setTextViewText(getTimeViewId(i+1), formattedTime)
                            views.setTextViewText(getTitleViewId(i+1), event.text)
                            views.setTextViewText(getRoomViewId(i+1), event.room ?: "")
                            
                            // Determinar color del fondo basado en la propiedad "color" o el edificio
                            var backgroundResId = R.drawable.event_background_blue // Valor predeterminado
                            
                            if (!event.color.isNullOrEmpty()) {
                                backgroundResId = getBackgroundResourceForColor(event.color)
                            } else if (!event.building.isNullOrEmpty()) {
                                backgroundResId = getBackgroundResourceForBuilding(event.building)
                            }
                            
                            // Configurar fondo
                            views.setInt(containerId, "setBackgroundResource", backgroundResId)
                            
                            // Mostrar el contenedor
                            views.setViewVisibility(containerId, View.VISIBLE)
                        } else {
                            // Este slot debe ocultarse
                            views.setViewVisibility(containerId, View.GONE)
                        }
                    }
                    
                    // Configurar indicador "Más eventos" si hay más de 3
                    if (savedEvents.size > 3) {
                        val moreCount = savedEvents.size - 3
                        views.setTextViewText(R.id.text_more_events, "+ $moreCount más...")
                        views.setViewVisibility(R.id.text_more_events, View.VISIBLE)
                    } else {
                        views.setViewVisibility(R.id.text_more_events, View.GONE)
                    }
                }
            } catch (e: JSONException) {
                Log.e("MyAppWidget", "Error al analizar JSON: ${e.message}", e)
                // En caso de error, mostrar mensaje de error
                views.setViewVisibility(R.id.text_no_events, View.VISIBLE)
                views.setTextViewText(R.id.text_no_events, "Error al cargar eventos")
                views.setViewVisibility(R.id.event_container_1, View.GONE)
                views.setViewVisibility(R.id.event_container_2, View.GONE)
                views.setViewVisibility(R.id.event_container_3, View.GONE)
                views.setViewVisibility(R.id.text_more_events, View.GONE)
            }
            
            // Actualiza el widget
            appWidgetManager.updateAppWidget(appWidgetId, views)
            Log.d("MyAppWidget", "Widget ID $appWidgetId actualizado exitosamente")
        }
        
        // This helper was replaced by the SavedEvent data class
        
        // Helper para obtener el ID del TextView de la hora según el índice
        private fun getTimeViewId(index: Int): Int {
            return when (index) {
                1 -> R.id.text_event_time_1
                2 -> R.id.text_event_time_2
                3 -> R.id.text_event_time_3
                else -> 0
            }
        }
        
        // Helper para obtener el ID del TextView del título según el índice
        private fun getTitleViewId(index: Int): Int {
            return when (index) {
                1 -> R.id.text_event_title_1
                2 -> R.id.text_event_title_2
                3 -> R.id.text_event_title_3
                else -> 0
            }
        }
        
        // Helper para obtener el ID del TextView de la sala según el índice
        private fun getRoomViewId(index: Int): Int {
            return when (index) {
                1 -> R.id.text_event_room_1
                2 -> R.id.text_event_room_2
                3 -> R.id.text_event_room_3
                else -> 0
            }
        }
        
        // Helper para determinar el recurso de fondo según el color hex
        private fun getBackgroundResourceForColor(colorHex: String?): Int {
            if (colorHex == null) return R.drawable.event_background_blue
            
            // Handle both with and without # prefix
            val normalizedColor = colorHex.lowercase().trim()
            
            return when {
                normalizedColor.contains("2bb5ec") -> R.drawable.event_background_blue
                normalizedColor.contains("2becc6") -> R.drawable.event_background_green
                normalizedColor.contains("bbef4c") -> R.drawable.event_background_green
                normalizedColor.contains("9d6bce") -> R.drawable.event_background_purple
                normalizedColor.contains("b32580") -> R.drawable.event_background_pink
                normalizedColor.contains("ffe135") -> R.drawable.event_background_yellow
                else -> R.drawable.event_background_blue // Default
            }
        }
        
        // Helper para determinar el recurso de fondo según el edificio
        private fun getBackgroundResourceForBuilding(building: String?): Int {
            if (building == null) return R.drawable.event_background_blue
            
            // Intentar extraer la letra del edificio (ej: "Edificio A" -> 'A')
            val buildingLetter = building.lastOrNull { it.isUpperCase() && it in 'A'..'F' }
            
            return when (buildingLetter) {
                'A' -> R.drawable.event_background_blue
                'B' -> R.drawable.event_background_green
                'C' -> R.drawable.event_background_green
                'D' -> R.drawable.event_background_purple
                'E' -> R.drawable.event_background_pink
                'F' -> R.drawable.event_background_yellow
                else -> R.drawable.event_background_blue // Default
            }
        }
        
        private fun getSavedTexts(context: Context): String {
            val sharedPreferences = context.getSharedPreferences(
                    "com.anonymous.test1.shared", Context.MODE_PRIVATE)
            val savedTexts = sharedPreferences.getString("savedTexts", "[]") ?: "[]"
            Log.d("MyAppWidget", "Textos recuperados de SharedPreferences: $savedTexts")
            return savedTexts
        }
    }
}