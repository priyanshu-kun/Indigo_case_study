import axios from "axios";
import { useEffect, useContext, useState, useMemo } from "react";

const useGetAllFlights = () => {
  const [flightData, setFlightData] = useState([]);
  const [isFlightLoading, setIsFlightLoading] = useState(true);

  const getAllFlights = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/flights`
      );
      setFlightData(response.data);
      setIsFlightLoading(false);
    } catch (error) {
      console.log(error, "error");
      setIsFlightLoading(false);
    }
  };

  useEffect(() => {
      getAllFlights();
  }, []);

  const memoizedFlightData = useMemo(() => flightData, [flightData]);

  return {
    flightData: memoizedFlightData,
    isFlightLoading,
  };
};

export default useGetAllFlights;
