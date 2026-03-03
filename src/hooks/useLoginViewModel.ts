/**
 * ViewModel para la pantalla de Login
 */

import { useState } from "react";
import { Alert } from "react-native";
import { CommonActions } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/StackNavigator";
import { LoginFormData } from "../../types/index";
import StorageService from "../services/StorageService";
import AuthService from "../services/AuthService";

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, "Login">;

interface UseLoginViewModelProps {
  navigation: LoginScreenNavigationProp;
}

// ==========================================
// ESTADO
// ==========================================
interface LoginState {
  formData: LoginFormData;
  isLoading: boolean;
}

export const useLoginViewModel = ({ navigation }: UseLoginViewModelProps) => {
  const [state, setState] = useState<LoginState>({
    formData: { username: "", password: "" },
    isLoading: false,
  });

  // ==========================================
  // ACCIONES
  // ==========================================

  /**
   * Actualiza un campo del formulario
   */
  const updateFormData = (field: keyof LoginFormData, value: string): void => {
    setState((prev) => ({
      ...prev,
      formData: { ...prev.formData, [field]: value },
    }));
  };

  /**
   * Valida los campos del formulario antes de enviar
   */
  const validateForm = (): boolean => {
    if (!state.formData.username.trim()) {
      Alert.alert("Error", "Por favor, ingrese su usuario");
      return false;
    }
    if (!state.formData.password.trim()) {
      Alert.alert("Error", "Por favor, ingrese su contraseña");
      return false;
    }
    if (state.formData.password.length < 4) {
      Alert.alert("Error", "La contraseña debe tener al menos 4 caracteres");
      return false;
    }
    return true;
  };

  /**
   * Realiza el proceso de autenticación contra el servicio
   */
  const authenticateUser = async (): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const result = await AuthService.login(
        state.formData.username,
        state.formData.password
      );

      if (!result.success) {
        setState((prev) => ({ ...prev, isLoading: false }));
        Alert.alert("Error de autenticación", result.message);
        return;
      }

      console.log("Usuario autenticado:", state.formData.username);

      // Establecer usuario actual y cargar/crear perfil
      StorageService.setCurrentUsername(state.formData.username);

      let profile = await StorageService.getUserProfile(state.formData.username);
      if (!profile) {
        profile = await StorageService.createInitialProfile(state.formData.username);
        console.log("Perfil inicial creado para:", state.formData.username);
      } else {
        console.log("Perfil existente cargado para:", state.formData.username);
      }

      // Configurar sincronización con Supabase
      const SupabaseSyncService =
        require("../services/SupabaseSyncService").default;
      StorageService.setSyncCallback((profile) => {
        SupabaseSyncService.syncUserProfile(profile);
      });
      SupabaseSyncService.syncPendingChanges();

      setState((prev) => ({ ...prev, isLoading: false }));

      // Navegar al Home limpiando el stack (sin posibilidad de volver atrás)
      navigation.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: "Home" }] })
      );
    } catch (error) {
      console.error("Error en autenticación:", error);
      setState((prev) => ({ ...prev, isLoading: false }));
      Alert.alert("Error", "Hubo un problema al iniciar sesión. Intenta de nuevo.");
    }
  };

  /**
   * Muestra confirmación antes de autenticar
   */
  const handleLogin = (): void => {
    if (!validateForm()) return;

    Alert.alert(
      "Confirmación de inicio de sesión",
      `¿Deseas iniciar sesión como ${state.formData.username}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Aceptar", onPress: authenticateUser },
      ],
      { cancelable: false }
    );
  };

  /**
   * Navega a la pantalla de recuperación de contraseña
   */
  const handleForgotPassword = (): void => {
    navigation.navigate("RecoverPassword");
  };

  /**
   * Navega a la pantalla de registro
   */
  const handleRegister = (): void => {
    navigation.navigate("Register");
  };

  // ==========================================
  // INTERFACE PÚBLICA
  // ==========================================
  return {
    // Estado
    formData: state.formData,
    isLoading: state.isLoading,

    // Acciones
    updateFormData,
    handleLogin,
    handleForgotPassword,
    handleRegister,
  };
};
