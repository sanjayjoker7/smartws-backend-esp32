# Smart Waste Segregation - Frontend

A modern React-based dashboard for monitoring and managing smart waste bins powered by AI classification.

## Features

- Real-time waste bin monitoring
- AI-powered waste classification via ESP32-CAM
- Interactive 3D bin visualizations
- Analytics and collection history
- User authentication

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at http://localhost:8080

### Build for Production

```bash
npm run build
```

## Technology Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Shadcn/ui** for UI components
- **Recharts** for data visualization
- **React Router** for navigation

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React context providers
├── hooks/          # Custom React hooks
├── lib/            # Utility functions and API client
├── pages/          # Page components
└── main.tsx        # Application entry point
```

## API Integration

The frontend connects to a Django backend at `http://localhost:8000/api/` for:
- Bin status data
- Classification history
- User authentication

## License

MIT
