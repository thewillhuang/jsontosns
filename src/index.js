import Koa from 'koa';
import compress from 'koa-compress';
import morgan from 'koa-morgan';
import bodyParser from 'koa-bodyparser';
import { SNS } from 'aws-sdk';
import { isEmpty } from 'ramda';

const { PORT = 3000 } = process.env;

const app = new Koa();

const sns = new SNS({ apiVersion: '2010-03-31', region: 'us-east-1' });

const publish = params => new Promise((resolve, reject) => {
  sns.publish(params, (err, data) => {
    if (err) reject(err);
    else resolve(data);
  });
});

app.use(morgan('dev'));
app.use(compress());
app.use(bodyParser());
app.use(async (ctx) => {
  const { request: { body } } = ctx;
  if (isEmpty(body)) {
    ctx.status = 200;
    ctx.body = 'alive';
  } else {
    await publish({
      PhoneNumber: '17146869860',
      Message: JSON.stringify(body),
      MessageStructure: 'STRING_VALUE',
    });
    ctx.body = { message: 'sent' };
  }
});

app.listen(PORT);

console.log(`nodejs server started on port ${PORT}`);
