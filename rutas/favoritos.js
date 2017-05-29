'use strict';

var modelos = Array(2);
modelos[0] = require('../modelos/alumno');
modelos[1] = require('../modelos/profesor');

var Favoritos = require('../modelos/favoritos');

var auth = require('../auth');

var chalk = require('chalk');

module.exports = function (app) 
{
	app.post('/api/favoritos/add', auth, function(req,res) {
		// Solo se devolverá la info si el usuario se encuentra logeado
		if (req.decoded.tipo == 0 && req.body.profesor !== undefined) 
		{
			modelos[1].findOne({userName: req.body.profesor}, function(err, data) {
				if (err || !data)
				{
					res.status(400).json({
						success: false,
						message: 'Profesor no existe'
					});
				} else
				{
					var favorito = new Favoritos({
						alumno: req.decoded.user._id,
						profesor: data._id
					});

					Favoritos.findOneAndUpdate({alumno:favorito.alumno, profesor: favorito.profesor},
						favorito, {upsert: true}, function(err){
							if (err || !data)
							{
								res.status(400).json({
									success: false,
									message: 'Error guardando la operacion'
								});
							} else
							{
								console.log(chalk.green('Agregado ' + data.userName + ' a favoritos de ' + req.decoded.user.userName));
								res.status(200).json({
									success: true,
									message: 'Añadido profesor a favoritos'
								});
							}
					});
				}
			});
		}
		else if (req.decoded.tipo == 1 && req.body.alumno !== undefined)
		{
			modelos[0].findOne({userName: req.body.profesor}, function(err, data) {
				if (err || !data)
				{
					res.status(400).json({
						success: false,
						message: 'Alumno no existe'
					});
				} else
				{
					var favorito = new Favoritos({
						alumno: data._id,
						profesor: req.decoded.user._id
					});

					favorito.save(function(err){
						if (err || !data)
						{
							res.status(400).json({
								success: false,
								message: 'Error guardando la operacion'
							});
						} else
						{
							console.log(chalk.green('Agregado ' + data.userName + ' a favoritos de ' + req.decoded.user.userName));
							res.status(200).json({
								success: true,
								message: 'Añadido alumno a favoritos'
							});
						}
					});
				}
			});
		}
		else
		{
			res.status(500).json({
				success: false,
				message: 'Faltan campos'
			});
		}
	});

	app.get('/api/favoritos/get', auth, function(req, res) {

		modelos[req.decoded.tipo].findOne({userName: req.decoded.user.userName}, function(err, data) {
			if (err || !data)
			{
				res.status(400).json({
					success: false,
					message: 'Error recuperando petición'
				});
			}
			else 
			{
				var query = {};

				if (req.decoded.tipo == 0)
				{
					query.alumno = data._id;
				}
				else if (req.decoded.tipo == 1)
				{
					query.profesor = data._id;
				}

				Favoritos.find(query, {_id: 0, __v: 0})
						 .populate([{path: 'alumno', select: 'userName _id'}, {path: 'profesor', select: '-_id -__v -session -password'}])
						 .exec(function(err, data) {
					if (err || !data)
					{
						res.status(400).json({
							success: false,
							message: 'Error recuperando petición'
						});
					}
					else 
					{
						var respuesta = [];
						for (var i = 0; i < data.length; i++)
						{
							respuesta.push(data[i].profesor);
						} 
						res.status(200).json(respuesta);
					}
				});
			}
		});
	});
}