import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  updateDoc, 
  doc, 
  Query, 
  DocumentData 
} from "firebase/firestore";

type UserInfo =
  {firstName:string,lastName:string,email:string,phone:string,password:string,pseudo:string,emailVerified?:string|null}

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
    measurementId:process.env.MEASUREMENT_ID
  };
// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

const insertData = async(data:UserInfo)=>{
try {
    const docRef = await addDoc(collection(db, "userInfo"), data);
    //console.log("Document written with ID: ", docRef.id);
    return  JSON.parse(JSON.stringify(docRef));
  } catch (e) {
    console.error("Error adding document: ", e);
    return null;
  }
}
export const readData = async(tosend:{email?:string,pseudo?:string})=>{
    try{
    let q :Query<DocumentData>;    
    if(tosend.email){
         q = query(collection(db, "userInfo"), where("email", "==", tosend.email));
    }
    else if(tosend.pseudo){
      q = query(collection(db, "userInfo"), where("email", "==", tosend.pseudo));
    }
  else {
    throw new Error("Either email or pseudo must be provided.");
  }
const querySnapshot = await getDocs(q);
const sendback:Array<UserInfo & { id: string }>=[]
querySnapshot.forEach((doc) => {
    console.log(doc.id, " => ", doc.data());
    sendback.push({ ...doc.data(), id: doc.id } as UserInfo & { id: string });
  });
return JSON.parse(JSON.stringify(sendback));
}
catch(error){
  console.log(error);
    return null;
}
}

export const updateData = async (id: string, names: string[], values: (string|number|boolean|null)[]) => {
  try {
    // Ensure names and values have the same length
    if (names.length !== values.length) {
      throw new Error("Names and values lists must have the same length");
    }

    // Create an object with field names and their corresponding values
    const updateFields: Record<string, string|number|boolean|null> = {};
    names.forEach((name, index) => {
      updateFields[name] = values[index];
    });

    // Reference the document to update
    const documentRef = doc(db, "userInfo", id);

    // Update the document with the constructed object
    await updateDoc(documentRef, updateFields);

    console.log("Document updated successfully:", updateFields);
    return documentRef;
  } catch (error) {
    console.error("Error updating document:", error);
    return null;
  }
};

export const getUser = async (id: string) => {
  try {
    // Create a reference to the document in the "userInfo" collection
    const docRef = doc(db, "userInfo", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
      return docSnap.data(); // Return the document data
    } else {
      console.log("No such document!");
      return null; // Handle the case where the document doesn't exist
    }
  } catch (error) {
    console.error("Error fetching document:", error);
    return null; // Return null in case of an error
  }
};

export default insertData;
