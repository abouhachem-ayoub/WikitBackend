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
  DocumentData,
} from "firebase/firestore";
import { deleteDoc } from "firebase/firestore";
import { setDoc } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import deleteUserByEmail from "./FirebaseDeleteAccount";
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


export const deleteAccount = async (userId: string) => {
  try {
    // Fetch the user's data from the "userInfo" collection
    const userRef = doc(db, "userInfo", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error("User not found");
    }

    const userData = userSnap.data();

    // Move the user's email, ID, and deletion timestamp to the "deletedUsers" collection
    const deletedUserRef = doc(db, "deletedUsers", userId);
    await setDoc(deletedUserRef, {
      email: userData.email,
      id: userId,
      deletedAt: Timestamp.now(),
    });

    // Delete the user's document from the "userInfo" collection
    //await deleteDoc(userRef);
    //await deleteUserByEmail(userData.email)
    console.log("Account deleted successfully for userId:", userId);
    return { success: true };
  } catch (error) {
    console.error("Error deleting account:", error);
    throw new Error("Failed to delete account");
  }
};

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
export const readData = async(tosend:{email?:string,pseudo?:string,id?:string})=>{
    try{
    let q :Query<DocumentData>;    
    if(tosend.email){
         q = query(collection(db, "userInfo"), where("email", "==", tosend.email));
    }
    else if(tosend.pseudo){
      q = query(collection(db, "userInfo"), where("pseudo", "==", tosend.pseudo));
    }
    else if (tosend.id) {
      const docRef = doc(db, "userInfo", tosend.id); // Reference the document by its ID
      const docSnap = await getDoc(docRef); // Fetch the document
      if (docSnap.exists()) {
        return [{ ...docSnap.data(), id: docSnap.id }]; // Return the document data with its ID
      } else {
        console.log("No such document!");
        return []; // Return an empty array if the document doesn't exist
      }
    }
  else{ 
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


export const deleteUserFromDeletedUsers = async (email: string): Promise<void> => {
  try {
    // Query the `deletedUsers` collection for the document with the matching email
    const deletedUserQuery = query(collection(db, "deletedUsers"), where("email", "==", email));
    const querySnapshot = await getDocs(deletedUserQuery);

    if (!querySnapshot.empty) {
      // Get the document ID of the first matching document
      const docId = querySnapshot.docs[0].id;

      // Delete the document from the `deletedUsers` collection
      const docRef = doc(db, "deletedUsers", docId);
      await deleteDoc(docRef);

      console.log(`Deleted user with email: ${email} from deletedUsers collection.`);
    } else {
      console.log(`No user found in deletedUsers collection with email: ${email}`);
    }
  } catch (error) {
    console.error("Error deleting user from deletedUsers:", error);
    throw new Error("Failed to delete user from deletedUsers.");
  }
};

export const canRegisterOrLogin = async (email: string) => {
  try {
    // Query the "deletedUsers" collection for the user's email
    const deletedUserRef = query(collection(db, "deletedUsers"), where("email", "==", email));
    const querySnapshot = await getDocs(deletedUserRef);
    if (!querySnapshot.empty) {
      const deletedUser = querySnapshot.docs[0].data();
      const deletedAt = deletedUser.deletedAt.toDate();
      const now = new Date();

      // Check if 1 month have passed since the account was deleted
      const diffInHours = (now.getTime() - deletedAt.getTime()) / (1000 * 24 * 30 * 60 * 60);
      if (diffInHours < 24*30) {
        await deleteUserFromDeletedUsers(email); // Clean up the deleted user record
        return {
          allowed: true,
        };
      }
      else{
        // If more than 24 hours have passed, allow registration/login
        await deleteUserByEmail(email);
        return { allowed: false 
          , message: "Your account has been permenantly deleted, you have to create a new one."
        };
      }
    }

    return { allowed: true };
  } catch (error) {
    console.error("Error checking registration/login eligibility:", error);
    throw new Error("Failed to check registration/login eligibility");
  }
};
export default insertData;
