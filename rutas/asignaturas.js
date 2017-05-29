
var Asignatura = require('../modelos/asignatura');
var auth = require('../auth');

module.exports = function (app) 
{
	app.get('/api/asignaturas/get', function(req, res){
		Asignatura.find({}, function(err, data){
			if (!err && data)
			{
				res.status(200).json(data);
			}
			else
			{
				res.status(400).json({
					success: false,
					message: 'Error recuperando las asignaturas'
				});
			}
		})
	});
};