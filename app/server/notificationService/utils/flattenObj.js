const transformFlightObject = (input) => {
    const { found_flight, reason, selected_flight, timestamp } = input;
  
    const transformedObject = {
      ...found_flight,
      ...selected_flight,
      timestamp,
      reason: reason.reason, 
      recipient: found_flight.email, 
    };

    delete transformedObject._id
  
    delete transformedObject.email;
  
    transformedObject.flight_id = selected_flight.flight_id;
  
    delete transformedObject.status;
  
    return transformedObject;
  };

module.exports = transformFlightObject