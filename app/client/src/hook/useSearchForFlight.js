import axios from "axios";
import { useEffect, useContext, useState, useMemo, useCallback } from "react";

const useGetAllFlights = ({ airline, flight_id }) => {
  const [flightData, setFlightData] = useState([]);
  const [isFlightLoading, setIsFlightLoading] = useState(true);

  const searchFlights = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/fetch_flight?_flight_id=${flight_id}&_flight_name=${airline}`
      );
      setFlightData(response.data);
      setIsFlightLoading(false);
    } catch (error) {
      console.log(error, "error");
      setIsFlightLoading(false);
    }
  }, [userDetails?.id, show]);

  const memoizedFlightData = useMemo(() => flightData, [flightData]);

  return {
    flightData: memoizedFlightData,
    isFlightLoading,
    searchFlights,
  };
};

export default useGetAllFlights;
