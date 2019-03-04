import mongoose from 'mongoose'

const PlayerSchema = new mongoose.Schema({

  id: Number,

  name: String,

  firstName: String,

  lastName: String,

  playerId: { type: String, required: true, unique: true },

  number: String,

  position: String,

  height: String,

  weight: String,

  birthdate: String,

  age: String,

  teamId: String,

  teamTriCode: String,

  teamName: String
});

module.exports = PlayerSchema;
