import * as functions from "firebase-functions";

// // Start writing Firebase Functions
// // prueba
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.region("europe-west1")
    .https.onRequest((request, response) => {
      response.send("Hello from Pokegotchi");
    });
