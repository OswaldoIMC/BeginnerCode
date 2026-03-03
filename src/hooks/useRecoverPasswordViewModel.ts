/**
 * ViewModel para la pantalla de Recuperación de Contraseña
 */

import { useState } from "react";
import { Alert } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/StackNavigator";
import AuthService from "../services/AuthService";

type RecoverPasswordScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "RecoverPassword"
>;

interface UseRecoverPasswordViewModelProps {
  navigation: RecoverPasswordScreenNavigationProp;
}

// ==========================================
// ESTADO
// ==========================================
interface RecoverPasswordState {
  step: 1 | 2 | 3;
  username: string;
  securityQuestion: string;
  securityAnswer: string;
  newPassword: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  isLoading: boolean;
}

export const useRecoverPasswordViewModel = ({
  navigation,
}: UseRecoverPasswordViewModelProps) => {
  const [state, setState] = useState<RecoverPasswordState>({
    step: 1,
    username: "",
    securityQuestion: "",
    securityAnswer: "",
    newPassword: "",
    confirmPassword: "",
    showPassword: false,
    showConfirmPassword: false,
    isLoading: false,
  });

  // ==========================================
  // ACCIONES
  // ==========================================

  /**
   * Actualiza el nombre de usuario (paso 1)
   */
  const updateUsername = (value: string): void => {
    setState((prev) => ({ ...prev, username: value }));
  };

  /**
   * Actualiza la respuesta de seguridad (paso 2)
   */
  const updateSecurityAnswer = (value: string): void => {
    setState((prev) => ({ ...prev, securityAnswer: value }));
  };

  /**
   * Actualiza la nueva contraseña (paso 3)
   */
  const updateNewPassword = (value: string): void => {
    setState((prev) => ({ ...prev, newPassword: value }));
  };

  /**
   * Actualiza la confirmación de contraseña (paso 3)
   */
  const updateConfirmPassword = (value: string): void => {
    setState((prev) => ({ ...prev, confirmPassword: value }));
  };

  /**
   * Alterna la visibilidad de la nueva contraseña
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
   * Paso 1: Verifica que el usuario existe y obtiene su pregunta de seguridad
   */
  const handleCheckUsername = async (): Promise<void> => {
    if (!state.username.trim()) {
      Alert.alert("Error", "Por favor, ingrese su nombre de usuario");
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const result = await AuthService.getSecurityQuestion(state.username);

      if (!result.success) {
        setState((prev) => ({ ...prev, isLoading: false }));
        Alert.alert("Error", result.message);
        return;
      }

      setState((prev) => ({
        ...prev,
        securityQuestion: result.question || "",
        isLoading: false,
        step: 2,
      }));
    } catch (error) {
      console.error("Error al verificar usuario:", error);
      setState((prev) => ({ ...prev, isLoading: false }));
      Alert.alert("Error", "Hubo un problema. Intenta de nuevo.");
    }
  };

  /**
   * Paso 2: Verifica que la respuesta no esté vacía y avanza al paso 3
   */
  const handleVerifyAnswer = (): void => {
    if (!state.securityAnswer.trim()) {
      Alert.alert("Error", "Por favor, ingrese la respuesta de seguridad");
      return;
    }
    setState((prev) => ({ ...prev, step: 3 }));
  };

  /**
   * Paso 3: Cambia la contraseña del usuario
   */
  const handleResetPassword = async (): Promise<void> => {
    const passwordValidation = AuthService.validatePassword(state.newPassword);
    if (!passwordValidation.valid) {
      Alert.alert("Error", passwordValidation.message);
      return;
    }

    if (state.newPassword !== state.confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const result = await AuthService.resetPassword(
        state.username,
        state.securityAnswer,
        state.newPassword
      );

      if (!result.success) {
        setState((prev) => ({ ...prev, isLoading: false }));
        Alert.alert("Error", result.message);
        return;
      }

      setState((prev) => ({ ...prev, isLoading: false }));

      Alert.alert(
        "¡Contraseña cambiada!",
        "Tu contraseña ha sido actualizada exitosamente.",
        [{ text: "Aceptar", onPress: () => navigation.replace("Login") }]
      );
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      setState((prev) => ({ ...prev, isLoading: false }));
      Alert.alert("Error", "Hubo un problema. Intenta de nuevo.");
    }
  };

  /**
   * Vuelve al paso anterior o a la pantalla anterior si está en el paso 1
   */
  const handleBack = (): void => {
    if (state.step === 1) {
      navigation.goBack();
    } else {
      setState((prev) => ({ ...prev, step: (prev.step - 1) as 1 | 2 }));
    }
  };

  // ==========================================
  // INTERFACE PÚBLICA
  // ==========================================
  return {
    // Estado
    step: state.step,
    username: state.username,
    securityQuestion: state.securityQuestion,
    securityAnswer: state.securityAnswer,
    newPassword: state.newPassword,
    confirmPassword: state.confirmPassword,
    showPassword: state.showPassword,
    showConfirmPassword: state.showConfirmPassword,
    isLoading: state.isLoading,

    // Acciones
    updateUsername,
    updateSecurityAnswer,
    updateNewPassword,
    updateConfirmPassword,
    toggleShowPassword,
    toggleShowConfirmPassword,
    handleCheckUsername,
    handleVerifyAnswer,
    handleResetPassword,
    handleBack,
  };
};
