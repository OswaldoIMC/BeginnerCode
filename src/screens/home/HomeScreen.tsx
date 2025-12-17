import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  StatusBar,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ConnectivityIndicator from "../../components/ConnectivityIndicator";
import { MaterialIcons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { CommonActions } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { FONT_SIZES } from "../../../types";
import DataService from "../../services/DataService";
import AuthService from "../../services/AuthService";
import { useTheme } from "../../context/ThemeContext";
import StorageService from "../../services/StorageService";

// Imágenes
const PythonImage = require("../../../assets/python.png");
const JavaImage = require("../../../assets/java.png");
const JSImage = require("../../../assets/js.png");
const CsharpImage = require("../../../assets/c-sharp.png");
const CppImage = require("../../../assets/c-.png");

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

interface MenuOption {
  id: string;
  title: string;
  color: string;
  route?: "Python" | "Java" | "Javascript" | "Csharp" | "Cpp";
  progress?: number;
  onPress?: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();

  const [menuVisible, setMenuVisible] = useState(false);
  const [pythonProgress, setPythonProgress] = useState(0);
  const [javaProgress, setJavaProgress] = useState(0);
  const [jsProgress, setJsProgress] = useState(0);
  const [csharpProgress, setCsharpProgress] = useState(0);
  const [cppProgress, setCppProgress] = useState(0);

  // Cargar progreso al montar y cuando vuelve el foco
  useEffect(() => {
    loadProgress();
    const unsubscribe = navigation.addListener("focus", loadProgress);
    return unsubscribe;
  }, [navigation]);

  const loadProgress = async () => {
    const progressPython = await DataService.getCourseProgress("python");
    const progressJava = await DataService.getCourseProgress("java");
    const progressJs = await DataService.getCourseProgress("javascript");
    const progressCsharp = await DataService.getCourseProgress("csharp");
    const progressCpp = await DataService.getCourseProgress("cpp");

    setPythonProgress(progressPython || 0);
    setJavaProgress(progressJava || 0);
    setJsProgress(progressJs || 0);
    setCsharpProgress(progressCsharp || 0);
    setCppProgress(progressCpp || 0);
  };

  const menuOptions: MenuOption[] = [
    {
      id: "Python",
      title: "Python",
      color: "#3963bdff",
      progress: pythonProgress,
      route: "Python",
    },
    {
      id: "Java",
      title: "Java",
      color: "#f47f36ff",
      progress: javaProgress,
      route: "Java",
    },
    {
      id: "Javascript",
      title: "Javascript",
      color: "#faf32bff",
      progress: jsProgress,
      route: "Javascript",
    },
    {
      id: "C#",
      title: "C#",
      color: "#a116a3ff",
      progress: csharpProgress,
      route: "Csharp",
    },
    {
      id: "C++",
      title: "C++",
      color: "#122e92ff",
      progress: cppProgress,
      route: "Cpp",
    },
    { id: "Prox", title: "Proximamente", color: "#525358ff" },
  ];

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Deseas cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar Sesión",
        style: "destructive",
        onPress: async () => {
          setMenuVisible(false);

          // Cerrar sesión en AuthService
          const success = await AuthService.logout();

          if (success) {
            console.log("Sesión cerrada exitosamente");

            // Limpiar el usuario actual de StorageService
            StorageService.setCurrentUsername(null);

            // Navegar a Login y limpiar el stack
            navigation.dispatch(
              CommonActions.reset({ index: 0, routes: [{ name: "Login" }] })
            );
          } else {
            console.error("Error al cerrar sesión");
            Alert.alert(
              "Error",
              "No se pudo cerrar la sesión. Intenta de nuevo."
            );
          }
        },
      },
    ]);
  };

  const renderImage = (option: MenuOption) => {
    switch (option.id) {
      case "Python":
        return <Image source={PythonImage} style={styles.image} />;
      case "Java":
        return <Image source={JavaImage} style={styles.image} />;
      case "Javascript":
        return <Image source={JSImage} style={styles.image} />;
      case "C#":
        return <Image source={CsharpImage} style={styles.image} />;
      case "C++":
        return <Image source={CppImage} style={styles.image} />;
      default:
        return null;
    }
  };

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
          onPress={() => setMenuVisible(true)}
          style={styles.iconButton}
        >
          <MaterialIcons name="menu" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Menu Modal */}
      <Modal animationType="slide" transparent={true} visible={menuVisible}>
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setMenuVisible(false)}
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
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
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
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate("Profile");
                }}
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
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate("Settings");
                }}
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
              <Pressable style={styles.menuOption} onPress={handleLogout}>
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
            Aprende a programar con estas lecciones interactivas para
            principiantes.
          </Text>
        </View>

        {/* Tarjetas */}
        <View style={styles.gridContainer}>
          {menuOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[styles.card, { backgroundColor: theme.card }]}
              onPress={() =>
                option.route
                  ? navigation.navigate(option.route)
                  : option.onPress?.()
              }
            >
              <View style={styles.iconContainer}>{renderImage(option)}</View>

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
  image: {
    width: 70,
    height: 70,
    resizeMode: "contain",
    borderRadius: 5,
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
