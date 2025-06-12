# Hoops - A Roguelike Basketball Career Sim

"Hoops" is an immersive, text-based roguelike simulation game where you navigate the career of a basketball player from high school freshman to professional legend. Built with React, TypeScript, and Vite, this project leverages modern web technologies to create a dynamic and engaging player experience.

This project is based on a minimal setup template for React with HMR and ESLint rules.

## Features

* **Deep Career Progression**: Guide your player from a `Freshman Newcomer` in High School, through the ranks of `College` ball, and into the `Professional` leagues.
* **Dynamic Event System**: Encounter a wide range of contextual events that shape your player's journey. From `Locker Room Pranks` as a freshman to dealing with pro scouts in college, your choices matter.
* **Daily Player Development**: Make strategic decisions every day. Choose to `Train Shooting`, `Train Athleticism`, `Study Film`, or `Rest & Recover` to build your player's stats.
* **Game Simulation**: Experience game days with outcomes based on your player's stats, role, and energy levels. Performance is tracked with detailed stat lines including points, rebounds, and assists.
* **Persistent Legacy System**: When a player's career ends, they leave behind `Legacy Points`. These points give your next created player a head start, adding a roguelike element to the game.
* **Modern UI**: Built with Ant Design, featuring a clean, responsive layout, and a toggleable Light/Dark mode.
* **Client-Side Storage**: Game state is persisted in your browser using IndexedDB, allowing you to continue your career later.

## Tech Stack

* **Framework**: [React 19](https://react.dev/)
* **Bundler**: [Vite](https://vitejs.dev/)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **UI Library**: [Ant Design (AntD)](https://ant.design/)
* **State Management**: [Zustand](https://github.com/pmndrs/zustand)
* **Deployment**: [GitHub Pages](https://pages.github.com/)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have Node.js and npm installed on your machine.

### Installation

1. Clone the repository:

    ```sh
    git clone <your-repository-url>
    ```

2. Navigate to the project directory:

    ```sh
    cd hoops
    ```

3. Install NPM packages:

    ```sh
    npm install
    ```

### Running the Application

* **Development Mode**: To run the app in development mode with hot-reloading, execute:

    ```sh
    npm run dev
    ```

    This will start the development server, typically at `http://localhost:5173`.

* **Production Build**: To create a production-ready build of the application, run:

    ```sh
    npm run build
    ```

    The bundled files will be located in the `dist` directory.

* **Preview Production Build**: To preview the production build locally, run:

    ```sh
    npm run preview
    ```

## Available Scripts

This project comes with several pre-configured npm scripts:

* `npm run dev`: Starts the Vite development server.
* `npm run build`: Builds the application for production.
* `npm run lint`: Lints the source code using ESLint.
* `npm run preview`: Serves the production build locally for previewing.
* `npm run predeploy`: A script that automatically runs the build process before deployment.
* `npm run deploy`: Deploys the contents of the `dist` folder to the `gh-pages` branch.

## Project Structure

The project follows a standard Vite/React structure, with the core logic organized as follows:

```bash
/src
├── components/     # Reusable React components for the UI
├── constants/      # Core game constants (max stats, roles, etc.)
├── data/           # Static data, like player names
├── gameLogic/      # The heart of the simulation engine
│   ├── contextualEvents/ # Role-specific events
│   ├── eventDefinitions.ts # Definitions for daily, game, and injury events
│   ├── gameLoop.ts       # Logic for daily progression and season changes
│   ├── playerLogic.ts    # Player creation and retirement logic
│   └── seasonLogic.ts    # Season schedule generation
├── hooks/          # Custom React hooks (e.g., useHydration)
├── services/       # External services (gameEngine, IndexedDB wrapper)
├── store/          # Zustand stores for game and UI state
├── types/          # TypeScript type definitions
├── App.tsx         # Main application component
└── main.tsx        # Application entry point
```
