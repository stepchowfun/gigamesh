import * as bunyan from 'bunyan';

export default bunyan.createLogger({
  name: 'www',
  serializers: {
    request: bunyan.stdSerializers.req,
  },
});
