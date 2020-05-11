

const maxmind = require('maxmind');
const app = require('fastify')({
    logger: true,
    disableRequestLogging: true,
    requestIdHeader: false,
});
const nstats = require('nstats')();
var ipdb;


app.setErrorHandler(function(error, request, reply) {
    config.log.logger.error(error);
    reply.code(500).send(JSON.stringify({
        type: 'error',
        msg: 'Please report this issue to the site admin',
    }));
});

app.get('/api/v1/server/metrics', (req, res) => {res.code(200).send(nstats.data);});

app.get('/health', (req, res) => {
  console.log(req.headers)
  res.code(200).send('OK');
});

app.use((req, res, next)=>{
    if (req.url.indexOf('/api/server/metrics') == -1 && req.url.indexOf('/health') == -1) {

        if (!nstats.httpServer) {
            nstats.httpServer = req.connection.server;
        }

        var sTime = process.hrtime.bigint();

        res.on('finish', () => {
            nstats.addWeb(req, res, sTime);
        });
    }
    next();
});
app.addHook('preParsing', function(req, res, next) {

  //check if ip is from cloudflare CIDR
    console.log(req.ip)
    if(!req.headers['cf-connecting-ip']) {
      res.code(401).send();
      return;
    }

    console.log(req.details(req))
    next()
});

app.decorateRequest('details', function(req) {
  const d = ipdb.get(req.headers['cf-connecting-ip']);
  try {
      return {city: d.city.names.en,state:d.subdivisions[0].iso_code, ip: req.headers['cf-pseudo-ipv4'] || req.headers['cf-connecting-ip']};
  } catch (e) {
    console.error(d, req.headers,req.ip)
  }
  return  null;
});

app.register(require('./api'), {prefix: '/api/v1'});
// app.get('/about',(req, res) => {
//         res.sendFile('index.html');
//         res.code(200);
//         return;
// });
app.register(require('fastify-static'), {
    root: __dirname+'/client/dist/',
    prefix: '/',
    serve: true

});

app.ready(()=>{
    console.log(app.printRoutes());
});

async function init() {

    ipdb = await maxmind.open('./ipdb/db.mmdb',{options:{cache:{max:1}}})
    app.listen(8080, "0.0.0.0");
}

init();
