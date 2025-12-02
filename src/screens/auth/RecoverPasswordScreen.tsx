import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { COLORS, FONT_SIZES } from "../../../types/index";
import AuthService from "../../services/AuthService";

type RecoverPasswordScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "RecoverPassword"
>;

interface RecoverPasswordScreenProps {
  navigation: RecoverPasswordScreenNavigationProp;
}

/**
 * Pantalla de Recuperación de Contraseña
 * Permite a los usuarios recuperar su contraseña mediante pregunta de seguridad
 */
const RecoverPasswordScreen: React.FC<RecoverPasswordScreenProps> = ({
  navigation,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Usuario, 2: Pregunta, 3: Nueva contraseña
  const [username, setUsername] = useState<string>("");
  const [securityQuestion, setSecurityQuestion] = useState<string>("");
  const [securityAnswer, setSecurityAnswer] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * Paso 1: Verificar usuario
   */
  const handleCheckUsername = async (): Promise<void> => {
    if (!username.trim()) {
      Alert.alert("Error", "Por favor, ingrese su nombre de usuario");
      return;
    }

    setIsLoading(true);

    try {
      const result = await AuthService.getSecurityQuestion(username);

      if (!result.success) {
        setIsLoading(false);
        Alert.alert("Error", result.message);
        return;
      }

      setSecurityQuestion(result.question || "");
      setIsLoading(false);
      setStep(2);
    } catch (error) {
      console.error("Error al verificar usuario:", error);
      setIsLoading(false);
      Alert.alert("Error", "Hubo un problema. Intenta de nuevo.");
    }
  };

  /**
   * Paso 2: Verificar respuesta de seguridad
   */
  const handleVerifyAnswer = (): void => {
    if (!securityAnswer.trim()) {
      Alert.alert("Error", "Por favor, ingrese la respuesta de seguridad");
      return;
    }

    setStep(3);
  };

  /**
   * Paso 3: Cambiar contraseña
   */
  const handleResetPassword = async (): Promise<void> => {
    // Validar nueva contraseña
    const passwordValidation = AuthService.validatePassword(newPassword);
    if (!passwordValidation.valid) {
      Alert.alert("Error", passwordValidation.message);
      return;
    }

    // Verificar confirmación
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    setIsLoading(true);

    try {
      const result = await AuthService.resetPassword(
        username,
        securityAnswer,
        newPassword
      );

      if (!result.success) {
        setIsLoading(false);
        Alert.alert("Error", result.message);
        return;
      }

      setIsLoading(false);

      Alert.alert(
        "¡Contraseña cambiada!",
        "Tu contraseña ha sido actualizada exitosamente.",
        [
          {
            text: "Aceptar",
            onPress: () => navigation.replace("Login"),
          },
        ]
      );
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      setIsLoading(false);
      Alert.alert("Error", "Hubo un problema. Intenta de nuevo.");
    }
  };

  /**
   * Volver al paso anterior
   */
  const handleBack = (): void => {
    if (step === 1) {
      navigation.goBack();
    } else {
      setStep((step - 1) as 1 | 2);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaProvider>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
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
                    step >= 1 && styles.stepCircleActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepNumber,
                      step >= 1 && styles.stepNumberActive,
                    ]}
                  >
                    1
                  </Text>
                </View>
                <Text style={styles.stepLabel}>Usuario</Text>
              </View>
              <View
                style={[styles.stepLine, step >= 2 && styles.stepLineActive]}
              />
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    step >= 2 && styles.stepCircleActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepNumber,
                      step >= 2 && styles.stepNumberActive,
                    ]}
                  >
                    2
                  </Text>
                </View>
                <Text style={styles.stepLabel}>Verificar</Text>
              </View>
              <View
                style={[styles.stepLine, step >= 3 && styles.stepLineActive]}
              />
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    step >= 3 && styles.stepCircleActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepNumber,
                      step >= 3 && styles.stepNumberActive,
                    ]}
                  >
                    3
                  </Text>
                </View>
                <Text style={styles.stepLabel}>Contraseña</Text>
              </View>
            </View>

            {/* Paso 1: Ingresar usuario */}
            {step === 1 && (
              <View style={styles.stepContent}>
                <MaterialIcons
                  name="person-search"
                  size={80}
                  color={COLORS.primary}
                  style={styles.icon}
                />
                <Text style={styles.title}>Buscar cuenta</Text>
                <Text style={styles.subtitle}>
                  Ingresa tu nombre de usuario para comenzar el proceso de
                  recuperación
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
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.button, { opacity: isLoading ? 0.6 : 1 }]}
                  onPress={handleCheckUsername}
                  disabled={isLoading}
                >
                  <Text style={styles.buttonText}>
                    {isLoading ? "Verificando..." : "Continuar"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Paso 2: Responder pregunta de seguridad */}
            {step === 2 && (
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
                  <Text style={styles.questionText}>{securityQuestion}</Text>
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
                    value={securityAnswer}
                    onChangeText={setSecurityAnswer}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <TouchableOpacity
                  style={styles.button}
                  onPress={handleVerifyAnswer}
                >
                  <Text style={styles.buttonText}>Verificar</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Paso 3: Nueva contraseña */}
            {step === 3 && (
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
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <MaterialIcons
                      name={showPassword ? "visibility" : "visibility-off"}
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
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <MaterialIcons
                      name={
                        showConfirmPassword ? "visibility" : "visibility-off"
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
                  <Text style={styles.requirementItem}>
                    • Al menos 6 caracteres
                  </Text>
                  <Text style={styles.requirementItem}>
                    • Al menos una letra
                  </Text>
                  <Text style={styles.requirementItem}>
                    • Al menos un número
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.button, { opacity: isLoading ? 0.6 : 1 }]}
                  onPress={handleResetPassword}
                  disabled={isLoading}
                >
                  <Text style={styles.buttonText}>
                    {isLoading
                      ? "Cambiando contraseña..."
                      : "Cambiar contraseña"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaProvider>
    </KeyboardAvoidingView>
  );
};

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

export default RecoverPasswordScreen;
