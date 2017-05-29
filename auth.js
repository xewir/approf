'use strict';

var jwt = require('jsonwebtoken');
var config = require('./config');
var bcrypt = require('bcrypt-nodejs');
var chalk = require('chalk');

var mongoose = require('mongoose');


//
// TOKEN DE SESIÓN
// 
// {
//   tipo : integer ,
//   user : Usuario (objeto información del usuario)
// }
//

var n_modelos = 2;
var modelos = Array(n_modelos);
modelos[0] = require('./modelos/alumno');
modelos[1] = require('./modelos/profesor');

module.exports = function (req, res, next) {

	var token = req.headers['xtoken'];

	if (token) {
		jwt.verify(token, config.secret, function(err, deco) {
			if (!err && deco.user !== undefined && deco.tipo !== undefined) {
				console.log(chalk.yellow("Validando usuario " + deco.user.userName + " -> Tipo : " + deco.tipo));
				modelos[deco.tipo].findOne({userName: deco.user.userName}, function(err, data) {
					if (!err && data && data.sesion === deco.user.sesion) {
						console.log(chalk.green("Validado usuario " + deco.user.userName));
						req.decoded = deco;
						next();
					} else {
						console.log(chalk.red("Error validando sesión"));
						res.status(500).json({
							success: false,
							message: 'Error validando usuario'
						});
					}
				});
			} else {
				res.status(500).json({
					success: false,
					message: 'Error validando token'
				});
			}
		});
	} else {
		console.log(chalk.red('No se ha validado token'));
		res.status(500).json({
			success: false,
			message: 'No se ha validando el token'
		});
	}
}