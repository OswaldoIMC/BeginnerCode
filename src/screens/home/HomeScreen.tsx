import React, { useState } from "react";
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
const PythonImage = require("../../../assets/python.png");
const JavaImage = require("../../../assets/java.png");
const JSImage = require("../../../assets/js.png");
const CsharpImage = require("../../../assets/c-sharp.png");
const CppImage = require("../../../assets/c-.png");
/**
 * Tipo para las props de navegación de esta pantalla
 */
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;
/**
 * Props que recibe el componente HomeScreen
 */
interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}
/**
 * Interfaz para definir las opciones del menú principal
 */
interface MenuOption {
  id: string;
  title: string;
  color: string;
  route?: keyof RootStackParamList;
  progress?: number;
  onPress?: () => void;
}
/**
 * Pantalla principal del sistema
 * Muestra el menú principal con las opciones disponibles
 */
const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  // Estado para controlar la visibilidad del menú
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  /**
   * Opciones del menú principal
   */
  const menuOptions: MenuOption[] = [
    {
      id: "Python",
      title: "Python",
      color: "#3963bdff",
      progress: 0,
      route: "Python",
    },
    {
      id: "Java",
      title: "Java",
      color: "#f47f36ff",
      progress: 0.2,
      onPress: () => handleComingSoon("Java"),
    },
    {
      id: "Javascript",
      title: "Javascript",
      color: "#faf32bff",
      progress: 0.4,
      onPress: () => handleComingSoon("Javascript"),
    },
    {
      id: "C#",
      title: "C#",
      color: "#a116a3ff",
      progress: 0.8,
      onPress: () => handleComingSoon("C#"),
    },
    {
      id: "C++",
      title: "C++",
      color: "#122e92ff",
      progress: 1,
      onPress: () => handleComingSoon("C++"),
    },
    {
      id: "Prox",
      title: "Proximamente",
      color: "#525358ff",
    },
  ];
  /**
   * Maneja el cierre de sesión
   */
  const handleLogout = (): void => {
    setMenuVisible(false); // Mostramos confirmación antes de cerrar sesión
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Login" }],
      })
    );
  };
  /**
   * Maneja la navegación al perfil del usuario
   */
  const handleProfile = (): void => {
    console.log("Navegando a perfil de usuario");
    setMenuVisible(false); // Aquí iría la navegación al perfil cuando esté implementado
    handleComingSoon("Perfil de Usuario");
  };
  /**
   * Muestra mensaje de funcionalidad próximamente disponible
   */
  const handleComingSoon = (feature: string): void => {
    // Implementación básica por ahora
    console.log(`Funcionalidad: ${feature} - Próximamente disponible`);
  };
  /**
   * Abre el menú de hamburguesa
   */
  const openMenu = (): void => {
    setMenuVisible(true);
  };
  /**
   * Cierra el menú de hamburguesa
   */
  const closeMenu = (): void => {
    setMenuVisible(false);
  };
  /**
   * Maneja la navegación a las diferentes pantallas
   */
  const handleNavigation = (option: MenuOption): void => {
    if (option.route) {
      navigation.navigate(option.route);
    } else if (option.onPress) {
      option.onPress();
    }
  };
  /**
   * Renderiza una imagen segun el id
   */
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
      {/* Header Bar */}
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
        <View style={styles.menuOverlay}>
          <View style={styles.menuContainer}>
            <Text style={styles.menuTitle}>Menú</Text>
            <Pressable style={styles.menuOption} onPress={handleProfile}>
              <MaterialIcons name="person" size={20} color={COLORS.primary} />
              <Text style={styles.menuText}>Mi Perfil</Text>
            </Pressable>
            <Pressable style={styles.menuOption} onPress={handleLogout}>
              <MaterialIcons name="logout" size={20} color={COLORS.error} />
              <Text style={[styles.menuText, { color: COLORS.error }]}>
                Cerrar Sesión
              </Text>
            </Pressable>
            <Pressable style={styles.closeMenuButton} onPress={closeMenu}>
              <Text style={styles.closeMenuText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      {/* Grid de opciones principales */}
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
                {/* Icono a la izquierda */}
                <View style={styles.iconContainer}>{renderImage(option)}</View>

                {/* Contenido de la derecha */}
                <View style={styles.textContainer}>
                  <Text style={styles.cardText}>{option.title}</Text>

                  {/* Progreso en texto */}
                  {typeof option.progress === "number" && (
                    <Text style={styles.progressText}>
                      Progreso: {Math.round(option.progress * 100)}%
                    </Text>
                  )}
                  {/* Barra de progreso */}
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
/**
 * Estilos del componente
 */
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
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 200,
  },
  menuTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 20,
  },
  menuOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  menuText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    marginLeft: 15,
    fontWeight: "500",
  },
  closeMenuButton: {
    alignSelf: "center",
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  closeMenuText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    fontWeight: "500",
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
