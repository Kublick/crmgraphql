const Usuario = require("../models/usuarios");
const bcryptjs = require("bcryptjs");

//! resovers
const resolvers = {
	Query: {
		obtenerCurso: () => "Algo",
	},
	Mutation: {
		nuevoUsuario: async (_, { input }) => {
			const { email, password } = input;

			const existeUsuario = await Usuario.findOne({ email });
			console.log(existeUsuario);

			if (existeUsuario) {
				throw new Error("El usuario ya esta registrado");
			}

			const salt = bcryptjs.genSaltSync(10);
			input.password = bcryptjs.hashSync(password, salt);

			try {
				const usuario = new Usuario(input);
				usuario.save();
				return usuario;
			} catch (error) {
				console.log(error);
			}
		},
	},
};

module.exports = resolvers;
