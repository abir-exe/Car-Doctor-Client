import { createContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import app from "../Firebase/Firebase.config";
import axios from "axios";

export const AuthContext = createContext();
const auth = getAuth(app);

const AuthProviders = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // create user
  const createUser = (email, password) => {
    setLoading(true)
    return createUserWithEmailAndPassword(auth, email, password);
  };
  //sign in
  const signIn = (email, password) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password);
  }

  // logout
  const logOut = () => {
    setLoading(true)
    return signOut(auth)
  }

  useEffect(() => {
   const unsubscribe = onAuthStateChanged(auth, currentUser => {
    const userEmail = currentUser?.email || user?.email;
    const loggedUser = {email: userEmail};
        setUser(currentUser);
        console.log('current user', currentUser)
        setLoading(false);

        if(currentUser) {
          axios.post('http://localhost:5000/jwt', loggedUser, {
            withCredentials: true
          })
          .then(res => {
            console.log('token response'), res.data;
          })
        }
        else{
          axios.post('http://localhost:5000/logout', loggedUser, {
            withCredentials: true
          })
          .then(res => {
            console.log(res.data)
          })
        }

    });
    return () => {
        return unsubscribe();
    }
  }, []);

  const authInfo = {
    user,
    loading,
    createUser,
    signIn,
    logOut
  };
  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};

export default AuthProviders;
