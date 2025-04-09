// app/WelcomeScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "./ThemeContext";

const WelcomeScreen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { isDarkMode } = useTheme();
  const navigation = useNavigation();

  const handleLogin = async () => {
    // Por ahora, simulamos un proceso de login
    setIsLoading(true);
    
    // Simular un delay de red
    setTimeout(async () => {
      // Guardar el estado de sesión en AsyncStorage
      try {
        await AsyncStorage.setItem("isLoggedIn", "1");
        console.log("Estado de sesión guardado correctamente");
      } catch (error) {
        console.error("Error al guardar estado de sesión:", error);
      }
      
      setIsLoading(false);
      // Navegar a la pantalla principal
      navigation.navigate("index" as never);
    }, 1500);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.logoContainer}>
            {/* Aquí puedes añadir tu logo */}
            <Text style={[styles.appName, isDarkMode && styles.darkText]}>
              Salas
            </Text>
            <Text style={[styles.tagline, isDarkMode && styles.darkSubText]}>
              Gestiona tus eventos académicos
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={[styles.inputContainer, isDarkMode && styles.darkInputContainer]}>
              <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>
                Usuario
              </Text>
              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                placeholder="e-mail Universitario"
                placeholderTextColor={isDarkMode ? "#95a5a6" : "#95a5a6"}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            <View style={[styles.inputContainer, isDarkMode && styles.darkInputContainer]}>
              <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>
                Contraseña
              </Text>
              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                placeholder="Tu contraseña"
                placeholderTextColor={isDarkMode ? "#95a5a6" : "#95a5a6"}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[styles.loginButtontt, isDarkMode && styles.darkLoginButtontt, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={[styles.loginButtonText, isDarkMode && styles.darkLoginButtonText]}>
                {isLoading ? "Ingresando..." : "Ingresar"}
              </Text>
            </TouchableOpacity>

            
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, isDarkMode && styles.darkSubText]}>
              © 2025 Mi Universidad
            </Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  darkContainer: {
    backgroundColor: "#1a1a1a",
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: "space-between",
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 40,
  },
  appName: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: "#95a5a6",
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 20,
  },
  darkInputContainer: {
    borderColor: "#444",
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#000000",
  },
  darkInput: {
    backgroundColor: "#2C2C2E",
    color: "#FFFFFF",
    borderColor: "#444",
  },
  loginButtontt: {
    backgroundColor: "#000000",
    borderRadius: 50,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
    color: "#2C2C2E",
  },
  darkLoginButtontt: {
    backgroundColor: "#FFFFFF",
    color: "#2C2C2E",
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  darkLoginButtonText: {
    color: "#000000", // Texto negro para el botón blanco en modo oscuro
  },
  forgotPasswordContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  forgotPasswordText: {
    color: "#3498db",
    fontSize: 14,
  },
  footer: {
    alignItems: "center",
    marginBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: "#95a5a6",
  },
  darkText: {
    color: "#FFFFFF",
  },
  darkSubText: {
    color: "#95a5a6",
  },
});

export default WelcomeScreen;