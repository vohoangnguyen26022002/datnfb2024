// auth.js
const admin = require("firebase-admin");
const serviceAcount = require("../config/serviceAcount.json");
const firebaseclient = require("../config/firebaseclient.json");
const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");
const { initializeApp } = require("firebase/app");


admin.initializeApp({
  credential: admin.credential.cert(serviceAcount),
  databaseURL: "https://datn2024-nt-default-rtdb.asia-southeast1.firebasedatabase.app/"
});
const firebaseDb = admin.database();
const db = admin.firestore();
const firebaseApp = initializeApp(firebaseclient);

const auth = getAuth(firebaseApp);




// Hàm đăng ký
const signup = async (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
    userName: req.body.username
  };

  try {
    const userResponse = await admin.auth().createUser({
      email: user.email,
      password: user.password,
      emailVerified: false,
      disabled: false
    });

    // Lưu vào Firestore
    await db.collection('users').doc(userResponse.uid).set({
      email: user.email,
      userName: user.userName,
      admin: false,
      can_open: false,
      createdAt: new Date().toISOString()
    });

    res.json(userResponse);
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(400).json({ error: error.message });
  }
};

// Hàm đăng nhập
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Đăng nhập người dùng bằng Firebase client
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userRecord = userCredential.user;

      // Lấy ID Token
    const idToken = await userRecord.getIdToken();
    
    // Lấy thông tin người dùng từ Firestore
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userDoc.data();

  
    

    // Gửi phản hồi với thông tin người dùng và quyền
    res.json({
      message: "Login successful",
      uid: userRecord.uid,
      email: userData.email,
      userName: userData.userName,
      admin: userData.admin, 
      can_open: userData.can_open,
      idToken: idToken
    });

  } catch (error) {
    console.error("Error during login:", error);
    res.status(400).json({ error: error.message });
  }
};

// Hàm đăng xuất
const logout = async (req, res) => {
  try {
    const auth = getAuth();
    await signOut(auth);
    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(400).json({ error: error.message });
  }
};

// Hàm thay đổi mật khẩu
const changePassword = async (req, res) => {
  const { newPassword } = req.body;
  const uid = req.user.uid;

  try {
    await admin.auth().updateUser(uid, {
      password: newPassword
    });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error during password change:", error);
    res.status(400).json({ error: error.message });
  }
};

// Hàm ghi lại lịch sử mở khóa
const logUnlockHistory = async (req, res) => {
  const uid = req.user?.uid; // Lấy UID của người dùng từ yêu cầu
  const timestamp = new Date().toISOString(); // Lấy thời gian hiện tại (thời gian mở khóa)

  if (!uid) {
    return res.status(403).json({ error: "User not authenticated" });
  }

  try {
    // Tạo một bản ghi lịch sử mở khóa
    await db.collection('History').add({
      uid: uid,                   // UID của người mở khóa
      timestamp: timestamp,       // Thời gian mở khóa
      action: 'Unlocked',         // Hoạt động mở khóa
    });

    res.status(200).json({ message: "Unlock history logged successfully!" });
  } catch (error) {
    console.error("Error logging unlock history:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

 // GET KHOA STATUS
const getKhoaStatus = async (req, res) => {
  try {
    const ref = firebaseDb.ref('khoa');
    const snapshot = await ref.once('value');
    const value = snapshot.val();
    
    res.status(200).json({ khoa: value });
  } catch (error) {
    console.error("Error fetching khoa status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// UPDATE KHOA STATUS
const updateKhoaStatus = async (req, res) => {
  try {
    const { value } = req.body;
    const uid = req.user?.uid; 


    if (!uid) {
      return res.status(403).json({ error: "User not authenticated" });
    }

    const ref = firebaseDb.ref('khoa');
    await ref.set(value);

    await logUnlockHistory(req, res);

    res.status(200).json({ message: 'Khoa status updated successfully!',
     });
  } catch (error) {
    console.error("Error updating khoa status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



module.exports = { signup, login, logout, changePassword, getKhoaStatus, updateKhoaStatus, logUnlockHistory  };

