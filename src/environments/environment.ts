// Ovaj fajl se zamenjuje pri produkcionom build-u (vidi fileReplacements u angular.json).
//
// VAŽNO: Ovde unesi podatke SVOG Firebase projekta (Realtime Database + Authentication).
// Ne koristimo Firebase SDK biblioteke (firebase, @angular/fire) već komuniciramo
// direktno preko REST API-ja, kako je traženo u napomeni profesora.
//
// firebaseAPIKey  -> Firebase Console -> Project settings -> General -> Web API Key
// firebaseRDBUrl  -> Firebase Console -> Realtime Database -> URL baze (https://<ime>-default-rtdb.<region>.firebasedatabase.app)

export const environment = {
  production: false,
  firebaseAPIKey: 'AIzaSyBr-X6arZyYpwIZko9E84olMeHsOLIX-dY',
  firebaseRDBUrl: 'https://mobilno-projekat-41bdf-default-rtdb.europe-west1.firebasedatabase.app',
};
