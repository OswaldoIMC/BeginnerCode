/**
 * ViewModel para la pantalla de Configuracion
 */

import { useState, useEffect } from "react";
import { Alert, Linking } from "react-native";
import * as Notifications from "expo-notifications";
import { CommonActions } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/StackNavigator";
import StorageService from "../services/StorageService";
import AuthService from "../services/AuthService";
import NotificationService from "../services/NotificationService";
import SupabaseSyncService from "../services/SupabaseSyncService";

type SettingsNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Settings"
>;

interface UseSettingsViewModelProps {
  navigation: SettingsNavigationProp;
}

// ==========================================
// ESTADO
// ==========================================
interface SettingsState {
  notificationsEnabled: boolean;
  aboutModalVisible: boolean;
  lastSyncDate: Date | null;
  isSyncing: boolean;
  isOnline: boolean;
}

export const useSettingsViewModel = ({
  navigation,
}: UseSettingsViewModelProps) => {
  const [state, setState] = useState<SettingsState>({
    notificationsEnabled: true,
    aboutModalVisible: false,
    lastSyncDate: null,
    isSyncing: false,
    isOnline: true,
  });

  // ==========================================
  // EFECTOS
  // ==========================================

  useEffect(() => {
    const initNotifications = async () => {
      const enabledInStorage =
        await NotificationService.getNotificationsEnabled();
      const { status } = await Notifications.getPermissionsAsync();
      setState((prev) => ({
        ...prev,
        notificationsEnabled: enabledInStorage && status === "granted",
      }));
    };
    initNotifications();

    // Cargar estado de sincronización
    loadSyncStatus();

    // Actualizar cada 30 segundos
    const interval = setInterval(loadSyncStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // ==========================================
  // LÓGICA DE NEGOCIO
  // ==========================================

  /**
   * Carga el estado de sincronización
   */
  const loadSyncStatus = async (): Promise<void> => {
    const lastSync = await SupabaseSyncService.getLastSyncDate();
    const online = await SupabaseSyncService.checkConnection();
    setState((prev) => ({
      ...prev,
      lastSyncDate: lastSync,
      isOnline: online,
    }));
  };

  /**
   * Formatea el tiempo desde la última sincronización
   */
  const formatLastSync = (date: Date | null): string => {
    if (!date) return "Nunca sincronizado";

    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) return "Hace menos de un minuto";
    if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `Hace ${minutes} minuto${minutes > 1 ? "s" : ""}`;
    }
    if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      return `Hace ${hours} hora${hours > 1 ? "s" : ""}`;
    }
    const days = Math.floor(seconds / 86400);
    return `Hace ${days} día${days > 1 ? "s" : ""}`;
  };

  /**
   * Sincroniza manualmente con la nube
   */
  const handleManualSync = async (): Promise<void> => {
    if (!state.isOnline) {
      Alert.alert(
        "Sin conexión",
        "No hay conexión a internet. Los datos se sincronizarán automáticamente cuando te conectes.",
      );
      return;
    }

    if (state.isSyncing) {
      return;
    }

    setState((prev) => ({ ...prev, isSyncing: true }));

    try {
      const success = await SupabaseSyncService.forceSyncNow();

      if (success) {
        await loadSyncStatus();
        Alert.alert(
          "Sincronización completada",
          "Tus datos han sido guardados en la nube exitosamente.",
        );
      } else {
        Alert.alert(
          "Error de sincronización",
          "No se pudieron sincronizar todos los datos. Intenta de nuevo más tarde.",
        );
      }
    } catch (error) {
      console.error("Error en sincronización manual:", error);
      Alert.alert(
        "Error",
        "Hubo un problema al sincronizar. Verifica tu conexión e intenta de nuevo.",
      );
    } finally {
      setState((prev) => ({ ...prev, isSyncing: false }));
    }
  };

  /**
   * Elimina la cuenta y TODOS los datos (local y Supabase)
   */
  const handleDeleteAccount = (): void => {
    Alert.alert(
      "Eliminar cuenta",
      "¿Estás seguro de que quieres eliminar la cuenta con todo tu progreso?\n\nEsta acción eliminará:\n• Todos tus datos locales\n• Tu cuenta de la nube (Supabase)\n• Todo tu progreso y medallas\n\nEsta acción NO se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const currentUsername = StorageService.getCurrentUsername();

              if (!currentUsername) {
                Alert.alert(
                  "Error",
                  "No se pudo identificar el usuario actual",
                );
                return;
              }

              console.log(
                `Iniciando eliminación de cuenta para: ${currentUsername}`,
              );

              // 1. Eliminar de Supabase primero (requiere conexión)
              const isOnline = await SupabaseSyncService.checkConnection();

              if (isOnline) {
                const supabaseDeleted =
                  await SupabaseSyncService.deleteUserAccount(currentUsername);

                if (supabaseDeleted) {
                  console.log("Cuenta eliminada de Supabase");
                } else {
                  console.warn(
                    "No se pudo eliminar de Supabase, continuando con local",
                  );
                }
              } else {
                console.warn("Sin conexión - solo se eliminarán datos locales");
                Alert.alert(
                  "Sin conexión",
                  "No hay conexión a internet. Solo se eliminarán los datos locales. Para eliminar completamente la cuenta, conéctate a internet y vuelve a intentarlo.",
                  [{ text: "Entendido" }],
                );
              }

              // 2. Cerrar sesión PRIMERO
              await AuthService.logout();
              console.log("Sesión cerrada");

              // 3. Eliminar cuenta de AuthService
              await AuthService.deleteAccount(currentUsername);
              console.log("Datos de autenticación eliminados");

              // 4. Eliminar todos los datos locales del usuario
              await StorageService.deleteUserData(currentUsername);
              console.log("Datos locales del usuario eliminados");

              // 5. Limpiar el usuario actual de StorageService
              StorageService.setCurrentUsername(null);
              console.log("Usuario actual limpiado de StorageService");

              // 6. Limpiar datos de sincronización
              await SupabaseSyncService.clearSyncData();
              console.log("Datos de sincronización eliminados");

              // 7. Mostrar confirmación y redirigir al login
              Alert.alert(
                "Cuenta eliminada",
                isOnline
                  ? "Tu cuenta y todos tus datos han sido eliminados completamente."
                  : "Tus datos locales han sido eliminados. La cuenta en la nube se eliminará cuando te conectes a internet.",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      navigation.dispatch(
                        CommonActions.reset({
                          index: 0,
                          routes: [{ name: "Login" }],
                        }),
                      );
                    },
                  },
                ],
              );
            } catch (error) {
              console.error("Error al eliminar cuenta:", error);
              Alert.alert(
                "Error",
                "Hubo un problema al eliminar la cuenta. Por favor intenta de nuevo.",
              );
            }
          },
        },
      ],
    );
  };

  /**
   * Abre el cliente de correo
   */
  const handleSendEmail = (): void => {
    Linking.openURL("mailto:Oswaldo16667@hotmail.com");
  };

  /**
   * Cambia el estado del modal "Acerca de"
   */
  const setAboutModalVisible = (visible: boolean): void => {
    setState((prev) => ({ ...prev, aboutModalVisible: visible }));
  };

  /**
   * Cambia el estado de las notificaciones
   */
  const handleNotificationToggle = async (value: boolean): Promise<void> => {
    setState((prev) => ({ ...prev, notificationsEnabled: value }));
    await NotificationService.setNotificationsEnabled(value);
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
    notificationsEnabled: state.notificationsEnabled,
    aboutModalVisible: state.aboutModalVisible,
    lastSyncDate: state.lastSyncDate,
    isSyncing: state.isSyncing,
    isOnline: state.isOnline,

    // Datos computados
    formattedLastSync: formatLastSync(state.lastSyncDate),

    // Acciones
    handleManualSync,
    handleDeleteAccount,
    handleSendEmail,
    setAboutModalVisible,
    handleNotificationToggle,
    handleGoBack,
  };
};
