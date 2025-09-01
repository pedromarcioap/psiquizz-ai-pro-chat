import { useState, useEffect } from 'react';
import { account } from '../services/appwriteClient'; // Updated import

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await account.get(); // Get current user from Appwrite
        // Appwrite user object has $id for user ID
        setUser({ ...currentUser, uid: currentUser.$id }); // Map $id to uid for consistency
      } catch (error) {
        // User is not logged in or session expired
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Appwrite doesn't have a direct onAuthStateChange listener like Supabase.
    // For real-time updates, you'd typically subscribe to Appwrite's real-time service
    // or re-fetch the user periodically/on relevant events.
    // For simplicity, we'll just fetch on mount.
    // If you need real-time auth updates, you'd use appwriteClient.subscribe() here.

    // No unsubscribe needed for this simple fetch-on-mount approach.
    // If using real-time subscriptions, you'd return a cleanup function.
  }, []);

  return { user, loading };
};