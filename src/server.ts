import 'source-map-support/register';

// Makes config global
import './configLoader';

import * as bodyParser from 'body-parser';
import { CronJob } from 'cron';
import container from './ioc_container';

import { InversifyExpressServer } from 'inversify-express-utils';
import errorHandler from './middleware/errorHandler';

import AuthProvider from './providers/AuthProvider';
import emailAnalyzerCron from './crons/emailAnalysisCron';

const server = new InversifyExpressServer(
  container,
  null,
  null,
  null,
  AuthProvider
);

server.setConfig(appProto => {
  appProto.use(bodyParser.json());
});

server.setErrorConfig(appProto => {
  appProto.use(errorHandler);
});

const app = server.build();
app.listen(config.api.port, async () => {
  console.log('Server listening to port 3000');
  const cron = new CronJob(config.cron.analyze, () => emailAnalyzerCron());
  cron.start();
});
