import mongoose from 'mongoose';

const TeamsSchema = new mongoose.Schema({
  id: Number,

  isNBAFranchise: Boolean,

  city: String,

  teamId: { type: String, required: true, unique: true },

  teamName: String,

  teamShortName: String,

  teamTriCode: String,

  confName: String,

  divName: String
});

TeamsSchema.statics.findOneByTeamId = function(teamId) {
  return new Promise((resolve, reject) => {
    this.findOne({ teamId }, (error, result) => {
      if (error) {
        return reject(error);
      }
      resolve(result);
    })
      .select('-__v')
      .select('-_id');
  });
};

const Teams = mongoose.model('Teams', TeamsSchema, 'Teams');
export default Teams;
