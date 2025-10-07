// Setup script to create superadmin user in Firebase Realtime Database
// Run this script once to set up the superadmin user

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// You need to download your service account key from Firebase Console
// Go to Project Settings > Service Accounts > Generate New Private Key
const serviceAccount = require('./path-to-your-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://my-gps-app-45f1e-default-rtdb.firebaseio.com'
});

async function setupSuperAdmin() {
  try {
    console.log('Setting up superadmin user...');
    
    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: 'superadmin@gmail.com',
      password: 'super@dmin',
      displayName: 'Super Admin'
    });

    console.log('✅ User created in Firebase Auth:', userRecord.uid);

    // Set custom claims
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: 'superadmin',
      isAdmin: true,
      isSuperAdmin: true
    });

    console.log('✅ Custom claims set');

    // Create user document in Realtime Database
    const db = admin.database();
    await db.ref(`users/${userRecord.uid}`).set({
      uid: userRecord.uid,
      email: 'superadmin@gmail.com',
      displayName: 'Super Admin',
      role: 'superadmin',
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      phoneNumber: '',
      profileImageUrl: '',
      customClaims: {
        role: 'superadmin',
        isAdmin: true,
        isSuperAdmin: true
      }
    });

    console.log('✅ User document created in Realtime Database');
    console.log('🎉 Superadmin setup complete!');
    console.log('You can now login with:');
    console.log('Email: superadmin@gmail.com');
    console.log('Password: super@dmin');

  } catch (error) {
    console.error('❌ Error setting up superadmin:', error);
  }
}

setupSuperAdmin();
