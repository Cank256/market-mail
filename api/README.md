# API Documentation for MarketMail

## Overview
MarketMail is a crowdsourced produce-price exchange platform that converts simple emails into live market-price data for Uganda and East Africa. This API serves as the backend for the MarketMail application, handling incoming email data, storing it in a database, and providing endpoints for retrieving market prices.

## Features
- **Email Parsing**: Parses incoming emails to extract market price data.
- **Data Storage**: Stores parsed data in a MongoDB database.
- **Webhook Integration**: Handles incoming webhook requests from Postmark.
- **Public API**: Provides endpoints for fetching market prices and trends.
- **Error Handling**: Implements middleware for error management.

## Getting Started

### Prerequisites
- Node.js (version 20 or higher)
- MongoDB Atlas account
- Postmark account for email handling
- OpenAI API key (optional)

### Installation
1. Clone the repository:
   ```
   git clone https://github.com/Cank256/market-mail.git
   cd market-mail/api
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on the `.env.example` file and fill in the required environment variables.

### Running the Application
To run the API locally, use the following command:
```
npm run dev
```
The API will be available at `http://localhost:3000`.

### Testing
To run tests, use:
```
npm test
```

## API Endpoints

### Webhook Endpoint
- **POST /api/postmark/inbound**
  - Description: Receives incoming emails from Postmark and processes them.
  - Request Body: Signed JSON from Postmark.

### Public API Endpoints
- **GET /api/market/:name/prices**
  - Description: Fetches market prices for a specific market.
  - Parameters:
    - `name`: The name of the market.

## Error Handling
The API includes middleware for handling errors. If an error occurs, a standardized error response will be sent to the client.

## Contribution
Contributions are welcome! Please follow the contribution guidelines outlined in the main repository README.

## License
This project is licensed under the MIT License. Data published is under Creative Commons BY 4.0.

---

For more detailed information about specific modules, please refer to the respective files in the `src` directory.