



//! resovers
const resolvers = {
    Query: {
      obtenerCurso: () => "Algo"
    },
    Mutation: {
      nuevoUsuario: (_,{input}) => {
        console.log(input);
        return "Creando Usuario"
      }
    
    }
}

module.exports = resolvers;