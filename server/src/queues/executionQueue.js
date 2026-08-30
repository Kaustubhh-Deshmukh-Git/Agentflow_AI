const { Queue, Worker } = require('bullmq');
const Redis = require('ioredis');
const env = require('../config/env');
const Orchestrator = require('../agents/orchestrator');

let executionQueue;

const initQueues = () => {
  if (env.REDIS_URL) {
    try {
      console.log('🔄 Connecting to Cloud Redis / BullMQ...');

      // Auto-detect TLS for cloud providers (rediss:// protocol e.g. Upstash, Redis Cloud)
      const isTLS = env.REDIS_URL.startsWith('rediss://');
      const redisOptions = {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      };

      if (isTLS) {
        redisOptions.tls = {
          rejectUnauthorized: false,
        };
      }

      const connection = new Redis(env.REDIS_URL, redisOptions);

      connection.on('connect', () => {
        console.log('✅ Cloud Redis Connected successfully.');
      });

      connection.on('error', (err) => {
        console.warn('⚠️  Redis connection warning:', err.message);
      });

      executionQueue = new Queue('executionQueue', { connection });

      const worker = new Worker(
        'executionQueue',
        async (job) => {
          const { executionId, workflowId, ownerId } = job.data;
          console.log(`[BullMQ Worker] Processing execution ${executionId} for owner ${ownerId}`);
          await Orchestrator.runExecution(executionId, workflowId, ownerId);
        },
        { connection }
      );

      worker.on('completed', (job) => console.log(`[BullMQ] Job ${job.id} completed.`));
      worker.on('failed', (job, err) => console.error(`[BullMQ] Job ${job.id} failed:`, err.message));

      console.log('✅ BullMQ background worker active with Redis.');
    } catch (err) {
      console.warn('⚠️  Redis initialization failed, falling back to in-memory processing.', err.message);
      executionQueue = null;
    }
  } else {
    console.warn('ℹ️  No REDIS_URL provided. Background jobs will run asynchronously in-memory.');
  }
};

const enqueueExecution = async (executionId, workflowId, ownerId) => {
  if (executionQueue) {
    await executionQueue.add(
      'run',
      { executionId, workflowId, ownerId },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true,
        removeOnFail: false,
      }
    );
  } else {
    // In-memory fallback: run async but non-blocking
    process.nextTick(() => {
      Orchestrator.runExecution(executionId, workflowId, ownerId).catch((err) => {
        console.error('[Queue] In-memory execution error:', err);
      });
    });
  }
};

module.exports = { initQueues, enqueueExecution };
