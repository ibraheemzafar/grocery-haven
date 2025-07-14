import admin from "firebase-admin";
import { getStorage } from "firebase-admin/storage";
import { v4 as uuidv4 } from "uuid";
import * as serviceAccount from "../firebase-service-account.json"; // downloaded from Firebase console

admin.initializeApp({
  credential:  admin.credential.cert(serviceAccount as admin.ServiceAccount),
  storageBucket: "grocerynotebook.appspot.com", // ✅ Change this
});

const bucket = getStorage().bucket();
export { bucket };

// const firebaseConfig = {
//     apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
//     authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
//     projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
//     storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
//     messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
//     appId: process.env.REACT_APP_FIREBASE_APP_ID,
//   };

// const app = initializeApp(firebaseConfig);
// export const storage = getStorage(app);