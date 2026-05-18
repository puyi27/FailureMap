# 🌍 FailureMap — Panel de Telemetría Global IoT en Tiempo Real

¡Bienvenido a **FailureMap**! Una plataforma premium, empresarial y de alto rendimiento diseñada para la monitorización, diagnóstico y análisis geográfico en tiempo real de más de **2,000 dispositivos y sensores IoT** distribuidos en todo el mundo.

Esta aplicación ha sido diseñada con un enfoque ultraligero y moderno, combinando una interfaz interactiva de alto impacto visual con una arquitectura serverless híbrida optimizada para despliegues de coste cero en **Vercel** y **Neon DB**.

---

## 🎨 Capturas e Impacto Visual
> [!NOTE]
> La aplicación cuenta con un mapa interactivo renderizado con **D3.js**, filtros inteligentes por continentes, empresas y tipos de dispositivo, y un panel lateral detallado que muestra gráficos de estabilidad de las últimas 24 horas y telemetría histórica en tiempo real.

---

## 🛠️ Stack Tecnológico

### 💻 Frontend (Cliente)
* **Core:** React 19 + TypeScript + Vite.
* **Motor Geográfico:** **D3.js** para el renderizado vectorial e interactivo del mapa mundial en formato GeoJSON, garantizando un rendimiento fluido de 60 FPS incluso con miles de nodos activos.
* **Estilado:** TailwindCSS con una paleta de colores oscuros curada, difuminados de cristal (glassmorphism) y micro-animaciones premium.
* **Gestión de Estado:** **Zustand** para un flujo de datos centralizado y reactivo de altísima velocidad.
* **Iconografía:** Material Icons (MUI).

### ⚙️ Backend (Servidor)
* **Runtime:** Node.js + Express.
* **Base de Datos:** **PostgreSQL** (optimizado para **Neon Serverless PostgreSQL** en producción y compatible con Postgres local).
* **Comunicación en Tiempo Real:** **Socket.io** (WebSockets nativos en entornos con estado persistente) y un sistema híbrido de **Lazy Polling de 4 segundos** en entornos serverless.

---

## 🚀 Arquitectura Serverless Premium (Coste Cero en Vercel)

Las arquitecturas serverless como Vercel son efímeras (stateless) y no admiten WebSockets persistentes ni hilos ejecutándose en bucle infinito en segundo plano (`setInterval`). Además, las cuentas **Vercel Hobby** limitan las tareas programadas (Cron Jobs) a un máximo de **una ejecución diaria**.

**FailureMap resuelve este desafío con dos ingenierías de nivel corporativo:**

1. **Lazy Simulation (Simulación bajo demanda en [server.ts](server/server.ts)):**
   Cuando un usuario está viendo el mapa, el cliente realiza peticiones de actualización cada 4 segundos (`polling`). El servidor Express detecta si han pasado más de 4 segundos desde el último ping. Si es así, **desencadena una simulación asíncrona de telemetría en segundo plano** que actualiza el estado de los dispositivos en PostgreSQL. Si no hay usuarios en la plataforma, el consumo de CPU y base de datos es **cero absoluto**.
   
2. **Fallback Inteligente de Red:**
   La aplicación detecta automáticamente el entorno. Si se ejecuta localmente, inicia canales bidireccionales con **Socket.io**. Si se despliega en producción serverless, conmuta automáticamente a la arquitectura de **Lazy Polling de 4 segundos**, garantizando que el mapa se actualice constantemente y funcione a la perfección de forma gratuita.

---

## 📁 Estructura del Proyecto

