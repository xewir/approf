
var n_modelos = 2;
var modelos = Array(n_modelos);
modelos[0] = require('../modelos/profesor');
modelos[1] = require('../modelos/asignatura');
const EmptyQuery = JSON.stringify({"$and":[]});
var auth = require('../auth');
var _ = require('lodash');

module.exports = function (app)
{
	//Descomentar lineas y añadir el parametro auth para que pida autorizacion antes de buscar
	app.post('/api/busqueda', auth, function (req, res) {
		if (req.decoded) {
			if (_.isEmpty(req.body))
			{
				console.log("Peticion con campos vacios");
				res.status(400).json({
					succes: false,
					message: 'Los campos de busqueda estan vacios'
				});
			}
			else
			{
				construirQuery(req, res, lanzarQuery);
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

	function construirQuery(req, res, lanzarQuery)
	{
		console.log("Construyendo query")
		err = null;
		var query = {}; 			//Construimos la query en funcion de los parametros rellenados
		query["$and"]=[];
		if(req.body.ciudad){ query["$and"].push({ciudad: req.body.ciudad});}
                if(req.body.diasPromocionRestantes){ query["$and"].push({diasPromocionRestantes: req.body.diasPromocionRestantes});}
		if(req.body.precioHora){ query["$and"].push({precioHora: req.body.precioHora});}
		if(req.body.horarios && JSON.stringify(req.body.horarios) != "[]") {query["$and"].push({horarios: { $in: req.body.horarios}});}
		if(req.body.nombre){ query["$and"].push({userName: req.body.nombre});}
		if(req.body.asignaturas && JSON.stringify(req.body.asignaturas) != "[]")
		{
			if(req.body.cursos && JSON.stringify(req.body.cursos) != "[]")	//Busca el _id de la asignatura/nivel y lo añade a la query
			{
				modelos[1].find({nombre: { $in : req.body.asignaturas} , nivel: { $in: req.body.cursos}}, {_id: 1}, function (err, data) {
					console.log(data);
					if (err || !data)
					{
						if(!err) err = new Error("No existe ninguna asignatura con ese nombre/cursos");
						lanzarQuery(err,res, query);
					}
					else
					{
						query["$and"].push({asignaturas: {$in: data}});
						lanzarQuery(null,res,query);
					}
				});
			}
			else		//Busca todos lo id de la asignatura a todos los niveles
			{
				modelos[1].find({nombre: { $in: req.body.asignaturas}}, {_id: 1}, function (err, data) {
					console.log(data);
					if (err || !data.length)
					{
						if (!err) err = new Error("No existe ninguna asignatura con ese nombre");
						lanzarQuery(err, res, query);
					}
					else
					{
						query["$and"].push({asignaturas: {$in: data}});
						lanzarQuery(null,res, query);
					}
				});
			}
		}
		else
		{
			lanzarQuery(err,res, query);
		}
	}
};

//2o parametro 'proyecciones' para solo devolver los campos que debe ver el usuario
function lanzarQuery(err, res, query) {
	console.log(JSON.stringify(query));

	if (err || (JSON.stringify(query) === EmptyQuery))
	{
		if(!err) err = new Error("No hay ningun parametro de busqueda valido");
		console.log(err);
		res.status(400).json({
			success: false,
			message: err.toString()
		});
	}
	else
	{
		modelos[0].find(query,
			{userName: 1, nombre: 1, apellidos: 1, telefono: 1, email: 1, diasPromocionRestantes:1, precioHora: 1,
				ciudad: 1, horarios: 1, valoracionMedia: 1, horarios:1, asignaturas: 1},
			{sort: {valoracionMedia: -1}})
			.populate('asignaturas')
			.exec(
			function (error, data) {
				console.log(data);
				if (error || !data)
				{
					console.log("Error en la busqueda");
					//console.log(error);
					res.status(403).json({
						success: false,
						message: 'Error en la busqueda'
					});
				}
				else
				{
					res.json(data);
				}
			});
	}
}