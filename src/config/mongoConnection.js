const mongoose = require('mongoose')
require('dotenv').config()

module.exports = mongoConnection = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODBCONN}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    })
    return console.log('Conectado ao MongoDB')
  } catch (err) {
    if (err) throw err
  }
}
