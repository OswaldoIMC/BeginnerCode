<div align="center">

# BeginnerCode

### Aprende a programar desde cero, a tu ritmo.

[![Expo](https://img.shields.io/badge/Expo-54-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![License](https://img.shields.io/badge/License-Private-red?style=for-the-badge)]()

<br/>

**BeginnerCode** es una aplicación móvil educativa diseñada para enseñar los fundamentos de la programación a principiantes. Con cursos interactivos, lecciones estructuradas y desafíos prácticos, los usuarios pueden aprender lenguajes como **Python**, **JavaScript**, **Java**, **C++** y **C#** de manera progresiva y dinámica.

<br/>

[Características](#-características) · [Tech Stack](#-tech-stack) · [Instalación](#-instalación) · [Arquitectura](#-arquitectura) · [Contribuir](#-contribuir)

</div>

---

## Características

### Cursos Completos
- **5 lenguajes de programación**: Python, JavaScript, Java, C++ y C#
- **20 lecciones por curso** con contenido estructurado de nivel principiante
- **+40 horas estimadas** de contenido por lenguaje
- Progreso visual con barras de avance por curso

### Sistema de Desafíos
- Retos interactivos al final de cada lección para reforzar el aprendizaje
- Retroalimentación inmediata sobre respuestas correctas e incorrectas
- Barra de progreso animada durante los desafíos

### Perfil y Gamificación
- Sistema de **niveles** y **experiencia (XP)**
- **Medallas y logros** desbloqueables al completar hitos
- Estadísticas detalladas del progreso del usuario
- Racha de días consecutivos de estudio

### Tema Claro / Oscuro
- Soporte completo para **modo oscuro** y **modo claro**
- Preferencia persistente guardada localmente
- Transición suave entre temas

### Autenticación Completa
- Registro e inicio de sesión de usuarios
- Recuperación de contraseña
- Persistencia de sesión automática

### Sincronización en la Nube
- Almacenamiento local con **SQLite** para uso offline
- Sincronización automática con **Supabase** cuando hay conexión
- Indicador visual de estado de conectividad en tiempo real
- Sincronización de cambios pendientes al recuperar conexión

### Notificaciones
- Recordatorios configurables para mantener la constancia de estudio
- Sistema de notificaciones push integrado

---

## Tech Stack

| Categoría | Tecnología |
|---|---|
| **Framework** | [React Native](https://reactnative.dev) 0.81 + [Expo](https://expo.dev) 54 |
| **Lenguaje** | [TypeScript](https://www.typescriptlang.org) 5.9 |
| **Navegación** | [React Navigation](https://reactnavigation.org) (Stack Navigator) |
| **Base de Datos Local** | [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) |
| **Backend / BaaS** | [Supabase](https://supabase.com) (Auth + Database + Sync) |
| **Almacenamiento** | [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) |
| **Animaciones** | [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) |
| **Iconos** | [Expo Vector Icons](https://icons.expo.fyi) (Material Icons) |
| **Testing** | [Jest](https://jestjs.io) + [React Native Testing Library](https://callstack.github.io/react-native-testing-library/) |
| **CI/CD** | GitHub Actions (CI + CD para APK) |
| **Build Service** | [EAS Build](https://docs.expo.dev/build/introduction/) |

---

## Arquitectura

El proyecto sigue el patrón de arquitectura **MVVM (Model-View-ViewModel)** con una clara separación de responsabilidades:

```
BeginnerCode/
├── App.tsx                    # Punto de entrada principal
├── src/
│   ├── components/            # Componentes reutilizables
│   │   └── ConnectivityIndicator.tsx
│   ├── context/               # Contextos de React (Theme)
│   │   └── ThemeContext.tsx
│   ├── hooks/                 # ViewModels (Custom Hooks)
│   │   ├── useHomeViewModel.tsx
│   │   ├── useCourseViewModel.ts
│   │   ├── useLessonDetailViewModel.ts
│   │   ├── useChallengeViewModel.ts
│   │   ├── useProfileViewModel.ts
│   │   ├── useSettingsViewModel.ts
│   │   ├── useLoginViewModel.ts
│   │   ├── useRegisterViewModel.ts
│   │   └── useRecoverPasswordViewModel.ts
│   ├── navigation/            # Configuración de navegación
│   │   └── StackNavigator.tsx
│   ├── screens/               # Vistas (Pantallas)
│   │   ├── auth/              # Login, Registro, Recuperar contraseña
│   │   ├── home/              # Pantalla principal con cursos
│   │   ├── courses/           # Detalle de curso
│   │   ├── lessons/           # Detalle de lección
│   │   ├── challenges/        # Desafíos interactivos
│   │   ├── profile/           # Perfil del usuario
│   │   └── settings/          # Configuración
│   └── services/              # Capa de datos y lógica de negocio
│       ├── AuthService.ts
│       ├── DatabaseService.ts
│       ├── StorageService.ts
│       ├── DataService.ts
│       ├── ChallengeService.ts
│       ├── NotificationService.ts
│       └── SupabaseSyncService.ts
├── data/                      # Contenido estático de cursos y lecciones
│   ├── courses/               # Metadatos de cursos (JSON)
│   └── lessons/               # Contenido de lecciones (JSON)
├── types/                     # Definiciones de tipos TypeScript
├── assets/                    # Imágenes, iconos y recursos
├── __tests__/                 # Tests unitarios
└── .github/workflows/         # CI/CD pipelines
```

### Flujo de Datos

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│   Screens   │────▶│  ViewModels  │────▶│   Services    │
│   (Views)   │◀────│   (Hooks)    │◀────│  (Data Layer) │
└─────────────┘     └──────────────┘     └───────┬───────┘
                                                  │
                                    ┌─────────────┼─────────────┐
                                    ▼             ▼             ▼
                              ┌──────────┐ ┌──────────┐ ┌──────────┐
                              │  SQLite  │ │ Supabase │ │  Async   │
                              │  (Local) │ │ (Cloud)  │ │ Storage  │
                              └──────────┘ └──────────┘ └──────────┘
```

---

## Instalación
1. Descarga el archivo `BeginnerCode.apk` desde la sección de [Releases](../../releases).
2. Ejecuta el apk en tu dispositivo y sigue las instrucciones.
3. Una vez instalado, abre **BeginnerCode** desde la aplicación

---

## CI/CD

El proyecto cuenta con pipelines automatizados mediante **GitHub Actions**:

| Workflow | Descripción |
|---|---|
| **CI** (`ci.yml`) | Ejecuta linting y tests en cada push/PR |
| **CD** (`cd-apk.yml`) | Genera y distribuye el APK automáticamente |

---

## Cursos Disponibles

| Lenguaje | Lecciones | Horas Est. | Estado |
|---|---|---|---|
| Python | 20 | 40h | Disponible |
| JavaScript | 20 | 40h | Disponible |
| Java | 20 | 40h | Disponible |
| C++ | 20 | 40h | Disponible |
| C# | 20 | 40h | Disponible |

---

## Autores

- **OswaldoIMC** — [GitHub](https://github.com/OswaldoIMC)

---

<div align="center">

Hecho para quienes dan sus primeros pasos en la programación.

</div>
