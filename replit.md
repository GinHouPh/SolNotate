# SolNotate - Music Notation Application

## Project Overview
SolNotate is a modern web-based music notation application built with React, TypeScript, and Tailwind CSS. The application allows users to create, edit, and visualize musical compositions using an intuitive interface.

## Architecture
- **Frontend**: React 18 with TypeScript, Tailwind CSS for styling
- **Backend**: Express.js server with middleware setup
- **Build Tool**: Vite with custom configuration
- **Theme System**: Custom dark/light mode implementation with persistent localStorage
- **Font**: Custom Solfa font for musical notation display

## Key Features
- Music notation editor with canvas-based interface
- Dark/light theme toggle with system preference detection
- File operations (save, load, export MIDI)
- Time signature and key signature selection
- Playback controls
- Track panel for multi-voice compositions
- Responsive design with sidebar navigation

## Technical Stack
- React 18.3.1
- TypeScript 5.6.3
- Tailwind CSS 3.4.17
- Express.js 4.21.2
- Vite 5.4.14
- Lucide React icons
- Custom music notation types

## File Structure
- `client/src/` - Frontend React application
- `server/` - Express.js backend
- `shared/` - Shared types and schemas
- `client/src/components/` - React components
- `client/src/types/` - TypeScript type definitions
- `client/src/context/` - React context providers

## Development Notes
- Application runs on port 5000 (backend + frontend)
- Uses Vite's middleware mode for development
- Custom font loading for musical notation
- Theme persistence with localStorage
- Workflow auto-restarts on file changes

## User Preferences
- Default theme: System preference (dark/light)
- File format: Musical compositions with MIDI export capability

## Recent Changes
- **2025-08-01**: Migrated from Bolt to Replit environment
  - Verified all dependencies are correctly installed
  - Confirmed application structure is compatible with Replit
  - Application successfully running on workflow system
  - Theme system and font loading working correctly

## Next Steps
- Verify application functionality through browser testing
- Complete migration validation process