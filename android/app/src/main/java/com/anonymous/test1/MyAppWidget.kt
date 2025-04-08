package com.anonymous.test1

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import android.util.Log
import org.json.JSONArray
import org.json.JSONException

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
            
            // Obtiene los textos guardados
            val savedTextsJson = getSavedTexts(context)
            Log.d("MyAppWidget", "Textos recuperados: $savedTextsJson")
            
            val textListBuilder = StringBuilder()
            
            try {
                val textsArray = JSONArray(savedTextsJson)
                Log.d("MyAppWidget", "Número de textos guardados: ${textsArray.length()}")
                
                if (textsArray.length() == 0) {
                    views.setTextViewText(R.id.text_list, "No hay textos guardados")
                    Log.d("MyAppWidget", "Configurando texto del widget: 'No hay textos guardados'")
                } else {
                    // Procesamos cada texto guardado
                    for (i in 0 until textsArray.length()) {
                        val textObj = textsArray.getJSONObject(i)
                        // Intentamos obtener el campo 'text' primero (formato usado en la app ejemplo)
                        var displayText = if (textObj.has("text")) textObj.getString("text") else null
                        
                        // Si no hay 'text', intentamos con 'Evento' (posible formato en tu app)
                        if (displayText == null && textObj.has("Evento")) {
                            displayText = textObj.getString("Evento")
                        }
                        
                        // Si tampoco hay 'Evento', usamos todo el objeto como texto
                        if (displayText == null) {
                            displayText = textObj.toString()
                        }
                        
                        textListBuilder.append(displayText).append("\n")
                        Log.d("MyAppWidget", "Añadiendo texto al widget: $displayText")
                    }
                    
                    val finalText = textListBuilder.toString().trim()
                    views.setTextViewText(R.id.text_list, finalText)
                    Log.d("MyAppWidget", "Configurando texto del widget: '$finalText'")
                }
            } catch (e: JSONException) {
                Log.e("MyAppWidget", "Error al analizar JSON: ${e.message}", e)
                views.setTextViewText(R.id.text_list, "Error al cargar textos")
            }
            
            // Actualiza el widget
            appWidgetManager.updateAppWidget(appWidgetId, views)
            Log.d("MyAppWidget", "Widget ID $appWidgetId actualizado exitosamente")
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