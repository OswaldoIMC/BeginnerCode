/**
 * Pantalla de Recuperación de Contraseña (REFACTORIZADA)
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
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import ConnectivityIndicator from "../../components/ConnectivityIndicator";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { COLORS, FONT_SIZES } from "../../../types/index";
import { useRecoverPasswordViewModel } from "../../hooks/useRecoverPasswordViewModel";

// ==========================================
// TIPOS
// ==========================================
type RecoverPasswordScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "RecoverPassword"
>;

interface RecoverPasswordScreenProps {
  navigation: RecoverPasswordScreenNavigationProp;
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
const RecoverPasswordScreen: React.FC<RecoverPasswordScreenProps> = ({
  navigation,
}) => {
  // ViewModel
  const viewModel = useRecoverPasswordViewModel({ navigation });

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
          <TouchableOpacity onPress={viewModel.handleBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Recuperar Contraseña</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            {/* Indicador de pasos */}
            <View style={styles.stepsContainer}>
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    viewModel.step >= 1 && styles.stepCircleActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepNumber,
                      viewModel.step >= 1 && styles.stepNumberActive,
                    ]}
                  >
                    1
                  </Text>
                </View>
                <Text style={styles.stepLabel}>Usuario</Text>
              </View>
              <View
                style={[styles.stepLine, viewModel.step >= 2 && styles.stepLineActive]}
              />
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    viewModel.step >= 2 && styles.stepCircleActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepNumber,
                      viewModel.step >= 2 && styles.stepNumberActive,
                    ]}
                  >
                    2
                  </Text>
                </View>
                <Text style={styles.stepLabel}>Verificar</Text>
              </View>
              <View
                style={[styles.stepLine, viewModel.step >= 3 && styles.stepLineActive]}
              />
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    viewModel.step >= 3 && styles.stepCircleActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepNumber,
                      viewModel.step >= 3 && styles.stepNumberActive,
                    ]}
                  >
                    3
                  </Text>
                </View>
                <Text style={styles.stepLabel}>Contraseña</Text>
              </View>
            </View>

            {/* Paso 1: Ingresar usuario */}
            {viewModel.step === 1 && (
              <View style={styles.stepContent}>
                <MaterialIcons
                  name="person-search"
                  size={80}
                  color={COLORS.primary}
                  style={styles.icon}
                />
                <Text style={styles.title}>Buscar cuenta</Text>
                <Text style={styles.subtitle}>
                  Ingresa tu nombre de usuario para comenzar el proceso de recuperación
                </Text>

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
                    value={viewModel.username}
                    onChangeText={viewModel.updateUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!viewModel.isLoading}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.button, { opacity: viewModel.isLoading ? 0.6 : 1 }]}
                  onPress={viewModel.handleCheckUsername}
                  disabled={viewModel.isLoading}
                >
                  <Text style={styles.buttonText}>
                    {viewModel.isLoading ? "Verificando..." : "Continuar"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Paso 2: Responder pregunta de seguridad */}
            {viewModel.step === 2 && (
              <View style={styles.stepContent}>
                <MaterialIcons
                  name="help"
                  size={80}
                  color={COLORS.primary}
                  style={styles.icon}
                />
                <Text style={styles.title}>Pregunta de seguridad</Text>
                <Text style={styles.subtitle}>
                  Responde tu pregunta de seguridad para verificar tu identidad
                </Text>

                <View style={styles.questionCard}>
                  <Text style={styles.questionLabel}>Tu pregunta:</Text>
                  <Text style={styles.questionText}>{viewModel.securityQuestion}</Text>
                </View>

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
                    value={viewModel.securityAnswer}
                    onChangeText={viewModel.updateSecurityAnswer}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <TouchableOpacity
                  style={styles.button}
                  onPress={viewModel.handleVerifyAnswer}
                >
                  <Text style={styles.buttonText}>Verificar</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Paso 3: Nueva contraseña */}
            {viewModel.step === 3 && (
              <View style={styles.stepContent}>
                <MaterialIcons
                  name="lock-reset"
                  size={80}
                  color={COLORS.primary}
                  style={styles.icon}
                />
                <Text style={styles.title}>Nueva contraseña</Text>
                <Text style={styles.subtitle}>Ingresa tu nueva contraseña</Text>

                <View style={styles.inputContainer}>
                  <MaterialIcons
                    name="lock"
                    size={20}
                    color={COLORS.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Nueva contraseña"
                    placeholderTextColor={COLORS.textSecondary}
                    value={viewModel.newPassword}
                    onChangeText={viewModel.updateNewPassword}
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
                      name={
                        viewModel.showConfirmPassword ? "visibility" : "visibility-off"
                      }
                      size={20}
                      color={COLORS.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.passwordRequirements}>
                  <Text style={styles.requirementsTitle}>
                    La contraseña debe tener:
                  </Text>
                  <Text style={styles.requirementItem}>• Al menos 6 caracteres</Text>
                  <Text style={styles.requirementItem}>• Al menos una letra</Text>
                  <Text style={styles.requirementItem}>• Al menos un número</Text>
                </View>

                <TouchableOpacity
                  style={[styles.button, { opacity: viewModel.isLoading ? 0.6 : 1 }]}
                  onPress={viewModel.handleResetPassword}
                  disabled={viewModel.isLoading}
                >
                  <Text style={styles.buttonText}>
                    {viewModel.isLoading ? "Cambiando contraseña..." : "Cambiar contraseña"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RecoverPasswordScreen;

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
  stepsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  stepItem: {
    alignItems: "center",
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  stepCircleActive: {
    backgroundColor: COLORS.primary,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textSecondary,
  },
  stepNumberActive: {
    color: "#fff",
  },
  stepLabel: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.background,
    marginHorizontal: 8,
    marginBottom: 28,
  },
  stepLineActive: {
    backgroundColor: COLORS.primary,
  },
  stepContent: {
    alignItems: "center",
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    marginBottom: 30,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
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
  questionCard: {
    width: "100%",
    backgroundColor: COLORS.primary + "15",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  questionLabel: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    marginBottom: 8,
    fontWeight: "600",
  },
  questionText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    fontWeight: "600",
  },
  passwordRequirements: {
    width: "100%",
    backgroundColor: COLORS.background,
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  requirementsTitle: {
    fontSize: FONT_SIZES.small,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  requirementItem: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  button: {
    backgroundColor: COLORS.primary,
    width: "100%",
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    elevation: 2,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.medium,
    fontWeight: "bold",
  },
});
