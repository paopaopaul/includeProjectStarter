import fastify, { FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import lots from './lots';

console.log('Starting server initialization...');

const server = fastify({ logger: true });
console.log('Fastify instance created');

server.register(cors, { origin: "https://fortune-telling-webapp.vercel.app", methods: ["GET", "POST"] });
console.log('CORS middleware registered');

//draw lot
server.get('/api/draw-lot', async (request: FastifyRequest, reply: FastifyReply) => {
  console.log('Received request for /api/draw-lot');
  try {
    console.log('Attempting to draw a random lot');
    //throw new Error("Simulated server error");

    const randomLot = lots[Math.floor(Math.random() * lots.length)];
    console.log('Random lot drawn:', randomLot);
    console.log('Sending successful response');
    return reply.code(200).send({ lot: randomLot });  // Respond with success
  } catch (err) {
    console.error('Error in /api/draw-lot:', err);
    server.log.error(err);
    console.log('Sending error response to client');
    return reply.code(500).send({ error: "Server Error" });  // Send error to client
  }
});

// Global error handler
server.setErrorHandler((error: Error, request: FastifyRequest, reply: FastifyReply) => {
  console.error('Global error handler triggered:', error);
  server.log.error(error);  // Log the error

  console.log('Sending generic error response to client');
  // Respond with a generic error message
  reply.status(500).send({
    error: 'Something went wrong on the server.',
    details: error.message,
  });
});

// Start server
const start = async () => {
  console.log('Starting server...');
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
    console.log(`Attempting to start server on port ${port}`);
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`Server is running at http://localhost:${port}`);
  } catch (err) {
    console.error('Failed to start server:', err);
    server.log.error(err);
    process.exit(1);
  }
};

console.log('Initiating server start process');
start();