```text
FailureMap/
├── public/                 # Iconos vectoriales y recursos públicos
├── server/
│   ├── seed.js             # Semilla programática para generar 2,000 nodos
│   └── server.ts           # Servidor API Express y lógica de telemetría
├── src/
│   ├── assets/             # Recursos estáticos de la interfaz
│   ├── components/         # Componentes React de la UI
│   │   ├── ControlsBar.tsx        # Barra de filtros multinivel y búsqueda
│   │   ├── D3Map.tsx              # Renderizador interactivo del mapa vectorial
│   │   ├── DetailsPanel.tsx       # Detalle del nodo, gráficos D3 y logs
│   │   └── TelemetryExportModal.ts# Modal de exportación avanzada en CSV/JSON
│   ├── config/             # Configuración visual y de marca
│   ├── services/           # Clientes de socket y API
│   ├── store.ts            # Estado global reactivo con Zustand
│   ├── types.ts            # Declaraciones de tipos estrictos en TypeScript
│   ├── App.tsx             # Componente raíz
│   └── main.tsx            # Punto de entrada de React
├── schema.sql              # Esquema SQL original de inicialización
├── vercel.json             # Configuración de despliegue serverless
└── package.json            # Scripts y dependencias del sistema
```

---

## 💾 La Semilla: 2,000 Nodos Inteligentes ([seed.js](server/seed.js))

Para dotar al mapa de una carga de datos masiva y realista, disponemos de un generador inteligente que crea exactamente **2,000 dispositivos de telemetría**.

* **Agrupamiento Geográfico (Jitter Clustering):** Los dispositivos se crean alrededor de **19 ciudades del mundo** (Barcelona, Tokio, Nueva York, Milán, Buenos Aires, etc.). Para evitar que se superpongan en el mismo píxel, se aplica un ruido matemático (`jitter`) que los agrupa de forma realista simulando distritos y centros de datos reales.
* **Diversidad Industrial:** Reparte los dispositivos entre 5 gigantes tecnológicos (`FAE Technology`, `Siemens`, `Schneider`, `Cisco`, `Teltonika`) y 4 tipos de sensores.
* **Carga en Bloques (Bulk Inserts):** El script realiza inserciones en la base de datos en bloques de 200 en 200 para evitar desbordar Neon, cargando la base de datos completa en **menos de 5 segundos**.

---

## 🛠️ Instalación y Configuración Local

### 1. Clonar el Repositorio e Instalar Dependencias
```bash
git clone https://github.com/puyi27/FailureMap.git
cd FailureMap
npm install
```

### 2. Configurar la Base de Datos PostgreSQL
Crea una base de datos llamada `FailureMap` e inicializa el script **[schema.sql](schema.sql)** en tu consola Postgres, o simplemente ejecuta el cargador automático `seed.js`.

### 3. Ejecutar la Semilla (Genera 2,000 nodos en segundos)
Si utilizas la base de datos local predeterminada:
```bash
node server/seed.js
```

Si deseas cargar los 2,000 nodos en tu base de datos de **Neon DB** en la nube, define la variable de entorno en tu consola antes de ejecutar:

**En Windows (PowerShell):**
```powershell
$env:DATABASE_URL="tu_cadena_de_conexion_de_neon"; node server/seed.js
```

**En Git Bash / macOS / Linux:**
```bash
DATABASE_URL="tu_cadena_de_conexion_de_neon" node server/seed.js
```

---

## 🏃‍♂️ Ejecución en Desarrollo

Para disfrutar de la experiencia completa en desarrollo local con WebSockets en tiempo real activos, abre dos terminales:

### Terminal 1: Iniciar el Servidor de Telemetría (Puerto 3000)
```bash
npm run server
```

### Terminal 2: Iniciar la Interfaz Web (Vite en el Puerto 5173)
```bash
npm run dev
```

---

## 🚀 Despliegue en Producción (Vercel)

El proyecto está configurado y optimizado con **[vercel.json](vercel.json)** para desplegarse de manera directa en Vercel.

1. Conecta tu repositorio de GitHub a tu cuenta de Vercel.
2. Configura las siguientes variables de entorno en el panel de Vercel:
   * `DATABASE_URL`: Tu cadena de conexión de Neon DB (con SSL activo).
3. Vercel detectará la configuración automáticamente, compilará la interfaz con Vite y desplegará la API Express en funciones serverless sin coste alguno.

---

## 📜 Licencia

Este proyecto es de código abierto y está desarrollado bajo la licencia MIT. Creado por [puyi27](https://github.com/puyi27).
