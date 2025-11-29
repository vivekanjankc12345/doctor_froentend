# HMS Frontend - Hospital Management System

A modern React frontend for the Hospital Management System built with Material-UI.

## Features

- 🎨 Beautiful Material-UI design
- 🔐 Authentication with JWT tokens
- 👨‍💼 Super Admin dashboard
- 🏥 Hospital management
- 📱 Responsive design
- 🔄 Automatic token refresh

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running on http://localhost:5000

## Installation

1. **Install dependencies**
```bash
npm install
```

2. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` and set your API URL:
```
REACT_APP_API_URL=http://localhost:5000/api
```

3. **Start the development server**
```bash
npm start
```

The app will open at http://localhost:3000

## Default Login Credentials

- **Email**: super@hms.com
- **Password**: Super@123

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Layout/         # Layout components
│   └── ...
├── contexts/           # React contexts
│   └── AuthContext.js  # Authentication context
├── pages/              # Page components
│   ├── Login.js
│   └── SuperAdmin/     # Super Admin pages
├── services/           # API services
│   ├── api.js          # Axios configuration
│   ├── authService.js
│   └── hospitalService.js
├── config/             # Configuration files
├── theme.js            # MUI theme configuration
└── App.js              # Main app component
```

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## Features Implemented

### Super Admin
- ✅ Login page with beautiful UI
- ✅ Dashboard with statistics
- ✅ Hospital management (list, view, update status)
- ✅ Responsive sidebar navigation
- ✅ User profile menu

### Coming Soon
- User management
- Role management
- Settings page
- Hospital Admin dashboard
- Doctor, Nurse, Pharmacist dashboards

## API Integration

The frontend integrates with the following backend endpoints:

- `POST /api/auth/login` - User login
- `GET /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/admin/hospitals` - Get all hospitals (Super Admin)
- `PUT /api/admin/hospital/status/:id` - Update hospital status

## Technologies Used

- React 18
- Material-UI (MUI) 5
- React Router 6
- Axios
- Emotion (CSS-in-JS)

## License

Proprietary software

