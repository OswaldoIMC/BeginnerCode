import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { CommonActions } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { COLORS, FONT_SIZES } from "../../../types";
import { ScrollView } from "react-native-gesture-handler";
import DataService from "../../services/DataService";

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
  route?: "Python" | "Java"; // Solo routes que no requieren params
  progress?: number;
  onPress?: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [pythonProgress, setPythonProgress] = useState<number>(0);
  const [javaProgress, setJavaProgress] = useState<number>(0);

  // Cargar progreso al montar y cuando vuelve el foco
  useEffect(() => {
    loadProgress();

    const unsubscribe = navigation.addListener("focus", () => {
      loadProgress();
    });

    return unsubscribe;
  }, [navigation]);

  const loadProgress = async () => {
    const courses = ["python", "java"];
    const progressMap: Record<string, number> = {};

    for (const courseId of courses) {
      const progress = await DataService.getCourseProgress(courseId);
      progressMap[courseId] = progress;
    }

    // Actualiza estados individuales
    setPythonProgress(progressMap["python"] || 0);
    setJavaProgress(progressMap["java"] || 0);
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
      progress: 0,
      onPress: () => handleComingSoon("Javascript"),
    },
    {
      id: "C#",
      title: "C#",
      color: "#a116a3ff",
      progress: 0,
      onPress: () => handleComingSoon("C#"),
    },
    {
      id: "C++",
      title: "C++",
      color: "#122e92ff",
      progress: 0,
      onPress: () => handleComingSoon("C++"),
    },
    {
      id: "Prox",
      title: "Proximamente",
      color: "#525358ff",
    },
  ];

  const handleLogout = (): void => {
    setMenuVisible(false);
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Login" }],
      })
    );
  };

  const handleProfile = (): void => {
    console.log("Navegando a perfil de usuario");
    setMenuVisible(false);
    navigation.navigate("Profile");
  };

  const handleComingSoon = (feature: string): void => {
    console.log(`Funcionalidad: ${feature} - Próximamente disponible`);
  };

  const openMenu = (): void => {
    setMenuVisible(true);
  };

  const closeMenu = (): void => {
    setMenuVisible(false);
  };

  const handleNavigation = (option: MenuOption): void => {
    if (option.route) {
      navigation.navigate(option.route);
    } else if (option.onPress) {
      option.onPress();
    }
  };

  const renderImage = (option: MenuOption) => {
    if (option.id === "Python") {
      return (
        <Image
          source={PythonImage}
          style={{
            width: 70,
            height: 70,
            resizeMode: "contain",
            borderRadius: 5,
          }}
        />
      );
    }
    if (option.id === "Java") {
      return (
        <Image
          source={JavaImage}
          style={{
            width: 70,
            height: 70,
            resizeMode: "contain",
            borderRadius: 5,
          }}
        />
      );
    }
    if (option.id === "Javascript") {
      return (
        <Image
          source={JSImage}
          style={{
            width: 70,
            height: 70,
            resizeMode: "contain",
            borderRadius: 5,
          }}
        />
      );
    }
    if (option.id === "C#") {
      return (
        <Image
          source={CsharpImage}
          style={{
            width: 70,
            height: 70,
            resizeMode: "contain",
            borderRadius: 5,
          }}
        />
      );
    }
    if (option.id === "C++") {
      return (
        <Image
          source={CppImage}
          style={{
            width: 70,
            height: 70,
            resizeMode: "contain",
            borderRadius: 5,
          }}
        />
      );
    }
  };

  return (
    <SafeAreaProvider style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>BeginnerCode</Text>
        <TouchableOpacity style={styles.iconButton} onPress={openMenu}>
          <MaterialIcons name="menu" size={24} color="white" />
        </TouchableOpacity>
      </View>
      {/* Modal del menú de hamburguesa */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={menuVisible}
        onRequestClose={closeMenu}
      >
        <Pressable style={styles.menuOverlay} onPress={closeMenu}>
          <Pressable
            style={styles.menuContainer}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <View style={styles.modalHeader}>
              <MaterialIcons name="menu" size={28} color={COLORS.primary} />
              <Text style={styles.menuTitle}>Menú</Text>
              <TouchableOpacity onPress={closeMenu} style={styles.closeButton}>
                <MaterialIcons
                  name="close"
                  size={24}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Opciones del menú */}
            <View style={styles.menuOptions}>
              <Pressable style={styles.menuOption} onPress={handleProfile}>
                <View style={styles.menuIconContainer}>
                  <MaterialIcons
                    name="person"
                    size={24}
                    color={COLORS.primary}
                  />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuOptionTitle}>Mi Perfil</Text>
                  <Text style={styles.menuOptionDescription}>
                    Ver estadísticas y medallas
                  </Text>
                </View>
                <MaterialIcons
                  name="chevron-right"
                  size={24}
                  color={COLORS.textSecondary}
                />
              </Pressable>

              <Pressable
                style={styles.menuOption}
                onPress={() => {
                  closeMenu();
                  navigation.navigate("Settings");
                }}
              >
                <View style={styles.menuIconContainer}>
                  <MaterialIcons
                    name="settings"
                    size={24}
                    color={COLORS.primary}
                  />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuOptionTitle}>Configuración</Text>
                  <Text style={styles.menuOptionDescription}>
                    Ajustes de la aplicación
                  </Text>
                </View>
                <MaterialIcons
                  name="chevron-right"
                  size={24}
                  color={COLORS.textSecondary}
                />
              </Pressable>

              <View style={styles.menuDivider} />

              <Pressable style={styles.menuOption} onPress={handleLogout}>
                <View
                  style={[
                    styles.menuIconContainer,
                    { backgroundColor: COLORS.error + "15" },
                  ]}
                >
                  <MaterialIcons name="logout" size={24} color={COLORS.error} />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text
                    style={[styles.menuOptionTitle, { color: COLORS.error }]}
                  >
                    Cerrar Sesión
                  </Text>
                  <Text style={styles.menuOptionDescription}>
                    Salir de tu cuenta
                  </Text>
                </View>
                <MaterialIcons
                  name="chevron-right"
                  size={24}
                  color={COLORS.error}
                />
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
      <ScrollView>
        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.welcomeText}>Cursos</Text>
            <Text style={styles.instructionText}>
              Aprende a programar con estas lecciones interactivas para
              principiantes.
            </Text>
          </View>
          <View style={styles.gridContainer}>
            {menuOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.card}
                onPress={() => handleNavigation(option)}
                activeOpacity={0.7}
              >
                <View style={styles.iconContainer}>{renderImage(option)}</View>
                <View style={styles.textContainer}>
                  <Text style={styles.cardText}>{option.title}</Text>
                  {typeof option.progress === "number" && (
                    <Text style={styles.progressText}>
                      Progreso: {Math.round(option.progress * 100)}%
                    </Text>
                  )}
                  {typeof option.progress === "number" && (
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
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaProvider>
  );
};

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
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: "bold",
    color: COLORS.surface,
    flex: 1,
    textAlign: "center",
    marginLeft: 40,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
  },
  contentContainer: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: "#D7F8FF",
    paddingVertical: 20,
    paddingHorizontal: 15,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  welcomeText: {
    fontSize: 50,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "left",
    marginBottom: 8,
    marginLeft: 20,
  },
  instructionText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    textAlign: "left",
    marginBottom: 10,
    marginLeft: 20,
  },
  gridContainer: {
    flexDirection: "column",
    flexWrap: "wrap",
    justifyContent: "space-around",
    paddingHorizontal: 10,
  },
  card: {
    width: "100%",
    backgroundColor: COLORS.card,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    elevation: 3,
    shadowColor: COLORS.text,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  cardText: {
    fontSize: FONT_SIZES.xxlarge,
    fontWeight: "600",
    color: COLORS.text,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  menuContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  menuTitle: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: "bold",
    color: COLORS.text,
    flex: 1,
    marginLeft: 12,
  },
  closeButton: {
    padding: 4,
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
    backgroundColor: COLORS.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuOptionTitle: {
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 2,
  },
  menuOptionDescription: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.background,
    marginVertical: 8,
  },
  iconContainer: {
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  progressText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
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
});

export default HomeScreen;
