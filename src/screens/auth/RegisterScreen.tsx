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
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ConnectivityIndicator from "../../components/ConnectivityIndicator";
import { MaterialIcons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { COLORS, FONT_SIZES } from "../../../types/index";
import AuthService, { RegisterData } from "../../services/AuthService";

type RegisterScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Register"
>;

interface RegisterScreenProps {
  navigation: RegisterScreenNavigationProp;
}

/**
 * Pantalla de Registro
 * Permite a nuevos usuarios crear una cuenta
 */
const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState<RegisterData>({
    username: "",
    email: "",
    password: "",
    securityQuestion: "",
    securityAnswer: "",
  });
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Preguntas de seguridad predefinidas
  const securityQuestions = [
    "¿Cuál es el nombre de tu primera mascota?",
    "¿En qué ciudad naciste?",
    "¿Cuál es tu comida favorita?",
    "¿Cuál es el nombre de tu mejor amigo de la infancia?",
    "¿Cuál es tu color favorito?",
  ];

  const updateFormData = (field: keyof RegisterData, value: string): void => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  /**
   * Valida el formulario completo
   */
  const validateForm = (): boolean => {
    // Validar username
    const usernameValidation = AuthService.validateUsername(formData.username);
    if (!usernameValidation.valid) {
      Alert.alert("Error", usernameValidation.message);
      return false;
    }

    // Validar email
    if (!formData.email.trim()) {
      Alert.alert("Error", "Por favor, ingrese su email");
      return false;
    }

    // Validar contraseña
    const passwordValidation = AuthService.validatePassword(formData.password);
    if (!passwordValidation.valid) {
      Alert.alert("Error", passwordValidation.message);
      return false;
    }

    // Validar confirmación de contraseña
    if (formData.password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return false;
    }

    // Validar pregunta de seguridad
    if (!formData.securityQuestion) {
      Alert.alert("Error", "Por favor, seleccione una pregunta de seguridad");
      return false;
    }

    // Validar respuesta de seguridad
    if (!formData.securityAnswer.trim()) {
      Alert.alert("Error", "Por favor, ingrese la respuesta de seguridad");
      return false;
    }

    if (formData.securityAnswer.trim().length < 2) {
      Alert.alert("Error", "La respuesta de seguridad es muy corta");
      return false;
    }

    return true;
  };

  /**
   * Maneja el proceso de registro
   */
  const handleRegister = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Intentar registrar usuario
      const result = await AuthService.register(formData);

      if (!result.success) {
        setIsLoading(false);
        Alert.alert("Error de registro", result.message);
        return;
      }

      // Registro exitoso
      // El perfil se creará cuando el usuario inicie sesión

      setIsLoading(false);

      Alert.alert(
        "¡Registro exitoso!",
        "Tu cuenta ha sido creada. Ya puedes iniciar sesión.",
        [
          {
            text: "Aceptar",
            onPress: () => navigation.replace("Login"),
          },
        ]
      );
    } catch (error) {
      console.error("Error en registro:", error);
      setIsLoading(false);
      Alert.alert(
        "Error",
        "Hubo un problema al crear tu cuenta. Intenta de nuevo."
      );
    }
  };

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
            onPress={() => navigation.goBack()}
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
                value={formData.username}
                onChangeText={(text) => updateFormData("username", text)}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
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
                value={formData.email}
                onChangeText={(text) => updateFormData("email", text)}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                editable={!isLoading}
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
                value={formData.password}
                onChangeText={(text) => updateFormData("password", text)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <MaterialIcons
                  name={showPassword ? "visibility" : "visibility-off"}
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
                  name={showConfirmPassword ? "visibility" : "visibility-off"}
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
              {securityQuestions.map((question, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.questionOption,
                    formData.securityQuestion === question &&
                      styles.questionSelected,
                  ]}
                  onPress={() => updateFormData("securityQuestion", question)}
                  disabled={isLoading}
                >
                  <MaterialIcons
                    name={
                      formData.securityQuestion === question
                        ? "radio-button-checked"
                        : "radio-button-unchecked"
                    }
                    size={20}
                    color={
                      formData.securityQuestion === question
                        ? COLORS.primary
                        : COLORS.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.questionText,
                      formData.securityQuestion === question &&
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
                value={formData.securityAnswer}
                onChangeText={(text) => updateFormData("securityAnswer", text)}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            {/* Botón de Registro */}
            <TouchableOpacity
              style={[styles.registerButton, { opacity: isLoading ? 0.6 : 1 }]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text style={styles.registerButtonText}>
                {isLoading ? "Creando cuenta..." : "Crear cuenta"}
              </Text>
            </TouchableOpacity>

            {/* Link a Login */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>¿Ya tienes una cuenta?</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("Login")}
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

export default RegisterScreen;
