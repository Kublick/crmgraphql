const { ApolloServer } = require('apollo-server')
const typeDefs = require('./db/schema')
const resolvers = require('./db/resolves')

const conectarDB = require('./config/db')


conectarDB();

//! crea server
const server = new ApolloServer({ 
    typeDefs,
    resolvers
});


//! arranca server
server.listen().then( ({url}) => {
console.log(`servidor listo en la url ${url}`)
})