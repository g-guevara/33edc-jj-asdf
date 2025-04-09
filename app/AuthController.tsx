// app/AuthController.tsx
import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "./ThemeContext";

const AuthController = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { isDarkMode } = useTheme();
  const navigation = useNavigation();

  useEffect(() => {
    // Verificar si el usuario ha iniciado sesión al cargar el componente
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      // Obtener el estado de sesión desde AsyncStorage
      const isLoggedIn = await AsyncStorage.getItem("isLoggedIn");
      
      setTimeout(() => {
        if (isLoggedIn === "1") {
          // Si el usuario ya inició sesión, ir a la pantalla principal
          navigation.reset({
            index: 0,
            routes: [{ name: "index" as never }],
          });
        } else {
          // Si no ha iniciado sesión, ir a la pantalla de bienvenida
          navigation.reset({
            index: 0,
            routes: [{ name: "WelcomeScreen" as never }],
          });
        }
        setIsLoading(false);
      }, 1000); // Pequeño delay para mostrar el indicador de carga
    } catch (error) {
      console.error("Error al verificar estado de sesión:", error);
      // En caso de error, llevar a la pantalla de bienvenida
      navigation.reset({
        index: 0,
        routes: [{ name: "WelcomeScreen" as never }],
      });
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <ActivityIndicator 
        size="large" 
        color={isDarkMode ? "#FFFFFF" : "#000000"} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  darkContainer: {
    backgroundColor: "#1a1a1a",
  },
});

export default AuthController;