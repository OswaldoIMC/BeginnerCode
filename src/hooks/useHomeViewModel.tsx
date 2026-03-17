/**
 * ViewModel para la pantalla de Home
 */

import { useState, useEffect } from "react";
import { Alert, Image } from "react-native";
import { CommonActions } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/StackNavigator";
import DataService from "../services/DataService";
import AuthService from "../services/AuthService";
import StorageService from "../services/StorageService";

// Imágenes de los cursos
const PythonImage = require("../../assets/python.png");
const JavaImage = require("../../assets/java.png");
const JSImage = require("../../assets/js.png");
const CsharpImage = require("../../assets/c-sharp.png");
const CppImage = require("../../assets/c-.png");

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

interface UseHomeViewModelProps {
  navigation: HomeScreenNavigationProp;
}

export interface MenuOption {
  id: string;
  title: string;
  color: string;
  courseId?: string;
  progress?: number;
  onPress?: () => void;
}

// ==========================================
// ESTADO
// ==========================================
interface HomeState {
  menuVisible: boolean;
  pythonProgress: number;
  javaProgress: number;
  jsProgress: number;
  csharpProgress: number;
  cppProgress: number;
}

export const useHomeViewModel = ({ navigation }: UseHomeViewModelProps) => {
  const [state, setState] = useState<HomeState>({
    menuVisible: false,
    pythonProgress: 0,
    javaProgress: 0,
    jsProgress: 0,
    csharpProgress: 0,
    cppProgress: 0,
  });

  // ==========================================
  // EFECTOS
  // ==========================================

  /**
   * Carga el progreso al montar y cada vez que la pantalla obtiene el foco
   */
  useEffect(() => {
    loadProgress();
    const unsubscribe = navigation.addListener("focus", loadProgress);
    return unsubscribe;
  }, [navigation]);

  // ==========================================
  // LÓGICA DE NEGOCIO
  // ==========================================

  /**
   * Carga el progreso de todos los cursos desde el servicio
   */
  const loadProgress = async (): Promise<void> => {
    const [progressPython, progressJava, progressJs, progressCsharp, progressCpp] =
      await Promise.all([
        DataService.getCourseProgress("python"),
        DataService.getCourseProgress("java"),
        DataService.getCourseProgress("javascript"),
        DataService.getCourseProgress("csharp"),
        DataService.getCourseProgress("cpp"),
      ]);

    setState((prev) => ({
      ...prev,
      pythonProgress: progressPython || 0,
      javaProgress: progressJava || 0,
      jsProgress: progressJs || 0,
      csharpProgress: progressCsharp || 0,
      cppProgress: progressCpp || 0,
    }));
  };

  /**
   * Maneja el cierre de sesión con confirmación
   */
  const handleLogout = (): void => {
    Alert.alert("Cerrar Sesión", "¿Deseas cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar Sesión",
        style: "destructive",
        onPress: async () => {
          setMenuVisible(false);

          const success = await AuthService.logout();

          if (success) {
            console.log("Sesión cerrada exitosamente");
            StorageService.setCurrentUsername(null);
            navigation.dispatch(
              CommonActions.reset({ index: 0, routes: [{ name: "Login" }] })
            );
          } else {
            console.error("Error al cerrar sesión");
            Alert.alert("Error", "No se pudo cerrar la sesión. Intenta de nuevo.");
          }
        },
      },
    ]);
  };

  /**
   * Muestra u oculta el menú lateral
   */
  const setMenuVisible = (visible: boolean): void => {
    setState((prev) => ({ ...prev, menuVisible: visible }));
  };

  /**
   * Navega al perfil cerrando el menú
   */
  const handleNavigateToProfile = (): void => {
    setMenuVisible(false);
    navigation.navigate("Profile");
  };

  /**
   * Navega a configuración cerrando el menú
   */
  const handleNavigateToSettings = (): void => {
    setMenuVisible(false);
    navigation.navigate("Settings");
  };

  /**
   * Navega a un curso usando la ruta unificada
   */
  const handleCoursePress = (option: MenuOption): void => {
    if (option.courseId) {
      navigation.navigate("Course", { courseId: option.courseId });
    } else if (option.onPress) {
      option.onPress();
    }
  };

  // ==========================================
  // HELPERS
  // ==========================================

  /**
   * Retorna la imagen correspondiente a la opción del menú
   */
  const renderImage = (option: MenuOption) => {
    switch (option.id) {
      case "Python":
        return <Image source={PythonImage} style={{ width: 70, height: 70, resizeMode: "contain", borderRadius: 5 }} />;
      case "Java":
        return <Image source={JavaImage} style={{ width: 70, height: 70, resizeMode: "contain", borderRadius: 5 }} />;
      case "Javascript":
        return <Image source={JSImage} style={{ width: 70, height: 70, resizeMode: "contain", borderRadius: 5 }} />;
      case "C#":
        return <Image source={CsharpImage} style={{ width: 70, height: 70, resizeMode: "contain", borderRadius: 5 }} />;
      case "C++":
        return <Image source={CppImage} style={{ width: 70, height: 70, resizeMode: "contain", borderRadius: 5 }} />;
      default:
        return null;
    }
  };

  // ==========================================
  // DATOS COMPUTADOS
  // ==========================================

  /**
   * Lista de opciones del menú de cursos con progreso actual
   */
  const menuOptions: MenuOption[] = [
    {
      id: "Python",
      title: "Python",
      color: "#3963bdff",
      progress: state.pythonProgress,
      courseId: "python",
    },
    {
      id: "Java",
      title: "Java",
      color: "#f47f36ff",
      progress: state.javaProgress,
      courseId: "java",
    },
    {
      id: "Javascript",
      title: "Javascript",
      color: "#faf32bff",
      progress: state.jsProgress,
      courseId: "javascript",
    },
    {
      id: "C#",
      title: "C#",
      color: "#a116a3ff",
      progress: state.csharpProgress,
      courseId: "csharp",
    },
    {
      id: "C++",
      title: "C++",
      color: "#122e92ff",
      progress: state.cppProgress,
      courseId: "cpp",
    },
    { id: "Prox", title: "Proximamente", color: "#525358ff" },
  ];

  // ==========================================
  // INTERFACE PÚBLICA
  // ==========================================
  return {
    // Estado
    menuVisible: state.menuVisible,

    // Datos computados
    menuOptions,

    // Acciones
    setMenuVisible,
    handleLogout,
    handleNavigateToProfile,
    handleNavigateToSettings,
    handleCoursePress,
    renderImage,
  };
};

