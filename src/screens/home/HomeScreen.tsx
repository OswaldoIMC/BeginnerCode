/**
 * Pantalla de Home (REFACTORIZADA)
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  StatusBar,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ConnectivityIndicator from "../../components/ConnectivityIndicator";
import { MaterialIcons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { FONT_SIZES } from "../../../types";
import { useTheme } from "../../context/ThemeContext";
import { useHomeViewModel } from "../../hooks/useHomeViewModel";

// ==========================================
// TIPOS
// ==========================================
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();

  // ViewModel
  const viewModel = useHomeViewModel({ navigation });

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.surface }]}
    >
      <StatusBar
        backgroundColor={theme.primary}
        barStyle={isDarkMode ? "light-content" : "dark-content"}
      />

      <ConnectivityIndicator />

      {/* Header */}
      <View style={[styles.headerBar, { backgroundColor: theme.primary }]}>
        <Text style={[styles.headerTitle, { color: theme.surface }]}>
          BeginnerCode
        </Text>

        <TouchableOpacity
          onPress={() => viewModel.setMenuVisible(true)}
          style={styles.iconButton}
        >
          <MaterialIcons name="menu" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Menu Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={viewModel.menuVisible}
      >
        <Pressable
          style={styles.menuOverlay}
          onPress={() => viewModel.setMenuVisible(false)}
        >
          <Pressable
            style={[styles.menuContainer, { backgroundColor: theme.surface }]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header menú */}
            <View
              style={[
                styles.modalHeader,
                { borderBottomColor: theme.background },
              ]}
            >
              <MaterialIcons name="menu" size={28} color={theme.primary} />
              <Text style={[styles.menuTitle, { color: theme.text }]}>
                Menú
              </Text>
              <TouchableOpacity onPress={() => viewModel.setMenuVisible(false)}>
                <MaterialIcons
                  name="close"
                  size={24}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Opciones */}
            <View style={styles.menuOptions}>
              {/* Perfil */}
              <Pressable
                style={styles.menuOption}
                onPress={viewModel.handleNavigateToProfile}
              >
                <View
                  style={[
                    styles.menuIconContainer,
                    { backgroundColor: theme.primary + "15" },
                  ]}
                >
                  <MaterialIcons
                    name="person"
                    size={24}
                    color={theme.primary}
                  />
                </View>

                <View style={styles.menuTextContainer}>
                  <Text style={[styles.menuOptionTitle, { color: theme.text }]}>
                    Mi Perfil
                  </Text>
                  <Text
                    style={[
                      styles.menuOptionDescription,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Ver estadísticas y medallas
                  </Text>
                </View>

                <MaterialIcons
                  name="chevron-right"
                  size={24}
                  color={theme.textSecondary}
                />
              </Pressable>

              {/* Configuración */}
              <Pressable
                style={styles.menuOption}
                onPress={viewModel.handleNavigateToSettings}
              >
                <View
                  style={[
                    styles.menuIconContainer,
                    { backgroundColor: theme.primary + "15" },
                  ]}
                >
                  <MaterialIcons
                    name="settings"
                    size={24}
                    color={theme.primary}
                  />
                </View>

                <View style={styles.menuTextContainer}>
                  <Text style={[styles.menuOptionTitle, { color: theme.text }]}>
                    Configuración
                  </Text>
                  <Text
                    style={[
                      styles.menuOptionDescription,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Ajustes de la aplicación
                  </Text>
                </View>

                <MaterialIcons
                  name="chevron-right"
                  size={24}
                  color={theme.textSecondary}
                />
              </Pressable>

              {/* Divider */}
              <View
                style={[
                  styles.menuDivider,
                  { backgroundColor: theme.background },
                ]}
              />

              {/* Cerrar sesión */}
              <Pressable style={styles.menuOption} onPress={viewModel.handleLogout}>
                <View
                  style={[
                    styles.menuIconContainer,
                    { backgroundColor: theme.error + "15" },
                  ]}
                >
                  <MaterialIcons name="logout" size={24} color={theme.error} />
                </View>

                <View style={styles.menuTextContainer}>
                  <Text
                    style={[styles.menuOptionTitle, { color: theme.error }]}
                  >
                    Cerrar Sesión
                  </Text>
                  <Text
                    style={[
                      styles.menuOptionDescription,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Salir de tu cuenta
                  </Text>
                </View>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* CONTENIDO */}
      <ScrollView>
        <View style={styles.headerContainer}>
          <Text style={[styles.welcomeText, { color: theme.primary }]}>
            Cursos
          </Text>
          <Text
            style={[styles.instructionText, { color: theme.textSecondary }]}
          >
            Aprende a programar con estas lecciones interactivas para principiantes.
          </Text>
        </View>

        {/* Tarjetas */}
        <View style={styles.gridContainer}>
          {viewModel.menuOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[styles.card, { backgroundColor: theme.card }]}
              onPress={() =>
                option.route
                  ? navigation.navigate(option.route)
                  : option.onPress?.()
              }
            >
              <View style={styles.iconContainer}>
                {viewModel.renderImage(option)}
              </View>

              <View style={styles.textContainer}>
                <Text style={[styles.cardText, { color: theme.text }]}>
                  {option.title}
                </Text>

                {/* Progreso */}
                {option.progress !== undefined && (
                  <>
                    <Text
                      style={[
                        styles.progressText,
                        { color: theme.textSecondary },
                      ]}
                    >
                      Progreso: {Math.round(option.progress * 100)}%
                    </Text>

                    <View style={styles.progressBarBackground}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${option.progress * 100}%`,
                            backgroundColor: option.color,
                          },
                        ]}
                      />
                    </View>
                  </>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

// ==========================================
// ESTILOS
// ==========================================
const styles = StyleSheet.create({
  container: { flex: 1 },

  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: "bold",
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
  },

  headerContainer: {
    backgroundColor: "#D7F8FF",
    paddingVertical: 20,
    paddingHorizontal: 15,
    marginBottom: 25,
    elevation: 3,
  },
  welcomeText: {
    fontSize: 50,
    fontWeight: "bold",
    marginBottom: 8,
    marginLeft: 20,
  },
  instructionText: {
    fontSize: FONT_SIZES.medium,
    marginLeft: 20,
  },

  gridContainer: {
    flexDirection: "column",
    paddingHorizontal: 10,
  },
  card: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    elevation: 3,
  },

  cardText: {
    fontSize: FONT_SIZES.xxlarge,
    fontWeight: "600",
  },
  progressText: {
    fontSize: FONT_SIZES.small,
    marginTop: 5,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 4,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },

  // Menú lateral
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  menuContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  menuTitle: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: "bold",
    marginLeft: 12,
    flex: 1,
  },

  menuOptions: {
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  menuOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuTextContainer: { flex: 1 },
  menuOptionTitle: {
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
    marginBottom: 2,
  },
  menuOptionDescription: {
    fontSize: FONT_SIZES.small,
  },
  menuDivider: {
    height: 1,
    marginVertical: 8,
  },

  iconContainer: {
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
});
