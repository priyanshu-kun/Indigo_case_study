import { useState, useEffect } from 'react';
import axios from 'axios';

const useSubscribeFlight = ({ email = "", flight_id = "", allowUpdation=true, seconds = 5 }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

    const subscribe = async () => {
      setLoading(true);
      try {
        await axios.post('http://localhost:8080/subscribe_to_flight', {
            flight_id: flight_id,
            email: email,
            method: "Email"
        });
        const response = await axios.get('http://localhost:8080/update_flight_status', {
          params: {
            _enableUpdation: allowUpdation,
            _delta_time: `${seconds}s`
          }
        });
        setData(response.data);
      } catch (err) {
        console.log(err)
      } finally {
        setLoading(false);
      }
    };

  return { subscribe, loading, data };
};

export default useSubscribeFlight;
