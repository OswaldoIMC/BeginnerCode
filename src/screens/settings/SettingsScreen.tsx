import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
  Alert,
  Modal,
  Linking,
  ActivityIndicator,
} from "react-native";
import * as Notifications from "expo-notifications";
import { SafeAreaView } from "react-native-safe-area-context";
import ConnectivityIndicator from "../../components/ConnectivityIndicator";
import { MaterialIcons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { FONT_SIZES } from "../../../types";
import StorageService from "../../services/StorageService";
import { CommonActions } from "@react-navigation/native";
import { useTheme } from "../../context/ThemeContext";
import NotificationService from "../../services/NotificationService";
import SupabaseSyncService from "../../services/SupabaseSyncService";

type SettingsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Settings"
>;

interface SettingsScreenProps {
  navigation: SettingsScreenNavigationProp;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  const { theme, isDarkMode, setDarkMode } = useTheme();

  // Estados de sincronización
  const [lastSyncDate, setLastSyncDate] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const initNotifications = async () => {
      const enabledInStorage =
        await NotificationService.getNotificationsEnabled();
      const { status } = await Notifications.getPermissionsAsync();
      setNotificationsEnabled(enabledInStorage && status === "granted");
    };
    initNotifications();

    // Cargar estado de sincronización
    loadSyncStatus();

    // Actualizar cada 30 segundos
    const interval = setInterval(loadSyncStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Carga el estado de sincronización
   */
  const loadSyncStatus = async () => {
    const lastSync = await SupabaseSyncService.getLastSyncDate();
    setLastSyncDate(lastSync);

    const online = await SupabaseSyncService.checkConnection();
    setIsOnline(online);
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
  const handleManualSync = async () => {
    if (!isOnline) {
      Alert.alert(
        "Sin conexión",
        "No hay conexión a internet. Los datos se sincronizarán automáticamente cuando te conectes."
      );
      return;
    }

    if (isSyncing) {
      return; // Ya está sincronizando
    }

    setIsSyncing(true);

    try {
      const success = await SupabaseSyncService.forceSyncNow();

      if (success) {
        await loadSyncStatus();
        Alert.alert(
          "Sincronización completada",
          "Tus datos han sido guardados en la nube exitosamente."
        );
      } else {
        Alert.alert(
          "Error de sincronización",
          "No se pudieron sincronizar todos los datos. Intenta de nuevo más tarde."
        );
      }
    } catch (error) {
      console.error("Error en sincronización manual:", error);
      Alert.alert(
        "Error",
        "Hubo un problema al sincronizar. Verifica tu conexión e intenta de nuevo."
      );
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * Elimina la cuenta y datos locales
   */
  const handleDeleteAccount = () => {
    Alert.alert(
      "Eliminar cuenta",
      "¿Estás seguro de que quieres eliminar la cuenta con todo tu progreso? \nEsta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            await StorageService.clearAllData();
            await SupabaseSyncService.clearSyncData();
            Alert.alert("Cuenta eliminada", "Tu cuenta ha sido eliminada.", [
              {
                text: "OK",
                onPress: () => {
                  navigation.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [{ name: "Login" }],
                    })
                  );
                },
              },
            ]);
          },
        },
      ]
    );
  };

  const handleSendEmail = () => {
    Linking.openURL("mailto:Oswaldo16667@hotmail.com");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.surface }]}
      edges={["top", "bottom"]}
    >
      <StatusBar
        backgroundColor={theme.primary}
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        translucent={false}
      />
      <ConnectivityIndicator />

      {/* Header */}
      <View style={[styles.headerBar, { backgroundColor: theme.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: "#fff" }]}>
          Configuración
        </Text>

        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.contentContainer}>
          {/* Sincronización en la Nube */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Sincronización
            </Text>

            {/* Estado de conexión */}
            <View style={[styles.syncCard, { backgroundColor: theme.card }]}>
              <View style={styles.syncHeader}>
                <View style={styles.syncInfo}>
                  <MaterialIcons
                    name={isOnline ? "cloud-done" : "cloud-off"}
                    size={24}
                    color={isOnline ? "#4CAF50" : theme.textSecondary}
                  />
                  <View style={styles.syncTextContainer}>
                    <Text style={[styles.syncTitle, { color: theme.text }]}>
                      {isOnline ? "Conectado" : "Sin conexión"}
                    </Text>
                    <Text
                      style={[
                        styles.syncSubtitle,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {formatLastSync(lastSyncDate)}
                    </Text>
                  </View>
                </View>

                {/* Botón de sincronización manual */}
                <TouchableOpacity
                  style={[
                    styles.syncButton,
                    {
                      backgroundColor: isOnline
                        ? theme.primary
                        : theme.textSecondary,
                    },
                    isSyncing && styles.syncButtonDisabled,
                  ]}
                  onPress={handleManualSync}
                  disabled={isSyncing || !isOnline}
                >
                  {isSyncing ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <MaterialIcons name="sync" size={20} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>

              {/* Descripción */}
              <Text
                style={[styles.syncDescription, { color: theme.textSecondary }]}
              >
                {isOnline
                  ? "Tus datos se guardan automáticamente en la nube. Presiona el botón para sincronizar ahora."
                  : "Sin conexión a internet. Los cambios se sincronizarán automáticamente cuando te conectes."}
              </Text>
            </View>
          </View>

          {/* Notificaciones */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Notificaciones
            </Text>

            <View style={[styles.settingRow, { backgroundColor: theme.card }]}>
              <View style={styles.settingInfo}>
                <MaterialIcons
                  name="notifications"
                  size={24}
                  color={theme.primary}
                />
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: theme.text }]}>
                    Notificaciones Push
                  </Text>
                  <Text
                    style={[
                      styles.settingDescription,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Recibe recordatorios de lecciones diarias
                  </Text>
                </View>
              </View>

              <Switch
                value={notificationsEnabled}
                onValueChange={async (value) => {
                  setNotificationsEnabled(value);
                  await NotificationService.setNotificationsEnabled(value);
                }}
                trackColor={{ false: theme.border, true: theme.primary + "80" }}
                thumbColor={notificationsEnabled ? theme.primary : "#f4f3f4"}
              />
            </View>
          </View>

          {/* Apariencia */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Apariencia
            </Text>

            <View style={[styles.settingRow, { backgroundColor: theme.card }]}>
              <View style={styles.settingInfo}>
                <MaterialIcons
                  name="dark-mode"
                  size={24}
                  color={theme.primary}
                />
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: theme.text }]}>
                    Tema Oscuro
                  </Text>
                  <Text
                    style={[
                      styles.settingDescription,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Cambia entre tema claro y oscuro
                  </Text>
                </View>
              </View>

              <Switch
                value={isDarkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: theme.border, true: theme.primary + "80" }}
                thumbColor={isDarkMode ? theme.primary : "#f4f3f4"}
              />
            </View>
          </View>

          {/* Soporte */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Soporte
            </Text>

            <TouchableOpacity
              style={[styles.optionButton, { backgroundColor: theme.card }]}
              onPress={() => setAboutModalVisible(true)}
            >
              <MaterialIcons name="info" size={24} color={theme.primary} />
              <Text style={[styles.optionText, { color: theme.text }]}>
                Acerca de
              </Text>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Cuenta */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Cuenta
            </Text>

            <TouchableOpacity
              style={[
                styles.optionButton,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.error,
                  borderWidth: 1,
                },
              ]}
              onPress={handleDeleteAccount}
            >
              <MaterialIcons name="clear" size={24} color={theme.error} />
              <Text style={[styles.optionText, { color: theme.error }]}>
                Eliminar cuenta
              </Text>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={theme.error}
              />
            </TouchableOpacity>
          </View>

          {/* Versión */}
          <View style={styles.versionContainer}>
            <Text style={[styles.versionText, { color: theme.textSecondary }]}>
              BeginnerCode v1.0.0
            </Text>
          </View>

          <View style={{ height: 30 }} />
        </View>
      </ScrollView>

      {/* Modal "Acerca de" */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={aboutModalVisible}
        onRequestClose={() => setAboutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContainer, { backgroundColor: theme.card }]}
          >
            {/* Header del Modal */}
            <View style={styles.modalHeader}>
              <MaterialIcons
                name="info"
                size={50}
                color={theme.primary}
                style={styles.modalIcon}
              />
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Acerca de BeginnerCode
              </Text>
            </View>

            {/* Contenido del Modal */}
            <ScrollView style={styles.modalContent}>
              <Text style={[styles.modalText, { color: theme.text }]}>
                BeginnerCode es una aplicación educativa diseñada para ayudar a
                principiantes a aprender programación de forma interactiva y
                divertida.
              </Text>

              <View style={styles.modalSection}>
                <Text style={[styles.modalSectionTitle, { color: theme.text }]}>
                  Desarrollo
                </Text>
                <Text
                  style={[styles.modalText, { color: theme.textSecondary }]}
                >
                  Desarrollado por Oswaldo Iván Martínez
                </Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={[styles.modalSectionTitle, { color: theme.text }]}>
                  Contacto
                </Text>
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={handleSendEmail}
                >
                  <MaterialIcons name="email" size={20} color={theme.primary} />
                  <Text
                    style={[styles.contactButtonText, { color: theme.primary }]}
                  >
                    Oswaldo16667@hotmail.com
                  </Text>
                </TouchableOpacity>
              </View>

              <View
                style={[styles.modalFooter, { borderTopColor: theme.border }]}
              >
                <Text
                  style={[
                    styles.modalFooterText,
                    { color: theme.textSecondary },
                  ]}
                >
                  Versión 1.0.0
                </Text>
                <Text
                  style={[
                    styles.modalFooterText,
                    { color: theme.textSecondary },
                  ]}
                >
                  © 2025 BeginnerCode
                </Text>
              </View>
            </ScrollView>

            {/* Botón Cerrar */}
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.primary }]}
              onPress={() => setAboutModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    elevation: 4,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  scrollView: { flex: 1 },
  contentContainer: { paddingBottom: 20 },
  sectionContainer: { paddingHorizontal: 15, marginBottom: 25, marginTop: 10 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    marginLeft: 5,
  },
  syncCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  syncHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  syncInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  syncTextContainer: {
    flex: 1,
  },
  syncTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  syncSubtitle: {
    fontSize: 12,
  },
  syncButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  syncButtonDisabled: {
    opacity: 0.6,
  },
  syncDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  settingInfo: { flexDirection: "row", alignItems: "center", flex: 1, gap: 15 },
  settingTextContainer: { flex: 1 },
  settingLabel: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  settingDescription: { fontSize: 13 },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    gap: 15,
  },
  optionText: { fontSize: 16, flex: 1 },
  versionContainer: { alignItems: "center", marginTop: 20 },
  versionText: { fontSize: 14 },
  // Estilos del Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 500,
    maxHeight: "90%",
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  modalIcon: {
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  modalContent: {
    maxHeight: 400,
  },
  modalText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 15,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  contactButtonText: {
    fontSize: 15,
    textDecorationLine: "underline",
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  linkButtonText: {
    fontSize: 15,
    flex: 1,
  },
  modalFooter: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    alignItems: "center",
  },
  modalFooterText: {
    fontSize: 12,
    marginBottom: 5,
  },
  closeButton: {
    marginTop: 15,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
