
// Modelos que utilizan las rutas
var n_modelos = 2;
var modelos = Array(n_modelos);
modelos[0] = require('../modelos/alumno');
modelos[1] = require('../modelos/profesor');

var Asignatura = require('../modelos/asignatura');

var config = require('../config');

var chalk = require('chalk');
var _ = require('lodash');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var async = require('async');

module.exports = function (app) 
{
	app.post('/api/login', function(req, res)
	{
		if (_.isEmpty(req.body) || req.body.userName == undefined || req.body.password == undefined || req.body.tipo == undefined)
		{
			res.status(400).json({
				succes: false,
				message: 'Faltan campos por rellenar'
			});
		}
		else
		{
			console.log(req.body);
			modelos[req.body.tipo].findOne({userName: req.body.userName}, function(err, data){
				if (err || !data) {
					console.log(chalk.red("Error usuario " + req.body.userName));
					res.status(403).json({
						success: false,
						message: 'Usuario o contraseña incorrectos'
					});
				} else {
					config.saltInit(false);
					// Hash de la contraseña del token
					var pass_hash = bcrypt.hashSync(req.body.password, config.salt);
					// Si no ha habido error en la búsqueda, compara las contraseñas
					if (pass_hash === data.password) {
						var token_gen = jwt.sign({
								user: {
									_id : data._id,
									userName : data.userName,
									nombre : data.nombre,
									apellidos: data.apellidos,
									sesion: data.sesion
								},
								tipo: req.body.tipo
							}, config.secret, {
								//expiresIn: config.TIME_EXPIRE // 24 horas
							});
						console.log(chalk.green('Logeado correctamente usuario ') + chalk.underline(data.userName));
						res.status(200).json({
							success: true,
							message: 'Logeado correctamente',
							token: token_gen
						});
					} else {
						console.log(chalk.red("contraseña " + pass_hash + " | " + data.password));
						return res.status(403).json({
							success: false,
							message: 'Usuario o contraseña incorrectos'
						});
					}
				}
			});
		}
	});

	app.post('/api/register', function(req, res)
	{
		var datos = null;
		if (req.body.tipo != undefined && req.body.tipo == 0)
		{
			if (req.body.userName != undefined && req.body.password != undefined)
			{
				config.saltInit(false);
				datos = {
			     	userName: req.body.userName,
			     	password: bcrypt.hashSync(req.body.password, config.salt),
			     	sesion: bcrypt.genSaltSync(10)
			    };
			}
		}
		else if (req.body && req.body.tipo == 1)
		{
			if (req.body.telefono != undefined && req.body.userName != undefined 
				&& req.body.password != undefined 
				&& req.body.email != undefined && req.body.ciudad != undefined
				&& req.body.horarios != undefined && req.body.asignaturas != undefined 
				&& req.body.cursos != undefined && req.body.experiencia != undefined 
				&& req.body.modalidad != undefined) {

					config.saltInit(false);
					datos = {
				     	telefono: req.body.telefono,
				     	userName: req.body.userName,
				     	password: bcrypt.hashSync(req.body.password, config.salt),
				     	email: req.body.email,
				     	ciudad: req.body.ciudad,
				     	horarios: req.body.horarios,
				     	experiencia: req.body.experiencia,
				     	modalidad: req.body.modalidad,
				     	cursos: req.body.cursos,
				     	sesion: bcrypt.genSaltSync(10)
				    };
			}
		}

		if (datos == null)
		{
			console.log("No se ha definido la informacion");
			res.status(400).json({
				succes: false,
				message: 'Faltan campos por rellenar'
			});
		} else {
			var newUser = new modelos[req.body.tipo] (datos);

			if (req.body.tipo != undefined && req.body.tipo == 0)
			{
				regUser(newUser,req,res)
			}
			else
			{
				asignaturas = req.body.asignaturas.split(",");
				var n = asignaturas.length;
				var i = 0;

				async.each(asignaturas, function(asig, next){
					Asignatura.findOne({nombre: asig}, function(err,data){
						if (!err)
						{
							newUser.asignaturas.push(data._id);
							i++;

							if (i == n)
							{
								regUser(newUser,req,res)
							}
						}
						next();
					});
				});
			}
		}
	});

	function regUser(newUser,req, res)
	{
		newUser.save(function(err, me) {
			if (err) {
				res.status(403).json({
					success: false,
					message: 'Nombre de usuario ya escogido'
				});
			} else {
				console.log(chalk.green("Creado usuario " + me.userName));
				console.log(me);
				var token_gen = jwt.sign({
					user: {
						_id : newUser._id,
						username : newUser.userName,
						nombre : newUser.nombre,
						apellidos: newUser.apellidos,
						sesion: newUser.sesion
					},
					tipo: req.body.tipo
				}, config.secret, {
					//expiresIn: config.TIME_EXPIRE // 24 horas
				});
				res.status(200).json({
					success: true,
					message: 'Registrado correctamente el usuario',
					token: token_gen
				});
			}
		});
	}

	app.get('/api/logout', function(req, res)
	{
		if (req.decoded)
		{
			modelos[req.decoded.tipo].update({userName: req.decoded.user.userName}, {sesion: bcrypt.genSaltSync(10)}, function(err, n_update) {
				if (err) {
					console.log(chalk.red("Logout error usuario " + req.decoded.user.username));
					res.status(403).json({
						success: false,
						message: 'Error durante el logout del usuario'
					});
				} else {
					console.log(chalk.green("Deslogeado correctamente usuario " + req.decoded.user.username));
					res.status(200).json({
						success: true,
						message: 'Sesión cerrada correctamente'
					});
				}
			});
		}
		else
		{
			res.status(403).json({
				success: false,
				message: 'No estaba logeado'
			});
		}		
	});

	app.get('/api/unregister', function(req, res) {
		if (req.decoded)
		{
			modelos[req.decoded.tipo].remove({userName: req.decoded.user.userName}, function(err) {
				if (err) {
					res.status(403).json({
						success: false,
						message: 'Error borrando al usuario'
					});
				} else {
					res.status(200).json({
						success: true,
						message: 'Se ha eliminado correcamente al usuario ' + req.decoded.user.username
					});
				}
			});
		}
		else 
		{
			res.status(403).json({
				success: false,
				message: 'No estaba logeado'
			});
		}
	});

	app.get('/api/renovar', function(req, res) {
		if (req.decoded) {
			var token_gen = jwt.sign({
									user: req.decoded.user,
									tipo: req.decoded.tipo
								},
								config.secret,
								{
									//expiresIn: config.TIME_EXPIRE // 24 horas
								}
							);

			console.log(chalk.yellow('Renovando token del usuario ' + req.decoded.user.username));
			res.status(200).json({
				success: true,
				message: 'Token renovado correctamente',
				token: token_gen
			});
		} else {
			console.log(chalk.yellow('Error renovando token'));
			res.status(410).json({
				success: false,
				message: 'Error renovando token'
			});
		}
	});

};