import app from './app';
import { config } from './config';

// Start the server
// const PORT = config.PORT || 3000;

// const server = app.listen(PORT, () => {
//     console.log(`🚀 MarketMail API server running on port ${PORT}`);
//     console.log(`📊 Health check: http://localhost:${PORT}/health`);
//     console.log(`🌐 API endpoints: http://localhost:${PORT}/api`);
//     console.log(`📧 Webhook endpoint: http://localhost:${PORT}/webhook/inbound`);
//     console.log(`🌍 Environment: ${config.NODE_ENV}`);
// });

// // Graceful shutdown
// process.on('SIGTERM', () => {
//     console.log('SIGTERM received. Shutting down gracefully...');
//     server.close(() => {
//         console.log('Server closed');
//         process.exit(0);
//     });
// });

// process.on('SIGINT', () => {
//     console.log('SIGINT received. Shutting down gracefully...');
//     server.close(() => {
//         console.log('Server closed');
//         process.exit(0);
//     });
// });

// export default server;
export default app;