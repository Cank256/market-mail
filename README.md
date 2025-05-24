# MarketMail 📈✉️ – Crowdsourced Produce‑Price Exchange via Email

## Overview
MarketMail is a platform that converts simple emails into live market-price data for Uganda and East Africa. By allowing contributors to send structured emails with market prices, we can aggregate and display this data in real-time, providing valuable insights for farmers, traders, and consumers.

## Features
- **Email Parsing**: Automatically processes incoming emails to extract market price data.
- **Real-time Data**: Updates market prices in real-time, accessible via a public API and a user-friendly dashboard.
- **Data Visualization**: Provides charts and maps to visualize market trends and locations.

## Tech Stack
- **Backend**: Node.js, Express, TypeScript, MongoDB
- **Frontend**: React, Vite, Tailwind CSS, Shadcn
- **Email Service**: Postmark for inbound and outbound email handling
- **Testing**: Jest for unit and integration testing

## Getting Started

### Prerequisites
- Node.js (version 20 or higher)
- MongoDB Atlas account or Local MongoDB setup
- Postmark account for email handling
- OpenAI API key (optional)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Cank256/market-mail.git
   cd market-mail
   ```

2. Install dependencies for both API and web:
   ```bash
   cd api
   pnpm install
   cd ../web
   pnpm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env` in the `api` directory and fill in the required values.

### Running the Application
1. Start the API:
   ```bash
   cd api
   pnpm dev
   ```

2. Start the frontend:
   ```bash
   cd web
   pnpm dev
   ```

3. Use ngrok to expose the API for Postmark:
   ```bash
   ngrok http 3000
   ```

### Testing
- Run unit tests:
  ```bash
  cd api
  pnpm test
  ```

### Contributing
1. Fork the repository.
2. Create a new branch for your feature:
   ```bash
   git checkout -b feat/my-feature
   ```
3. Make your changes and commit them:
   ```bash
   git commit -m "Add feature description"
   ```
4. Push to your fork and create a pull request.

## License
This project is licensed under the MIT License. Data published under Creative Commons BY 4.0.

## Acknowledgments
- Thanks to all contributors and the community for their support in building MarketMail.