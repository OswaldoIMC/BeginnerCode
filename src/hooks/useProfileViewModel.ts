/**
 * ViewModel para la pantalla de Perfil
 */

import { useState, useEffect } from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/StackNavigator";
import { UserProfile } from "../../types";
import StorageService from "../services/StorageService";

type ProfileNavigationProp = StackNavigationProp<RootStackParamList, "Profile">;

interface UseProfileViewModelProps {
  navigation: ProfileNavigationProp;
}

// ==========================================
// ESTADO
// ==========================================
interface ProfileState {
  profile: UserProfile | null;
  loading: boolean;
  stats: any;
}

export const useProfileViewModel = ({
  navigation,
}: UseProfileViewModelProps) => {
  const [state, setState] = useState<ProfileState>({
    profile: null,
    loading: true,
    stats: null,
  });

  // ==========================================
  // EFECTOS
  // ==========================================

  /**
   * Carga los datos del perfil al montar
   */
  useEffect(() => {
    loadProfileData();
  }, []);

  // ==========================================
  // LÓGICA DE NEGOCIO
  // ==========================================

  /**
   * Carga los datos del perfil y estadísticas del usuario
   */
  const loadProfileData = async (): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, loading: true }));

      const userProfile = await StorageService.getUserProfile();
      const userStats = await StorageService.getUserStats();

      setState((prev) => ({
        ...prev,
        profile: userProfile,
        stats: userStats,
        loading: false,
      }));
    } catch (error) {
      console.error("Error al cargar perfil:", error);
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  /**
   * Calcula los puntos necesarios para el siguiente nivel
   */
  const getPointsForNextLevel = (currentLevel: number): number => {
    return currentLevel * 100;
  };

  /**
   * Calcula el progreso hacia el siguiente nivel (0 a 1)
   */
  const getLevelProgress = (
    totalPoints: number,
    currentLevel: number,
  ): number => {
    const pointsInCurrentLevel = totalPoints % 100;
    return pointsInCurrentLevel / 100;
  };

  /**
   * Vuelve a la pantalla anterior
   */
  const handleGoBack = (): void => {
    navigation.goBack();
  };

  // ==========================================
  // DATOS COMPUTADOS
  // ==========================================
  const levelProgress = state.profile
    ? getLevelProgress(state.profile.totalPoints, state.profile.level)
    : 0;

  const pointsForNextLevel = state.profile
    ? getPointsForNextLevel(state.profile.level)
    : 100;

  // ==========================================
  // INTERFACE PÚBLICA
  // ==========================================
  return {
    // Estado
    profile: state.profile,
    loading: state.loading,
    stats: state.stats,

    // Datos computados
    levelProgress,
    pointsForNextLevel,

    // Acciones
    handleGoBack,
  };
};
