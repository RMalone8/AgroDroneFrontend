# AgriDrone Control System

A React-based dashboard for semi-autonomous agricultural drone monitoring and control.

## Features

- **Flight Planning**: Field location input and satellite view
- **Drone Control**: Emergency controls, battery status, and live feed
- **Sensor Data**: NDVI readings, moisture levels, and field health mapping
- **Flight Logs**: Historical flight data and status tracking
- **Maintenance**: System health monitoring and support contact
- **System Overview**: Real-time flight progress and weather conditions

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Project Structure

```
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
├── index.html           # HTML template
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components
│   └── figma/          # Figma-specific components
├── styles/             # Global styles
└── guidelines/         # Project guidelines
```

## Development

The application uses a modern React setup with:
- Hot module replacement for fast development
- TypeScript for better developer experience
- Tailwind CSS for utility-first styling
- ESLint for code quality

## License

This project is for demonstration purposes.
