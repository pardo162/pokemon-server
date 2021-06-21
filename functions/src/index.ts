import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp(functions.config().firebase);
const database = admin.database();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//

exports.getPokedex = functions.region("europe-west1")
    .https.onRequest((request, response) => {
      const Request:string = request.query.text?.toString() as string;
      const RequestSplit = Request.split(",");
      const userRq = RequestSplit[0];
      const passwordRq = RequestSplit[1];
      let responseFb = "";
      const reference = database.ref("users/" + userRq + "/");
      reference.once("value").then(function(snapshot) {
        if (snapshot.child("name").val() == null) {
          reference.set({
            name: userRq,
            password: passwordRq,
            pokedex: {
              1: {
                id: 1,
                health: 100,
                level: 1,
              },
            },
          });
          responseFb = "1,100,1";
        } else {
          if (snapshot.child("password").val() == passwordRq) {
            snapshot.child("pokedex").forEach(function(pokedexs) {
              responseFb += pokedexs.child("id").val();
              responseFb += "," + pokedexs.child("health").val();
              responseFb += "," + pokedexs.child("level").val();
              responseFb += "/";
            });
            responseFb = responseFb.substring(0, responseFb.length - 1);
          } else {
            responseFb = "Error Password";
          }
        }
      }
      ).then(function() {
        response.send(responseFb);
      });
    });
