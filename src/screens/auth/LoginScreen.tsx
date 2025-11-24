import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";

import { StackNavigationProp } from "@react-navigation/stack"; // Importamos los tipos que definimos
import { RootStackParamList } from "../../navigation/StackNavigator";
import { LoginFormData, COLORS, FONT_SIZES } from "../../../types/index"; // Importamos la imagen
const loginImage = require("../../../assets/Login_Image_NoBG.png");
const loginHeader = require("../../../assets/login_header.png");
const { height } = Dimensions.get("window");

/**
 * Tipo para las props de navegación de esta pantalla
 */

type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Login"
>;

/**
 * Props que recibe el componente LoginScreen
 */

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

/**
 * Pantalla de inicio de sesión
 * Permite a los usuarios autenticarse en el sistema
 */

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  // Estados del formulario usando el tipo LoginFormData
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
  }); // Estado para controlar si está cargando
  const [isLoading, setIsLoading] = useState<boolean>(false);
  /**
   * Actualiza los datos del formulario
   * @param field - Campo a actualizar ('username' o 'password')
   * @param value - Nuevo valor del campo
   */
  const updateFormData = (field: keyof LoginFormData, value: string): void => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  /**
   * Valida que los campos del formulario no estén vacíos
   * returns true si los campos son válidos, false en caso contrario
   */

  const validateForm = (): boolean => {
    if (!formData.username.trim()) {
      Alert.alert("Error", "Por favor, ingrese su usuario");
      return false;
    }
    if (!formData.password.trim()) {
      Alert.alert("Error", "Por favor, ingrese su contraseña");
      return false;
    }
    if (formData.password.length < 4) {
      Alert.alert("Error", "La contraseña debe tener al menos 4 caracteres");
      return false;
    }
    return true;
  };
  /**
   * Maneja el proceso de inicio de sesión
   */
  const handleLogin = (): void => {
    if (!validateForm()) {
      return;
    }
    Alert.alert(
      "Confirmación de inicio de sesión",
      `¿Deseas iniciar sesión como ${formData.username}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Aceptar",
          onPress: authenticateUser,
        },
      ],
      { cancelable: false }
    );
  };
  /**
   * Simula el proceso de autenticación
   */
  const authenticateUser = (): void => {
    setIsLoading(true); // Simulamos una petición al servidor (2 segundos)
    setTimeout(() => {
      setIsLoading(false); // Aquí iría la lógica real de autenticación
      // Por ahora, cualquier usuario/contraseña es válido
      console.log("Usuario autenticado:", formData.username); // Navegamos a la pantalla principal
      navigation.replace("Home");
    }, 2000);
  };
  /**
   * Maneja la recuperación de contraseña
   */
  const handleForgotPassword = (): void => {
    Alert.alert(
      "Recuperación de contraseña",
      "Esta funcionalidad estará disponible próximamente.",
      [{ text: "Entendido" }]
    );
  };
  /**
   * Maneja el registro de nuevo usuario
   */
  const handleRegister = (): void => {
    Alert.alert(
      "Registro",
      "Esta funcionalidad estará disponible próximamente.",
      [{ text: "Entendido" }]
    );
  };
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        {/* Logo de la aplicación */}
        <Image source={loginHeader} style={styles.loginHeader} />
        <Image source={loginImage} style={styles.loginImage} />
        <Text style={styles.title}>BeginnerCode</Text>
        <Text style={styles.subtitle}>Inicio de sesión</Text>
        <View style={styles.formContainer}>
          {/* Campo Usuario */}
          <TextInput
            style={styles.input}
            placeholder="Usuario"
            placeholderTextColor={COLORS.textSecondary}
            value={formData.username}
            onChangeText={(text) => updateFormData("username", text)}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />
          {/* Campo Contraseña */}
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor={COLORS.textSecondary}
            value={formData.password}
            onChangeText={(text) => updateFormData("password", text)}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />
          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.linkForg}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
          {/* Botón de Login */}
          <TouchableOpacity
            style={[styles.loginButton, { opacity: isLoading ? 0.6 : 1 }]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Text>
          </TouchableOpacity>
        </View>
        {/* Enlaces adicionales */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>¿No tienes una cuenta?</Text>
          <TouchableOpacity onPress={handleRegister} activeOpacity={0.6}>
            <Text style={styles.linkReg}>Regístrate</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

/**
 * Estilos del componente
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },

  loginHeader: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: height * 0.3,
    resizeMode: "cover",
  },

  loginImage: {
    position: "absolute",
    top: height * 0.3 - 60,
    alignSelf: "center",
    width: 120,
    height: 120,
    borderRadius: 60,
    zIndex: 2,
  },
  title: {
    fontSize: FONT_SIZES.xxlarge,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "center",
    marginTop: height * 0.3 + 75,
    marginBottom: 40,
  },
  subtitle: {
    fontSize: FONT_SIZES.large,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 10,
  },
  formContainer: {
    width: "100%",
    maxWidth: 300,
  },
  input: {
    height: 60,
    borderColor: COLORS.surface,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: FONT_SIZES.medium,
    backgroundColor: COLORS.background,
    color: COLORS.text,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    height: 60,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    elevation: 2,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loginButtonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.medium,
    fontWeight: "bold",
  },
  registerContainer: {
    marginTop: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  registerText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.medium,
    textAlign: "center",
  },
  linkForg: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.small,
    textAlign: "right",
  },
  linkReg: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.medium,
    fontWeight: "bold",
  },
});
export default LoginScreen;
