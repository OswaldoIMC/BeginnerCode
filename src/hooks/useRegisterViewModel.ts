/**
 * ViewModel para la pantalla de Registro
 */

import { useState } from "react";
import { Alert } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/StackNavigator";
import AuthService, { RegisterData } from "../services/AuthService";

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, "Register">;

interface UseRegisterViewModelProps {
  navigation: RegisterScreenNavigationProp;
}

// ==========================================
// ESTADO
// ==========================================
interface RegisterState {
  formData: RegisterData;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  isLoading: boolean;
}

export const useRegisterViewModel = ({ navigation }: UseRegisterViewModelProps) => {
  const [state, setState] = useState<RegisterState>({
    formData: {
      username: "",
      email: "",
      password: "",
      securityQuestion: "",
      securityAnswer: "",
    },
    confirmPassword: "",
    showPassword: false,
    showConfirmPassword: false,
    isLoading: false,
  });

  // Preguntas de seguridad predefinidas
  const securityQuestions = [
    "¿Cuál es el nombre de tu primera mascota?",
    "¿En qué ciudad naciste?",
    "¿Cuál es tu comida favorita?",
    "¿Cuál es el nombre de tu mejor amigo de la infancia?",
    "¿Cuál es tu color favorito?",
  ];

  // ==========================================
  // ACCIONES
  // ==========================================

  /**
   * Actualiza un campo del formulario principal
   */
  const updateFormData = (field: keyof RegisterData, value: string): void => {
    setState((prev) => ({
      ...prev,
      formData: { ...prev.formData, [field]: value },
    }));
  };

  /**
   * Actualiza la confirmación de contraseña
   */
  const updateConfirmPassword = (value: string): void => {
    setState((prev) => ({ ...prev, confirmPassword: value }));
  };

  /**
   * Alterna la visibilidad de la contraseña
   */
  const toggleShowPassword = (): void => {
    setState((prev) => ({ ...prev, showPassword: !prev.showPassword }));
  };

  /**
   * Alterna la visibilidad de la confirmación de contraseña
   */
  const toggleShowConfirmPassword = (): void => {
    setState((prev) => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }));
  };

  /**
   * Valida todos los campos del formulario
   */
  const validateForm = (): boolean => {
    const usernameValidation = AuthService.validateUsername(state.formData.username);
    if (!usernameValidation.valid) {
      Alert.alert("Error", usernameValidation.message);
      return false;
    }

    if (!state.formData.email.trim()) {
      Alert.alert("Error", "Por favor, ingrese su email");
      return false;
    }

    const passwordValidation = AuthService.validatePassword(state.formData.password);
    if (!passwordValidation.valid) {
      Alert.alert("Error", passwordValidation.message);
      return false;
    }

    if (state.formData.password !== state.confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return false;
    }

    if (!state.formData.securityQuestion) {
      Alert.alert("Error", "Por favor, seleccione una pregunta de seguridad");
      return false;
    }

    if (!state.formData.securityAnswer.trim()) {
      Alert.alert("Error", "Por favor, ingrese la respuesta de seguridad");
      return false;
    }

    if (state.formData.securityAnswer.trim().length < 2) {
      Alert.alert("Error", "La respuesta de seguridad es muy corta");
      return false;
    }

    return true;
  };

  /**
   * Maneja el proceso completo de registro
   */
  const handleRegister = async (): Promise<void> => {
    if (!validateForm()) return;

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const result = await AuthService.register(state.formData);

      if (!result.success) {
        setState((prev) => ({ ...prev, isLoading: false }));
        Alert.alert("Error de registro", result.message);
        return;
      }

      setState((prev) => ({ ...prev, isLoading: false }));

      Alert.alert(
        "¡Registro exitoso!",
        "Tu cuenta ha sido creada. Ya puedes iniciar sesión.",
        [{ text: "Aceptar", onPress: () => navigation.replace("Login") }]
      );
    } catch (error) {
      console.error("Error en registro:", error);
      setState((prev) => ({ ...prev, isLoading: false }));
      Alert.alert("Error", "Hubo un problema al crear tu cuenta. Intenta de nuevo.");
    }
  };

  /**
   * Navega a la pantalla de Login
   */
  const handleNavigateToLogin = (): void => {
    navigation.navigate("Login");
  };

  /**
   * Vuelve a la pantalla anterior
   */
  const handleGoBack = (): void => {
    navigation.goBack();
  };

  // ==========================================
  // INTERFACE PÚBLICA
  // ==========================================
  return {
    // Estado
    formData: state.formData,
    confirmPassword: state.confirmPassword,
    showPassword: state.showPassword,
    showConfirmPassword: state.showConfirmPassword,
    isLoading: state.isLoading,

    // Datos
    securityQuestions,

    // Acciones
    updateFormData,
    updateConfirmPassword,
    toggleShowPassword,
    toggleShowConfirmPassword,
    handleRegister,
    handleNavigateToLogin,
    handleGoBack,
  };
};
