import { getDataJson } from '../hooks/useAsyncStorage';
import { useState, useEffect, useCallback } from 'react';

export const getUserData = async () => {
  try {
    const user = await getDataJson('user');
    console.log('🟢 getUserData() ->', user);
    return user?.data;
  } catch (err) {
    console.log('❌ getUserData() Error:', err);
    return null;
  }
};

export const useUserData = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await getDataJson('user');
      console.log('🟢 useUserData ->', user.data);
      setData(user.data);
    } catch (err) {
      console.log('❌ useUserData Error:', err);
      setError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return { data, loading, error, refetch: fetchUserData };
};
