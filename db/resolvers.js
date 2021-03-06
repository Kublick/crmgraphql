const Usuario = require('../models/usuarios');
const Producto = require('../models/Producto');
const Cliente = require('../models/Clientes');
const bcryptjs = require('bcryptjs');
require('dotenv').config({ path: 'variables.env' });
const jwt = require('jsonwebtoken');
const Clientes = require('../models/Clientes');

const crearToken = (usuario, secreta, expiresIn) => {
  const { id, email, nombre, apellido } = usuario;
  return jwt.sign({ id, email, nombre, apellido }, secreta, { expiresIn });
};

//! resolvers
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
        throw new Error('Producto no encontrado');
      }
      return producto;
    },
    obtenerClientes: async () => {
      try {
        const cliente = await Cliente.find({});
        return cliente;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerClientesVendedor: async (_, {}, ctx) => {
      try {
        const cliente = await Cliente.find({
          vendedor: ctx.usuario.id.toString(),
        });
        return cliente;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerCliente: async (_, { id }, ctx) => {
      const cliente = await Cliente.findById(id);

      if (!cliente) {
        throw new Error('Cliente no encontrado');
      }

      if (cliente.vendedor.toString() !== ctx.usuario.id) {
        throw new Error('no tienes las credenciales');
      }

      return cliente;
    },
  },
  Mutation: {
    nuevoUsuario: async (_, { input }) => {
      const { email, password } = input;

      const existeUsuario = await Usuario.findOne({ email });
      console.log(existeUsuario);

      if (existeUsuario) {
        throw new Error('El usuario ya esta registrado');
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
      console.log('entro');
      const { email, password } = input;
      // si existe
      const existeUsuario = await Usuario.findOne({ email });
      if (!existeUsuario) {
        throw new Error('El usuario no existe');
      }

      const passwordCorrecto = await bcryptjs.compare(
        password,
        existeUsuario.password
      );

      if (!passwordCorrecto) {
        throw new Error('El Password es Incorrecto');
      }

      return {
        token: crearToken(existeUsuario, process.env.SECRETA, '24h'),
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
        throw new Error('Producto no encontrado');
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
        throw new Error('Producto no encontrado');
      }
      await Producto.findOneAndDelete({ _id: id });

      return 'Producto Eliminado';
    },
    nuevoCliente: async (_, { input }, ctx) => {
      console.log(ctx);
      const { email } = input;

      //verificar si esta registrado
      const cliente = await Cliente.findOne({ email });
      if (cliente) {
        throw new Error('Ese cliente ya esta registrado');
      }
      const nuevoCliente = new Cliente(input);
      // asignar vendedor
      nuevoCliente.vendedor = ctx.usuario.id;
      // guardar en base de datos
      try {
        const res = await nuevoCliente.save();
        return res;
      } catch (error) {
        console.log(error);
      }
    },
    actualizarCliente: async (_, { id, input0 }, ctx) => {
      console.log(id);
      let cliente = await Cliente.findById({ id });
      if (!cliente) {
        throw new Error('Ese cliente no existe');
      }
      if (cliente.vendedor.toString() !== ctx.usuario.id) {
        throw new Error('no tienes las credenciales');
      }

      cliente = await Cliente.findOneAndUpdate({ _id: id }, input, {
        new: true,
      });
      return cliente;
    },
    eliminarCliente: async (_, { id }, ctx) => {
      let cliente = await Cliente.findById({ id });
      if (!cliente) {
        throw new Error('Ese cliente no existe');
      }
      if (cliente.vendedor.toString() !== ctx.usuario.id) {
        throw new Error('no tienes las credenciales');
      }

      await Cliente.findOneAndDelete({ _id: id });
      return 'Cliente Eliminado';
    },
  },
};

module.exports = resolvers;
