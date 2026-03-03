/**
 * Pantalla de Login (REFACTORIZADA)
 */

import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { COLORS, FONT_SIZES } from "../../../types/index";
import ConnectivityIndicator from "../../components/ConnectivityIndicator";
import { useLoginViewModel } from "../../hooks/useLoginViewModel";

const loginImage = require("../../../assets/Login_Image_NoBG.png");
const loginHeader = require("../../../assets/login_header.png");
const { height } = Dimensions.get("window");

// ==========================================
// TIPOS
// ==========================================
type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, "Login">;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  // ViewModel
  const viewModel = useLoginViewModel({ navigation });

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
              value={viewModel.formData.username}
              onChangeText={(text) => viewModel.updateFormData("username", text)}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!viewModel.isLoading}
            />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor={COLORS.textSecondary}
              value={viewModel.formData.password}
              onChangeText={(text) => viewModel.updateFormData("password", text)}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!viewModel.isLoading}
            />
            <TouchableOpacity onPress={viewModel.handleForgotPassword}>
              <Text style={styles.linkForg}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.loginButton, { opacity: viewModel.isLoading ? 0.6 : 1 }]}
              onPress={viewModel.handleLogin}
              disabled={viewModel.isLoading}
            >
              <Text style={styles.loginButtonText}>
                {viewModel.isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>¿No tienes una cuenta?</Text>
            <TouchableOpacity onPress={viewModel.handleRegister} activeOpacity={0.6}>
              <Text style={styles.linkReg}>Regístrate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

// ==========================================
// ESTILOS
// ==========================================
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
