import * as applicationController from './controller.js';

export const setRoutes = (server) => {
    server.get('/session', applicationController.createSession);
    server.post('/payment', applicationController.processPayment);
    server.post('/tokens/:merchantId', applicationController.createToken);
};
