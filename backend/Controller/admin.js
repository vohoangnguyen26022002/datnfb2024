const admin = require("firebase-admin");
const db = admin.firestore();



const adminController = {
    // GET ALL USERS (Admin Only)
    getAllUsers: async (req, res) => {
      try {
        const userId = req.user.uid; 
  
        const userDoc = await db.collection("users").doc(userId).get();
        
        if (!userDoc.exists) {
          return res.status(404).json({ error: "User not found" });
        }
        
        const userData = userDoc.data();
        if (!userData.admin) {
          return res.status(403).json({ error: "Access denied" });
        }
  
        // Fetch all users if admin
        const usersSnapshot = await db.collection("users").get();
        const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        res.status(200).json(users);
      } catch (error) {
        console.error("Error fetching all users:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    },

};

  module.exports = adminController;