# NBA APP BACKEND API

## TODO:
1. Create Youtube Channel Id list
2. Refacto determinePlayer dans les videos
2. Mettre les playersId dans les videos youtube schema
3. Mettre les videoId dans le playerSchema
4. Mettre les matchStat dans le playerSchema


Delete all device when user is remove
https://www.robinwieruch.de/mongodb-express-setup-tutorial/
userSchema.pre('remove', function(next) {
  this.model('Device').deleteMany({ user: this._id }, next);
});

## Authors
* **tphilippini**
