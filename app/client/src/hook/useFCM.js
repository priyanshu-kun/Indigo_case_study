// src/hooks/useFCM.js
import { useState, useEffect } from 'react';
import { messaging, getToken, onMessage } from '../fire-base';
import axios from 'axios';

const useFCM = () => {
  const [token, setToken] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const currentToken = await getToken(messaging, { vapidKey: 'BHqxGPz-o_-GDXpwnY3rMGYrCo3pr5dW6U2Zs4TPCU2zSPIkfJrcE81129Y' });
          if (currentToken) {
            setToken(currentToken);
            await sendTokenToServer(currentToken);
          } else {
            console.log('No registration token available. Request permission to generate one.');
          }
        } else {
          console.log('Notification permission denied');
        }
      } catch (error) {
        console.error('Error getting permission or token:', error);
      }
    };

    requestPermission();

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
      setNotification(payload.notification);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const sendTokenToServer = async (token) => {
    try {
      await axios('/save-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });
      console.log('Token sent to server successfully');
    } catch (error) {
      console.error('Error sending token to server:', error);
    }
  };

  return { token, notification };
};

export default useFCM;
