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
- **2025-08-08**: Complete SATB Note Entry System with Auto-Harmonization
  - Implemented popup-based note entry system replacing sidebar tool palette approach
  - Created comprehensive note storage with octave superscript/subscript display (¹² / ₁₂)
  - Added solfa beat notation with dot/comma subdivisions (.d, .,d, ,d formats)
  - Implemented automatic harmonization: Soprano notes generate harmony for A, T, B voices
  - Added note articulation options (staccato, accent, tenuto, legato)
  - Created visual feedback with blue highlights and note display in cells
  - Integrated with chord track for intelligent harmony generation
  - Full CRUD operations: add, edit, delete notes with confirmation dialogs

- **2025-08-08**: Enhanced Track Management System
  - Added comprehensive clear functionality for all tracks with warning dialogs
  - Completed Marker track with 8 templates and custom marker capability
  - Implemented complete Lyrics track with text input and storage
  - Created consistent popup interface pattern across all track types

- **2025-08-01**: Migrated from Bolt to Replit environment
  - Verified all dependencies are correctly installed
  - Confirmed application structure is compatible with Replit
  - Application successfully running on workflow system
  - Theme system and font loading working correctly

## Completed Features
- ✓ Music notation editor with canvas-based interface
- ✓ Dark/light theme toggle with system preference detection
- ✓ Time signature and key signature selection
- ✓ Track panel for multi-voice compositions (SATB)
- ✓ Complete Chord track with inline popup selection system
- ✓ Complete Lyrics track with text input and storage capabilities
- ✓ Responsive design with sidebar navigation
- ✓ File operations framework