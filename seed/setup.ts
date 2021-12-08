require("dotenv").config();
export const testPassword = process.env.FIREBASE_TEST_PASSWORD;
export const testEmail = process.env.FIREBASE_TEST_USER;
export const makeCollection = (...paths) => paths.join("/");
