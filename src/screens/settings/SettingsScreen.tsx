import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { COLORS, FONT_SIZES } from "../../../types";
import StorageService from "../../services/StorageService";
import { CommonActions } from "@react-navigation/native";

/**
 * Props de navegación para esta pantalla
 */
type SettingsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Settings"
>;

interface SettingsScreenProps {
  navigation: SettingsScreenNavigationProp;
}

/**
 * Pantalla de configuración
 * Permite al usuario ajustar notificaciones, tema, idioma, etc.
 */
const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const [notificationsEnabled, setNotificationsEnabled] =
    useState<boolean>(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState<boolean>(false);

  /**
   * Maneja el reinicio de progreso
   */
  const handleResetProgress = () => {
    Alert.alert(
      "Reiniciar Progreso",
      "¿Estás seguro de que quieres reiniciar todo tu progreso? Esta acción no se puede deshacer.",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Reiniciar",
          style: "destructive",
          onPress: async () => {
            await StorageService.clearAllData();
            Alert.alert(
              "Progreso reiniciado",
              "Tu progreso ha sido reiniciado. Por favor, inicia sesión nuevamente.",
              [
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
              ]
            );
          },
        },
      ]
    );
  };

  /**
   * Maneja el cierre de sesión
   */
  const handleLogout = () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Cerrar sesión",
          style: "destructive",
          onPress: () => {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: "Login" }],
              })
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaProvider style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuración</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Sección de Notificaciones */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Notificaciones</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <MaterialIcons
                name="notifications"
                size={24}
                color={COLORS.primary}
              />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Notificaciones Push</Text>
                <Text style={styles.settingDescription}>
                  Recibe recordatorios de lecciones diarias
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#E0E0E0", true: COLORS.primary + "80" }}
              thumbColor={notificationsEnabled ? COLORS.primary : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Sección de Apariencia */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Apariencia</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <MaterialIcons
                name="dark-mode"
                size={24}
                color={COLORS.primary}
              />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Tema Oscuro</Text>
                <Text style={styles.settingDescription}>
                  Cambia entre tema claro y oscuro
                </Text>
              </View>
            </View>
            <Switch
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              trackColor={{ false: "#E0E0E0", true: COLORS.primary + "80" }}
              thumbColor={darkModeEnabled ? COLORS.primary : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Sección de Ayuda */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Soporte</Text>

          <TouchableOpacity style={styles.optionButton}>
            <MaterialIcons name="info" size={24} color={COLORS.primary} />
            <Text style={styles.optionText}>Acerca de</Text>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Sección de Cuenta */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Cuenta</Text>

          <TouchableOpacity
            style={[styles.optionButton, styles.dangerButton]}
            onPress={handleResetProgress}
          >
            <MaterialIcons name="refresh" size={24} color={COLORS.error} />
            <Text style={[styles.optionText, { color: COLORS.error }]}>
              Reiniciar progreso
            </Text>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={COLORS.error}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionButton, styles.dangerButton]}
            onPress={handleLogout}
          >
            <MaterialIcons name="clear" size={24} color={COLORS.error} />
            <Text style={[styles.optionText, { color: COLORS.error }]}>
              Eliminar cuenta
            </Text>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={COLORS.error}
            />
          </TouchableOpacity>
        </View>

        {/* Versión de la app */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>BeginnerCode v1.0.0</Text>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaProvider>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 15,
    elevation: 4,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: "bold",
    color: COLORS.surface,
    flex: 1,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  sectionContainer: {
    paddingHorizontal: 15,
    marginBottom: 25,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 15,
    marginLeft: 5,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 15,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    gap: 15,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  versionContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  versionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  dangerButton: {
    borderWidth: 1,
    borderColor: COLORS.error + "40",
  },
});
