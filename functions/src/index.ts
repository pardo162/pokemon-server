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
          if (userRq.length > 0) {
            reference.set({
              name: userRq,
              password: passwordRq,
              rival: 0,
              pokedex: {
                1: {
                  id: 1,
                  health: 100,
                  level: 0,
                },
              },
            });
            responseFb = "1,100,0";
          }
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
      }).then(function() {
        response.send(responseFb);
      });
    });

exports.startFight = functions.region("europe-west1")
    .https.onRequest((request, response) => {
      const Request:string = request.query.text?.toString() as string;
      const RequestSplit = Request.split(",");
      const userRq = RequestSplit[0];
      const passwordRq = RequestSplit[1];
      let responseFb = 0;
      const reference = database.ref("users/" + userRq + "/");
      reference.once("value").then(function(snapshot) {
        if (snapshot.child("password").val() == passwordRq) {
          if (parseInt(snapshot.child("rival").val()) == 0) {
            responseFb = Math.floor(Math.random() * 40) + 1;
            reference.child("rival").set(responseFb);
          } else {
            responseFb = parseInt(snapshot.child("rival").val());
          }
        }
      }).then(function() {
        response.send(responseFb.toString());
      });
    });

exports.endFight = functions.region("europe-west1")
    .https.onRequest((request, response) => {
      const Request:string = request.query.text?.toString() as string;
      const RequestSplit = Request.split(",");
      const userRq = RequestSplit[0];
      const passwordRq = RequestSplit[1];
      const pokeon = RequestSplit[2];
      const health = parseInt(RequestSplit[3]);
      let rival = 0;
      let responseFb = "lost";
      let level = 0;
      const reference = database.ref("users/" + userRq + "/");
      reference.once("value").then(function(snapshot) {
        rival = parseInt(snapshot.child("rival").val());
        const savedLevel = snapshot.child("pokedex")
            .child(rival.toString()).child("level").val();
        if (savedLevel != null) {
          level = parseInt(savedLevel);
        }
        if (snapshot.child("password").val() == passwordRq &&
          rival > 0 && rival < 41) {
          if (health > 0) {
            reference.child("pokedex").child(rival.toString()).set({
              id: rival,
              health: 100,
              level: level,
            });
            responseFb = "win";
          }
          reference.child("pokedex").child(pokeon).child("health").set(health);
          reference.child("rival").set(0);
        }
      }).then(function() {
        response.send(responseFb.toString());
      });
    });

exports.feedPokemon = functions.region("europe-west1")
    .https.onRequest((request, response) => {
      const Request:string = request.query.text?.toString() as string;
      const RequestSplit = Request.split(",");
      const userRq = RequestSplit[0];
      const passwordRq = RequestSplit[1];
      const pokeon = RequestSplit[2];
      let health = 0;
      let level = 0;
      let responseFb = "";
      const reference = database.ref("users/" + userRq + "/");
      reference.once("value").then(function(snapshot) {
        if (snapshot.child("password").val() == passwordRq) {
          health = parseInt(snapshot.child("pokedex")
              .child(pokeon).child("health").val());
          level = parseInt(snapshot.child("pokedex")
              .child(pokeon).child("level").val());
          if (health < 100) {
            health += 20;
            if (health > 100) {
              health = 100;
            }
            level += 25;
            if (level> 500) {
              level = 500;
            }
            reference.child("pokedex").child(pokeon)
                .child("health").set(health);
            reference.child("pokedex").child(pokeon)
                .child("level").set(level);
            responseFb = pokeon + "," + health + "," + level;
          }
        }
      }).then(function() {
        response.send(responseFb);
      });
    });
