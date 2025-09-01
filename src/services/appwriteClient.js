import { Client, Account, Databases } from 'appwrite';

const client = new Client();

client
    .setEndpoint(process.env.REACT_APP_APPWRITE_ENDPOINT) // Your API Endpoint
    .setProject(process.env.REACT_APP_APPWRITE_PROJECT_ID); // Your project ID

export const account = new Account(client);
export const databases = new Databases(client);
export const appwriteClient = client; // Export the client itself if needed