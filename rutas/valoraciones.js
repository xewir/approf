
var Alumno = require('../modelos/alumno');
var Profesor = require('../modelos/profesor');
var auth = require('../auth');
var _ = require('lodash');
var Valoracion = require('../modelos/valoracion');

module.exports = function (app) {
	app.get('/api/valoraciones/:id', function (req, res) {
		if (req.decoded && !_.isEmpty(req)) {
			Profesor.findOne({userName: req.params.id}).exec(function (err, data) {
				console.log(data.valoracionMedia);
				res.json(data);
			});
		} else {
			res.status(500).json({
				success: false,
				message: 'Se ha prohibido el acceso'
			});
		}
	});

	app.post('/api/valoraciones/valorar', auth, function (req, res) {

		if (req.decoded && !_.isEmpty(req) && req.decoded.tipo == 0) {
			// console.log(req)
			Valoracion.findOne({profesor: req.body.profesorID, alumno: req.decoded.user._id}, function (err, data) {
				if (err) {
					console.log("Error en la busqueda de la valoracion");
					console.log(err);
					res.status(403).json({
						success: false,
						message: 'Error en la busqueda'
					});
				}
				else if (data) {
					console.log("Valoracion repetida");
					console.log(data);
					res.json({ message: 'Ya has valorado anteriormente a este profesor'});
				}
				else {
					datos = {
						profesor: req.body.profesorID,
						alumno: req.decoded.user._id,
						puntuacion: req.body.puntuacion
					};
					var val = new Valoracion(datos);
					val.save();
					actualizarValMedia(req, res)
				}
			});
		} else {
			console.log("error")
			res.status(500).json({
				success: false,
				message: 'Se ha prohibido el acceso'
			});
		}
	});
}

function actualizarValMedia(req, res){
	Profesor.findOne({_id:req.body.profesorID}, function(err,data_user) {
		if (err || !data_user) {
			console.log("Error en la busqueda");
			console.log(err);
			res.status(403).json({
				success: false,
				message: 'Error en la busqueda'
			});
		}
		else {
			var mu = data_user.valoracionMedia;
			var num_val = data_user.numeroValoraciones;
			mu = mu * num_val + req.body.puntuacion;
			data_user.numeroValoraciones = num_val + 1;
			data_user.valoracionMedia = mu / (num_val + 1);
			data_user.save();
			console.log("Valoracion actualizada")
			res.json({ message: 'Valoracion enviada ' + req.body.puntuacion});
		}
	});
}
