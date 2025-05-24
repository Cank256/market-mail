# MarketMail Web Application

## Overview
MarketMail is a crowdsourced produce-price exchange platform that converts simple emails into live market-price data for Uganda and East Africa. This web application serves as the frontend interface for users to interact with the market price data.

## Features
- **Dashboard**: View live market prices and trends.
- **Market Selector**: Choose different markets to see specific price data.
- **Market Map**: Visual representation of market locations.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn
- Vite for development server

### Installation
1. Clone the repository:
   ```
   git clone https://github.com/Cank256/market-mail.git
   cd market-mail/web
   ```

2. Install dependencies:
   ```
   npm install
   ```

### Running the Application
To start the development server, run:
```
npm run dev
```
The application will be available at `http://localhost:5173`.

### Building for Production
To create a production build, run:
```
npm run build
```
The output will be in the `dist` directory.

## Directory Structure
- **public/**: Contains static assets like the favicon.
- **src/**: Main source code for the application.
  - **assets/**: Static assets used in the application.
  - **components/**: Reusable React components.
  - **hooks/**: Custom hooks for managing state and side effects.
  - **pages/**: Page components for routing.
  - **services/**: API service functions for backend communication.
  - **types/**: TypeScript types and interfaces.
  - **utils/**: Utility functions for formatting and other tasks.

## Contributing
1. Fork the repository.
2. Create a new branch for your feature:
   ```
   git checkout -b feature/my-feature
   ```
3. Make your changes and commit them:
   ```
   git commit -m "Add new feature"
   ```
4. Push to your branch:
   ```
   git push origin feature/my-feature
   ```
5. Open a pull request.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments
- Thanks to all contributors for their efforts in making MarketMail a reality.
- Special thanks to the community for their support and feedback.