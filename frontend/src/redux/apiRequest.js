import axios from "axios";
import { getAuth, signInWithEmailAndPassword, signOut  } from "firebase/auth";
import { changePasswordFailed, changePasswordStart, changePasswordSuccess, loginFailed, loginStart, loginSuccess, logOutFailed, logOutStart, logOutSuccess, PostUnlockHistoryFailed, PostUnlockHistoryStart, PostUnlockHistorySuccess, registerFailed, registerStart, registerSuccess } from "./authSlice";
import { deleteUserStart, deleteUserSuccess, deteleUserFailed, getPassHistoryFailed, getPassHistoryStart, getPassHistorySuccess, getUsersFailed, getUserStart, getUserSuccess, UpdateUserFailed, UpdateUserStart, UpdateUserSuccess } from "./userSlice";
import { firebaseApp, realtimeDb } from "./firebaseapp";
import { db } from "./firebaseapp";
import { doc, getDoc } from "firebase/firestore";
import { ref, set, get } from "firebase/database";
// import { createAxios } from "../createInstance";


export const loginUser = async (user, dispatch, navigate) => {
    // console.log("User object:", user); // In ra đối tượng user
    dispatch(loginStart());
    const auth = getAuth(firebaseApp);
    try {
        const userCredential = await signInWithEmailAndPassword(auth, user.email.trim(), user.password.trim());
        const userInfo = userCredential.user;

        const token = await userCredential.user.getIdToken();
           // Use the doc and getDoc functions to get user data from Firestore
           const userDocRef = doc(db, "users", userInfo.uid); // Create a reference to the user document
           const userDoc = await getDoc(userDocRef); // Get the document

        if (!userDoc.exists) {
            console.error("User not found in Firestore");
            dispatch(loginFailed());
            return;
        }

        const userData = userDoc.data();
        dispatch(loginSuccess({
            uid: userInfo.uid,
            email: userData.email,
            userName: userData.userName,
            admin: userData.admin,  // Lưu trường admin
            can_open: userData.can_open, // Lưu trường can_open
            token,
        }));
        navigate("/");
    } catch (error) {
        console.error("Error signing in:", error);
        dispatch(loginFailed());
    }
};

export const registerUser = async (user, dispatch, navigate) => {
    dispatch(registerStart());
    try {
        await axios.post("/auth/signup", user);
        
        dispatch(registerSuccess());
        navigate("/login"); 
    } catch (error) {
        console.error("Error registering user:", error); 
        dispatch(registerFailed());
    }
};

export const fetchAllUsers = async (dispatch, token) => {
    dispatch(getUserStart());
    try {
        const response = await axios.get("/users/allusers", {
            headers: { Authorization: `Bearer ${token}` },
        });
        
        dispatch(getUserSuccess(response.data)); 
    } catch (error) {
        console.error("Error fetching all users:", error.message);
        dispatch(getUsersFailed(error.message)); 
    }
};


export const logOut = async (dispatch, navigate) => {
    dispatch(logOutStart());
    try {
        const auth = getAuth(); 
        await signOut(auth); 

        dispatch(logOutSuccess()); 
        navigate("/login"); 
    } catch (error) {
        console.error("Logout error:", error);
        dispatch(logOutFailed()); 
    }
};


export const changePassword = async (newPassword, dispatch) => {
    dispatch(changePasswordStart());
    
    try {
        // Send request to backend to change password
        const response = await axios.post(
            "/auth/changepassword",
            { newPassword },
            {
                headers: {
                    Authorization: `Bearer ${getAuth().currentUser?.accessToken}` // Get the user's access token
                }
            }
        );

        dispatch(changePasswordSuccess(response.data));
        alert("Password changed successfully!");
    } catch (error) {
        console.error("Error changing password:", error);
        dispatch(changePasswordFailed());
        alert("Failed to change password.");
    }
};



export const getPassWordHistory = async (accessToken, dispatch) => {
    dispatch(getPassHistoryStart());
    try {
        const res = await axios.get("/v1/user/passwordhistory", {
            headers: { token: `Bearer ${accessToken}` },
        });
        console.log(res.data);
        dispatch(getPassHistorySuccess(res.data)); 
    } catch (error) {
        dispatch(getPassHistoryFailed());
        throw new Error("Failed to fetch password history.");
    }
};

// Function to fetch the status of Khoa
export const getKhoa = async (dispatch) => {
    try {
        const refKhoa = ref(realtimeDb, 'khoa');
        const snapshot = await get(refKhoa);
        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            console.log("No data available");
            return null;
        }
    } catch (error) {
        console.error("Error fetching khoa status:", error);
    }
};

// Hàm cập nhật trạng thái Khoa
export const updateKhoa = async (newValue, dispatch) => {
    try {
        const refKhoa = ref(realtimeDb, 'khoa'); 
        await set(refKhoa, newValue);
        console.log("Khoa status updated successfully!");
    } catch (error) {
        console.error("Error updating khoa status:", error);
    }
};

export const PostUnlockHistory = async ( token, dispatch, unlockTime, email) => {
    dispatch(PostUnlockHistoryStart());

    try {
        const res = await axios.post("/auth/khoahistory", { email, unlockTime }, {
            headers: { Authorization: `Bearer ${token}` },
        });
        dispatch(PostUnlockHistorySuccess(res.data));
    } catch (error) {
        dispatch(PostUnlockHistoryFailed());
        throw new Error("Failed to log unlock history.");
    }
};
