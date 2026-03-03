/**
 * Pantalla de Registro (REFACTORIZADA)
 */

import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ConnectivityIndicator from "../../components/ConnectivityIndicator";
import { MaterialIcons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { COLORS, FONT_SIZES } from "../../../types/index";
import { useRegisterViewModel } from "../../hooks/useRegisterViewModel";

// ==========================================
// TIPOS
// ==========================================
type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, "Register">;

interface RegisterScreenProps {
  navigation: RegisterScreenNavigationProp;
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  // ViewModel
  const viewModel = useRegisterViewModel({ navigation });

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar
        backgroundColor={COLORS.surface}
        barStyle="dark-content"
        translucent={false}
      />
      <ConnectivityIndicator />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={viewModel.handleGoBack}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Crear Cuenta</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            <Text style={styles.title}>Registro</Text>
            <Text style={styles.subtitle}>Completa los siguientes datos</Text>

            {/* Usuario */}
            <View style={styles.inputContainer}>
              <MaterialIcons
                name="person"
                size={20}
                color={COLORS.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Nombre de usuario"
                placeholderTextColor={COLORS.textSecondary}
                value={viewModel.formData.username}
                onChangeText={(text) => viewModel.updateFormData("username", text)}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!viewModel.isLoading}
              />
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <MaterialIcons
                name="email"
                size={20}
                color={COLORS.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={COLORS.textSecondary}
                value={viewModel.formData.email}
                onChangeText={(text) => viewModel.updateFormData("email", text)}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                editable={!viewModel.isLoading}
              />
            </View>

            {/* Contraseña */}
            <View style={styles.inputContainer}>
              <MaterialIcons
                name="lock"
                size={20}
                color={COLORS.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor={COLORS.textSecondary}
                value={viewModel.formData.password}
                onChangeText={(text) => viewModel.updateFormData("password", text)}
                secureTextEntry={!viewModel.showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!viewModel.isLoading}
              />
              <TouchableOpacity onPress={viewModel.toggleShowPassword}>
                <MaterialIcons
                  name={viewModel.showPassword ? "visibility" : "visibility-off"}
                  size={20}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Confirmar Contraseña */}
            <View style={styles.inputContainer}>
              <MaterialIcons
                name="lock"
                size={20}
                color={COLORS.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirmar contraseña"
                placeholderTextColor={COLORS.textSecondary}
                value={viewModel.confirmPassword}
                onChangeText={viewModel.updateConfirmPassword}
                secureTextEntry={!viewModel.showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!viewModel.isLoading}
              />
              <TouchableOpacity onPress={viewModel.toggleShowConfirmPassword}>
                <MaterialIcons
                  name={viewModel.showConfirmPassword ? "visibility" : "visibility-off"}
                  size={20}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Pregunta de Seguridad</Text>
            <Text style={styles.sectionSubtitle}>
              Selecciona una pregunta y respuesta para recuperar tu contraseña
            </Text>

            {/* Pregunta de Seguridad */}
            <View style={styles.questionsContainer}>
              {viewModel.securityQuestions.map((question, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.questionOption,
                    viewModel.formData.securityQuestion === question &&
                      styles.questionSelected,
                  ]}
                  onPress={() => viewModel.updateFormData("securityQuestion", question)}
                  disabled={viewModel.isLoading}
                >
                  <MaterialIcons
                    name={
                      viewModel.formData.securityQuestion === question
                        ? "radio-button-checked"
                        : "radio-button-unchecked"
                    }
                    size={20}
                    color={
                      viewModel.formData.securityQuestion === question
                        ? COLORS.primary
                        : COLORS.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.questionText,
                      viewModel.formData.securityQuestion === question &&
                        styles.questionTextSelected,
                    ]}
                  >
                    {question}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Respuesta de Seguridad */}
            <View style={styles.inputContainer}>
              <MaterialIcons
                name="question-answer"
                size={20}
                color={COLORS.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Tu respuesta"
                placeholderTextColor={COLORS.textSecondary}
                value={viewModel.formData.securityAnswer}
                onChangeText={(text) => viewModel.updateFormData("securityAnswer", text)}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!viewModel.isLoading}
              />
            </View>

            {/* Botón de Registro */}
            <TouchableOpacity
              style={[styles.registerButton, { opacity: viewModel.isLoading ? 0.6 : 1 }]}
              onPress={viewModel.handleRegister}
              disabled={viewModel.isLoading}
            >
              <Text style={styles.registerButtonText}>
                {viewModel.isLoading ? "Creando cuenta..." : "Crear cuenta"}
              </Text>
            </TouchableOpacity>

            {/* Link a Login */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>¿Ya tienes una cuenta?</Text>
              <TouchableOpacity
                onPress={viewModel.handleNavigateToLogin}
                activeOpacity={0.6}
              >
                <Text style={styles.loginLink}>Inicia sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;

// ==========================================
// ESTILOS
// ==========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  formContainer: {
    width: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 55,
    borderColor: COLORS.background,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: COLORS.background,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 20,
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    marginBottom: 15,
  },
  questionsContainer: {
    marginBottom: 20,
  },
  questionOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  questionSelected: {
    backgroundColor: COLORS.primary + "15",
    borderColor: COLORS.primary,
  },
  questionText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.text,
    marginLeft: 10,
    flex: 1,
  },
  questionTextSelected: {
    fontWeight: "600",
    color: COLORS.primary,
  },
  registerButton: {
    backgroundColor: COLORS.primary,
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    elevation: 2,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  registerButtonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.medium,
    fontWeight: "bold",
  },
  loginContainer: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  loginText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.medium,
  },
  loginLink: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.medium,
    fontWeight: "bold",
  },
});
