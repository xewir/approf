
// Modelos que utilizan las rutas
var n_modelos = 2;
var modelos = Array(n_modelos);
modelos[0] = require('../modelos/alumno');
modelos[1] = require('../modelos/profesor');

var Asignatura = require('../modelos/asignatura');

var auth = require('../auth');
var _ = require('lodash');
var async = require('async');
var chalk = require('chalk');

module.exports = function (app) 
{
	app.get('/api/perfil/info', auth, function(req,res) {
		// Solo se devolverá la info si el usuario se encuentra logeado
		if (req.decoded)
		{
			if(req.decoded.tipo >= 0 && req.decoded.tipo < n_modelos)
			{
				modelos[req.decoded.tipo].findOne({userName: req.decoded.user.userName}, {password: 0, session: 0})
				                         .populate("asignaturas", ["nombre"])
				                         .exec(function(error, data) {
					if (error || !data)
					{
						res.status(403).json({
							success: false,
							message: 'Error obteniendo la informacion'
						});
					} 
					else 
					{
						res.json(data);
					}
				});
			}
		}
		else
		{
			res.status(500).json({
				success: false,
				message: 'Se ha prohibido el acceso'
			});
		}
	});

	// Se le envia un objeto con las propiedades que se desean recuperar
	app.post('/api/perfil/get', auth, function(req,res) {
		// Solo se devolverá la info si el usuario se encuentra logeado
		if (req.decoded) 
		{
			// Es un alumno
			if(req.decoded.tipo >= 0 && req.decoded.tipo < n_modelos)
			{
				modelos[req.decoded.tipo].findOne({userName: req.decoded.user.userName}, {__v: 0, password: 0, session: 0})
									     .populate("asignaturas", ["nombre"])
									     .exec(function(error, data) {
					if (error || !data)
					{
						res.status(403).json({
							success: false,
							message: 'Error obteniendo la informacion'
						});
					} 
					else 
					{
						var obj = req.body;
						for(var property in obj)
						{
							if (data[property])
							{
								obj[property] = data[property];
							}
						}
						res.json(obj);
					}
				});
			}
		}
		else
		{
			res.status(500).json({
				success: false,
				message: 'Se ha prohibido el acceso'
			});
		}
	});

	app.post('/api/perfil/profesor', auth, function(req,res)
	{
		console.log("Llamada a perfil/profesor");
		if (req.decoded && req.body.profesor)
		{
			modelos[1].findOne({userName: req.body.profesor}, {password: 0, __v: 0, session: 0})
					  .populate("asignaturas", ["nombre"])
					  .exec(function(err, data)
			{
				if (err || !data)
				{
					res.status(500).json({
						success: false,
						message: 'No se ha encontrado al profesor'
					});
				} else {
					console.log(data.asignaturas);
					res.status(200).json(data);
				}
			});
		}
		else
		{
			res.status(403).json({
				success: false,
				message: 'No se ha enviado informacion del profesor'
			});
		}
	});

	app.post('/api/perfil/set', auth, function (req, res) {
		if (req.decoded && !_.isEmpty(req.body))
		{
			if(req.decoded.tipo >= 0 && req.decoded.tipo < n_modelos)
			{
				modelos[req.decoded.tipo].findOne({userName: req.decoded.user.userName}, function(err, data){
					if (err || !data)
					{
						res.status(500).json({
							success: false,
							message: 'Error modificando la informacion'
						});
					} else {

						for (var property in req.body)
						{
							if (data[property] != undefined && property !== "asignaturas")
							{
								data[property] = req.body[property];
							}
						}

						if (req.body.asignaturas != undefined)
						{
							var asignaturas = req.body.asignaturas.split(",");
							var n = asignaturas.length;
							var i = 0;

							data.asignaturas = [];

							async.each(asignaturas, function(asig, next){
								Asignatura.findOne({nombre: asig}, function(err,dataAsig){
									if (!err)
									{
										data.asignaturas.push(dataAsig._id);
										i++;

										if (i == n)
										{	
											data.save(function(err, me) {
												if (err) {
													res.status(500).json({
														success: false,
														message: 'Error modificando la informacion'
													});
												} else {
													console.log(chalk.green("Modificado usuario " + me.userName));
													res.status(200).json({
														success: true,
														message: 'Modificado correctamente el usuario'
													});
												}
											});
										}
									}
									next();
								});
							});
						} else {
							data.save(function(err, me) {
								if (err) {
									res.status(500).json({
										success: false,
										message: 'Error modificando la informacion'
									});
								} else {
									console.log(chalk.green("Modificado usuario " + me.userName));
									res.status(200).json({
										success: true,
										message: 'Modificado correctamente el usuario'
									});
								}
							});
						}
					}
				});
			}
		} else
		{
			res.status(500).json({
				success: false,
				message: 'Se ha prohibido el acceso'
			});
		}
	});
};