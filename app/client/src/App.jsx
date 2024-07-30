import React from 'react';
import useFCM from './hook/useFCM';

const App = () => {
  const { token, notification } = useFCM();

  console.log(token, notification)

  return (
    <div>
      <h1>Firebase Cloud Messaging with React</h1>
      {token && <p>FCM Token: {token}</p>}
      {notification && (
        <div>
          <h2>Notification</h2>
          <p>{notification.title}</p>
          <p>{notification.body}</p>
        </div>
      )}
    </div>
  );
};

export default App;
