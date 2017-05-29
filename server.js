// Dependencias del servidor
var express = require("express");
var fs = require('fs');
var config = require('./config');
var morgan = require('morgan');
var mongoose = require('mongoose');
var _ = require('lodash');
var chalk = require('chalk');
var bodyParser = require('body-parser');

var auth_middleware = require('./auth');
var updateD = require('./updateDays');

var port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || config.puerto || 8080;

// Inicializa el servidor HTTP
var app = express();

// Inicializa el salt (si todo correcto se encontrará en config.salt)
config.saltInit(true);

// Inicializa las rutas de ficheros de rutas
config.initRutasFolder();

// Parseo de parámetros de formularios
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Por cada ruta, prepara el ENDPOINT
_.forEach(config.foldersRutas, function(valor) {
	require(valor)(app);
});

// Crea conexion con la base de datos
/*connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
  process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
  process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
  process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
  process.env.OPENSHIFT_APP_NAME;
mongoose.connect(connection_string);*/
mongoose.connect('mongodb://' + config.dbUser + ':' + config.dbPass + '@' + config.dbURI);

// Si la conexion falla
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

// Logger de las peticiones HTTP recibidas
app.use(morgan('dev'));

// Middleware que parsea el token y extrae los credenciales de sesión
//app.use(auth_middleware);

// Ruta predeterminada
app.get('*', function(req, res) {
	res.send('<h1> API de Approf </h1>');
});

//const tomorrow = new Date();
//tomorrow.setDate(tomorrow.getDate + 1);

//setInterval(updateD.updateDays,1000);
setInterval(updateD.updateDays,8.64e+7);

// Empieza el servidor a escuchar peticiones en el puerto seleccionado
app.listen(port);

console.log(chalk.green('Express server ejecutandose en ' + (process.env.OPENSHIFT_NODEJS_IP || process.env.IP || "localhost") + " : " + port));