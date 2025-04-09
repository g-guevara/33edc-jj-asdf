import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, Alert } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";
import { styles } from "./styles/Index.styles";
import EventStats from "./EventStats";

// Define the navigation parameter list type
type RootStackParamList = {
  Main: undefined;
  Search: undefined;
  Config: undefined;
  WelcomeScreen: undefined;
  AuthController: undefined;
  // Add other screens in your navigation stack as needed
};

// Define the navigation prop type
type MainScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const Main = () => {
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
  const navigation = useNavigation<MainScreenNavigationProp>();

  // Load data when component mounts
  useEffect(() => {
    loadThemePreference();
    setDefaultDarkMode();
  }, []);

  // Also refresh data when screen comes into focus (for theme changes from other screens)
  useFocusEffect(
    React.useCallback(() => {
      loadThemePreference();
      return () => {};
    }, [])
  );

  const setDefaultDarkMode = async () => {
    try {
      // Check if we already set a preference
      const value = await AsyncStorage.getItem("isDarkMode");
      if (value === null) {
        // No preference yet, set dark mode as default
        await AsyncStorage.setItem("isDarkMode", "true");
        setIsDarkMode(true);
      }
    } catch (error) {
      console.error("Error setting default dark mode:", error);
    }
  };

  const loadThemePreference = async () => {
    try {
      // Load theme preference
      const themeValue = await AsyncStorage.getItem("isDarkMode");
      if (themeValue !== null) {
        setIsDarkMode(themeValue === "true");
      }
    } catch (error) {
      console.error("Error loading theme preference:", error);
    }
  };

  // Función para cerrar sesión (logout)
  const handleLogout = async () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro de que deseas cerrar sesión?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Cerrar sesión",
          onPress: async () => {
            try {
              // Eliminar el estado de sesión
              await AsyncStorage.removeItem("isLoggedIn");
              // Navegar a la pantalla de autenticación
              navigation.reset({
                index: 0,
                routes: [{ name: "AuthController" }],
              });
            } catch (error) {
              console.error("Error al cerrar sesión:", error);
              Alert.alert("Error", "No se pudo cerrar sesión correctamente.");
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  return (
    <>
      {/* Configure StatusBar based on theme */}
      <StatusBar
        backgroundColor={isDarkMode ? "#121212" : "#FFFFFF"}
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        translucent={true}
      />
      <SafeAreaView style={[styles.safeArea, isDarkMode && styles.darkContainer]}>
        <View style={[styles.container, isDarkMode && styles.darkContainer]}>
          {/* Botón de búsqueda en la esquina superior izquierda */}
          <View style={styles.leftSideContainer}>
            <TouchableOpacity
              style={styles.userIconButton}
              onPress={() => navigation.navigate("Search")}
            >
              <Icon name="search-outline" size={35} color={isDarkMode ? "#fff" : "#000"} />
            </TouchableOpacity>
            
            <View style={styles.dateContainer}>
              <Text style={[styles.dateWeekday, isDarkMode && styles.darkSubText]}>
                {`Hoy, ${new Date().toLocaleString('es-ES', { weekday: 'long' }).charAt(0).toUpperCase() + new Date().toLocaleString('es-ES', { weekday: 'long' }).slice(1)}`}
              </Text>                
              
              <View style={styles.dateRow}>
                <Text style={[styles.dateDay, isDarkMode && styles.darkText]}>
                  {new Date().getDate()}
                </Text>
                <Text style={[styles.dateMonth, isDarkMode && styles.darkText]}>
                  {new Date().toLocaleString('es-ES', { month: 'long' }).toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          {/* Botón de usuario en la esquina superior derecha */}
          <TouchableOpacity
            style={styles.searchIconButton}
            onPress={() => navigation.navigate("Config")}
          >
            <Icon name="person" size={35} color={isDarkMode ? "#fff" : "#000"} />
          </TouchableOpacity>

          {/* Componente de estadísticas y botones */}
          <EventStats 
            isDarkMode={isDarkMode} 
            navigation={navigation} 
          />
          
          {/* Botón de logout (puedes ubicarlo donde prefieras) */}
          <TouchableOpacity 
            style={[styles.logoutButton, isDarkMode && styles.darkLogoutButton]} 
            onPress={handleLogout}
          >
            <Icon name="log-out-outline" size={20} color={isDarkMode ? "#000" : "#fff"} />
            <Text style={[styles.logoutButtonText, isDarkMode && styles.darkLogoutButtonText]}>
              Cerrar sesión
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
};

export default Main;