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
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StackNavigationProp } from "@react-navigation/stack";
import { CommonActions } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { LoginFormData, COLORS, FONT_SIZES } from "../../../types/index";
import StorageService from "../../services/StorageService";
import AuthService from "../../services/AuthService";
import ConnectivityIndicator from "../../components/ConnectivityIndicator";

const loginImage = require("../../../assets/Login_Image_NoBG.png");
const loginHeader = require("../../../assets/login_header.png");
const { height } = Dimensions.get("window");

type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Login"
>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const updateFormData = (field: keyof LoginFormData, value: string): void => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

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

  const authenticateUser = async (): Promise<void> => {
    setIsLoading(true);

    try {
      // Intentar login con AuthService
      const result = await AuthService.login(
        formData.username,
        formData.password
      );

      if (!result.success) {
        setIsLoading(false);
        Alert.alert("Error de autenticación", result.message);
        return;
      }

      // Login exitoso
      console.log("Usuario autenticado:", formData.username);

      // Verificar si ya existe un perfil, si no, crearlo
      let profile = await StorageService.getUserProfile();

      if (!profile || profile.username !== formData.username) {
        // Crear perfil inicial para este usuario
        profile = await StorageService.createInitialProfile(formData.username);
        console.log("Perfil inicial creado para:", formData.username);
      }

      setIsLoading(false);

      // Esto evita que el usuario pueda volver atrás con el botón back
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Home" }],
        })
      );
    } catch (error) {
      console.error("Error en autenticación:", error);
      setIsLoading(false);
      Alert.alert(
        "Error",
        "Hubo un problema al iniciar sesión. Intenta de nuevo."
      );
    }
  };

  const handleForgotPassword = (): void => {
    navigation.navigate("RecoverPassword");
  };

  const handleRegister = (): void => {
    navigation.navigate("Register");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.surface}
        translucent={false}
      />
      <ConnectivityIndicator />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.content}>
          <Image source={loginHeader} style={styles.loginHeader} />
          <Image source={loginImage} style={styles.loginImage} />
          <Text style={styles.title}>BeginnerCode</Text>
          <Text style={styles.subtitle}>Inicio de sesión</Text>
          <View style={styles.formContainer}>
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
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>¿No tienes una cuenta?</Text>
            <TouchableOpacity onPress={handleRegister} activeOpacity={0.6}>
              <Text style={styles.linkReg}>Regístrate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  container: {
    flex: 1,
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
