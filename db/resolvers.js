const Usuario = require("../models/usuarios");
const Producto = require("../models/Producto");
const bcryptjs = require("bcryptjs");
require("dotenv").config({ path: "variables.env" });
const jwt = require("jsonwebtoken");

const crearToken = (usuario, secreta, expiresIn) => {
	const { id, email, nombre, apellido } = usuario;
	return jwt.sign({ id, email, nombre, apellido }, secreta, { expiresIn });
};

//! resovers
const resolvers = {
	Query: {
		obtenerUsuario: async (_, { token }) => {
			const usuarioId = await jwt.verify(token, process.env.SECRETA);
			return usuarioId;
		},
		obtenerProductos: async () => {
			try {
				const productos = await Producto.find({});
				return productos;
			} catch (error) {
				console.log(error);
			}
		},
		obtenerProducto: async (_, { id }) => {
			//revisar si existe o no
			const producto = await Producto.findById(id);
			if (!producto) {
				throw new Error("Producto no encontrado");
			}
			return producto;
		},
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
		autenticarUsuario: async (_, { input }) => {
			const { email, password } = input;
			// si existe
			const existeUsuario = await Usuario.findOne({ email });
			if (!existeUsuario) {
				throw new Error("El usuario no existe");
			}

			const passwordCorrecto = await bcryptjs.compare(
				password,
				existeUsuario.password
			);

			if (!passwordCorrecto) {
				throw new Error("El Password es Incorrecto");
			}

			return {
				token: crearToken(existeUsuario, process.env.SECRETA, "24h"),
			};
		},
		nuevoProducto: async (_, { input }) => {
			try {
				const producto = new Producto(input);

				const resultado = await producto.save();

				return resultado;
			} catch (error) {
				console.log(error);
			}
		},
		actualizarProducto: async (_, { id, input }) => {
			//revisar si existe o no
			let producto = await Producto.findById(id);
			if (!producto) {
				throw new Error("Producto no encontrado");
			}

			// guardar en base
			producto = await Producto.findOneAndUpdate({ _id: id }, input, {
				new: true,
			});
			return producto;
		},
		eliminarProducto: async (_, { id }) => {
			console.log(id);
			//revisar si existe o no
			let producto = await Producto.findById(id);
			if (!producto) {
				throw new Error("Producto no encontrado");
			}
			await Producto.findOneAndDelete({ _id: id });

			return "Producto Eliminado";
		},
	},
};

module.exports = resolvers;
