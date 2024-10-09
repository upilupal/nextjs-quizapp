import React, { useEffect, useState } from "react";

interface TimerProps {
    onTimeOut: () => void;
}

const Timer: React.FC<TimerProps> = ({onTimeOut}) => {
  const [time, setTime] = useState(300); // Time in seconds

  useEffect(() => {
    let timer = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime === 0) {
          clearInterval(timer);
          onTimeOut();  // Call the callback when time runs out
          return 0;
        } else return prevTime - 1;
      });
    }, 1000);

    // Cleanup timer on component unmount
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(time / 60).toString().padStart(2, '0');
  const seconds = (time % 60).toString().padStart(2, '0');

  return (
    <div>
      <p>Time left: {minutes}:{seconds}</p>
    </div>
  );
};

export default Timer;
