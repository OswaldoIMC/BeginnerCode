/**
 * Archivo central para todos los tipos TypeScript de la aplicación
 * Aquí definimos las interfaces y tipos que se usarán en toda la app
 */

// ==========================================
// TIPOS BÁSICOS DE LA APLICACIÓN
// ==========================================

/* Tipo para identificadores únicos */
export type ID = string;

// ==========================================
// INTERFACES DE ENTIDADES PRINCIPALES
// ==========================================

/* Interfaz base para entidades que tienen ID */
export interface BaseEntity {
  id: ID;
}

// ==========================================
// TIPOS PARA CURSOS Y LECCIONES
// ==========================================

/**
 * Dificultad de un curso o lección
 */
export type Difficulty = "beginner" | "intermediate" | "advanced";

/**
 * Interfaz para un Curso
 */
export interface Course extends BaseEntity {
  id: ID;
  name: string;
  description: string;
  icon: any;
  color: string;
  difficulty: Difficulty;
  totalLessons: number;
  estimatedHours: number;
  isComingSoon?: boolean;
}

/**
 * Interfaz para una Lección
 */
export interface Lesson extends BaseEntity {
  id: ID;
  courseId: ID;
  title: string;
  description: string;
  order: number;
  content: LessonContent;
  challenges: Challenge[];
  estimatedMinutes: number;
}

/**
 * Contenido de una lección
 */
export interface LessonContent {
  introduction: string;
  sections: ContentSection[];
  codeExamples?: CodeExample[];
  summary: string;
  keyPoints: string[];
}

/**
 * Sección de contenido dentro de una lección
 */
export interface ContentSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

/**
 * Ejemplo de código
 */
export interface CodeExample {
  id: string;
  title: string;
  code: string;
  language: string;
  explanation: string;
}

// ==========================================
// TIPOS PARA RETOS/CHALLENGES
// ==========================================

/**
 * Tipo de pregunta para un reto
 */
export type ChallengeType =
  | "multiple-choice"
  | "true-false"
  | "code-completion";

/**
 * Interfaz para un Reto/Challenge
 */
export interface Challenge extends BaseEntity {
  id: ID;
  lessonId: ID;
  question: string;
  type: ChallengeType;
  options: ChallengeOption[];
  correctAnswerId: ID;
  explanation: string;
  points: number;
  order: number;
}

/**
 * Opción de respuesta para un reto
 */
export interface ChallengeOption {
  id: ID;
  text: string;
  isCorrect: boolean;
}

// ==========================================
// TIPOS PARA PROGRESO DEL USUARIO
// ==========================================

/**
 * Progreso del usuario en un curso
 */
export interface CourseProgress {
  courseId: ID;
  completedLessons: ID[];
  totalPoints: number;
  startedAt: string; // ISO date string
  lastAccessedAt: string; // ISO date string
  progressPercentage: number;
}

/**
 * Progreso del usuario en una lección
 */
export interface LessonProgress {
  lessonId: ID;
  completed: boolean;
  completedAt?: string; // ISO date string
  challengesCompleted: ID[];
  score: number;
  attempts: number;
}

/**
 * Medalla/Achievement
 */
export interface Badge {
  id: ID;
  name: string;
  description: string;
  icon: string;
  earnedAt?: string; // ISO date string
  isUnlocked: boolean;
}

/**
 * Perfil completo del usuario
 */
export interface UserProfile {
  id: ID;
  username: string;
  email?: string;
  avatarUrl?: string;
  coursesProgress: CourseProgress[];
  lessonsProgress: LessonProgress[];
  badges: Badge[];
  totalPoints: number;
  level: number;
  joinedAt: string; // ISO date string
}

// ==========================================
// TIPOS PARA COMPONENTES UI
// ==========================================

/* Props para componentes de Card/Tarjeta */
export interface CardProps {
  titulo: string;
  subtitulo?: string;
  onPress?: () => void;
  icono?: string;
  imagen?: any; // Para require() de imágenes
}

/**
 * Props para componentes de Modal
 */
export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  titulo?: string;
  children?: React.ReactNode;
}

/**
 * Props para componentes de Lista
 */
export interface ListItemProps<T> {
  item: T;
  onPress?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
}

// ==========================================
// TIPOS PARA FORMULARIOS
// ==========================================

/* Datos del formulario de Login */
export interface LoginFormData {
  username: string;
  password: string;
}

// ==========================================
// TIPOS PARA GESTIÓN DE ESTADOS
// ==========================================

/* Estados de carga para operaciones asíncronas */
export type LoadingState = "idle" | "loading" | "success" | "error";

/**
 * Estructura para manejo de errores
 */
export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
}

/**
 * Estado general de una pantalla con datos
 */
export interface ScreenState<T> {
  data: T[];
  loading: LoadingState;
  error: ErrorState;
}

// ==========================================
// TIPOS PARA NAVEGACIÓN (Complementarios)
// ==========================================

/* Props que reciben las pantallas de navegación */
export interface ScreenProps<T = any> {
  navigation: any; // Tipo básico, se puede mejorar después
  route: {
    params?: T;
  };
}

/**
 * Parámetros específicos para pantallas de detalle
 */
export interface DetailScreenParams {
  id: ID;
  nombre: string;
}

// ==========================================
// TIPOS UTILITARIOS
// ==========================================

/* Hace todas las propiedades opcionales excepto el ID */
export type PartialExceptId<T extends BaseEntity> = {
  id: ID;
} & Partial<Omit<T, "id">>;

/**
 * Omite el ID para crear nuevos elementos
 */
export type CreateEntity<T extends BaseEntity> = Omit<T, "id">;

/**
 * Para operaciones CRUD
 */
export type CRUDOperation = "create" | "read" | "update" | "delete";

// ==========================================
// CONSTANTES DE TIPO
// ==========================================

/* Colores principales de la aplicación */
export const COLORS = {
  primary: "#142646",
  secondary: "#03dac6",
  background: "#f5f5f5",
  surface: "#ffffff",
  error: "#b00020",
  text: "#000000",
  textSecondary: "#777777",
  card: "#f9f9f9",
};

/**
 * Tamaños de fuente estándar
 */
export const FONT_SIZES = {
  small: 14,
  medium: 16,
  large: 18,
  xlarge: 22,
  xxlarge: 24,
};
