# Project Documentation: Tonic Sol-fa Music Notation Editor

## Project Overview
This project is a web application built using React and TypeScript, designed to facilitate music notation editing with a focus on the Tonic Sol-fa system—a method for teaching sight-singing. The application provides an interactive interface for creating, editing, and playing back musical scores.

## Technology Stack
- **React**: Core library for building the user interface.
- **TypeScript**: Provides type safety and modern JavaScript features.
- **Vite**: Build tool and development server offering fast builds and hot module replacement.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **ESLint**: Ensures code quality and consistency.
- **UUID**: Generates unique identifiers for elements like markers.

## Key Components
- **NotationEditor**: Main component managing the state of music notation, including notes, durations, subdivisions, octaves, time signatures, and playback status.
- **MusicStaff**: Displays musical staff lines and handles note interactions for different voice parts (Soprano, Alto, Tenor, Bass).
- **NoteControls**: UI controls for selecting note types, durations, and octaves.
- **PlaybackControls**: Manages playback functionality, allowing users to play, stop, and reset the notation.
- **TimeSignatureSelector**: Allows users to select the time signature for the notation.
- **Timeline**: Manages and displays markers on a timeline, enabling users to add, update, and remove markers.

## State Management
The application uses React's `useState` hook to manage component state, including the current note, duration, octave, and playback status. Tracks are managed as an object with keys representing different voice parts, each containing an array of notes.

## Core Functionality
- **Adding/Removing Notes**: Users can add and remove notes from the staff, with automatic sorting to maintain order.
- **Harmonization**: Automatically harmonizes notes for different voice parts based on the soprano note.
- **Marker Management**: Users can add, update, and remove markers on the timeline.
- **Playback Control**: Functions to play, stop, and reset the musical notation.
- **Audio Engine**: A simple audio engine stub is implemented using the Web Audio API for playing notes.

## Build and Development Tools
- **Package Management**:
  - Uses npm for package management, as indicated by the presence of package.json.
  - Includes both dependencies and devDependencies for building and running the application.
- **Scripts**:
  - `dev`: Starts the Vite development server.
  - `build`: Compiles TypeScript and builds the project using Vite.
  - `lint`: Runs ESLint on TypeScript and React files.
  - `preview`: Previews the production build.
- **Dependencies**: React, React-DOM, UUID, and related type definitions.
- **DevDependencies**:
  - Type definitions for React and UUID, ensuring TypeScript compatibility.
  - ESLint plugins for React and TypeScript, enhancing linting capabilities.
  - PostCSS and Autoprefixer, used with Tailwind CSS for processing styles.
  - Tailwind CSS, Vite, TypeScript, and related plugins.

## Potential Enhancements and Future Directions
- **Enhanced Audio Playback**:
  - Implement a more sophisticated audio engine using the Web Audio API to handle polyphonic playback (multiple notes simultaneously).
  - Add support for different instrument sounds or timbres.
- **User Interface Improvements**:
  - Enhance the UI for better user experience, such as adding drag-and-drop functionality for notes.
  - Implement a visual representation of the timeline with markers and measures.
- **Advanced Music Features**:
  - Add support for more complex time signatures and note durations.
  - Implement features for dynamic markings (e.g., crescendo, decrescendo) and articulations (e.g., staccato, legato).
- **Persistence and Loading**:
  - Implement functionality to save compositions to local storage or a backend server.
  - Add the ability to load and edit existing compositions.
- **Collaboration Features**:
  - Consider adding real-time collaboration features, allowing multiple users to edit the same composition simultaneously.
- **Testing and Optimization**:
  - Write unit tests for components and utility functions to ensure reliability.
  - Optimize performance, especially for rendering large compositions and handling audio playback.

## Next Steps
- **Audio Engine Enhancement**:
  - Start by enhancing the audio engine to support polyphonic playback and different instrument sounds.
- **UI/UX Enhancements**:
  - Improve the UI for note interaction and timeline visualization.
- **Feature Expansion**:
  - Gradually add more advanced music features and ensure they integrate well with the existing system.
- **Persistence Implementation**:
  - Implement saving and loading functionality to allow users to manage their compositions effectively.

## Conclusion
This project is a well-structured and modern web application for music notation editing using the Tonic Sol-fa system. It leverages React and TypeScript for robust development, Vite for fast builds, and Tailwind CSS for styling. The current implementation provides a solid foundation with core features for notation editing and playback, with clear paths for future enhancements to make it a comprehensive tool for musicians and educators.


