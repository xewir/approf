'use strict'

var mongoose = require('mongoose');

var Profesor = require('./../modelos/profesor');

module.exports = function (app) {

	app.get('/api/profesor/pagos', function(req, res) {
		Profesor.findOne({userName: req.decoded.user.userName}, function(err, data) {
			if (err || !data) {
				res.status(500).json({
					success: false,
					message: 'No se dispone de información del profesor'
				});
			} else {
				data.diasPromocionRestantes += 30;
				data.save();
			}
		});
	});
};
