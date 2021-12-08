import admin from "firebase-admin";

export const connectFirebaseAdmin = ({
    projectId = process.env.FIREBASE_PROJECT_ID,
} = {}): admin.auth.Auth => {
    if (!admin.apps.length) {
        admin.initializeApp({
            projectId,
        });
    }
    return admin.auth();
};

export const removeUserByEmail = async (email: string) => {
    const auth = admin.auth();
    try {
        const firebaseUser = await auth.getUserByEmail(email);
        await auth.deleteUser(firebaseUser.uid);
    } catch (e) {
        if (e.errorInfo.code !== "auth/user-not-found") {
            throw e;
        }
    }
};

export const addUserByEmail = async (
    email: string,
    password: string,
    props = {} as admin.auth.CreateRequest
) => {
    const auth = admin.auth();
    return await auth.createUser({
        password,
        email,
        emailVerified: true,
        ...props,
    });
};
