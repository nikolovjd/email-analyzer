import 'source-map-support/register';
import container from './ioc_container';
import * as bodyParser from 'body-parser';

// Makes config global
import './configLoader';

import { interfaces, InversifyExpressServer } from 'inversify-express-utils';

const server = new InversifyExpressServer(container);

server.setConfig(app => {
  app.use(bodyParser.json());
});

const app = server.build();
app.listen(3000, () => {
  console.log('Server listening to port 3000');
});
