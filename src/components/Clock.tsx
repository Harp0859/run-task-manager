import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock as ClockIcon } from 'lucide-react';
import './Clock.css';

interface ClockProps {
  timezone: string;
}

const Clock: React.FC<ClockProps> = ({ timezone }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Sync with internet time
  useEffect(() => {
    const syncWithInternetTime = async () => {
      try {
        // Try to get time from multiple sources
        const responses = await Promise.allSettled([
          fetch('https://worldtimeapi.org/api/ip'),
          fetch('https://api.timezonedb.com/v2.1/get-time-zone?key=demo&format=json&by=zone&zone=UTC'),
          fetch('https://httpbin.org/delay/0')
        ]);

        const validResponse = responses.find(response => 
          response.status === 'fulfilled' && 
          response.value instanceof Response && 
          response.value.ok
        );

        if (validResponse && validResponse.status === 'fulfilled') {
          const response = validResponse.value as Response;
          const data = await response.json();
          
          let internetTime: Date;
          
          if (data.datetime) {
            // WorldTimeAPI format
            internetTime = new Date(data.datetime);
          } else if (data.formatted) {
            // TimeZoneDB format
            internetTime = new Date(data.formatted);
          } else {
            // Fallback to response headers
            const dateHeader = response.headers.get('date');
            internetTime = dateHeader ? new Date(dateHeader) : new Date();
          }

          setCurrentTime(internetTime);
        }
      } catch (error) {
        console.log('Using local time as fallback');
        setCurrentTime(new Date());
      }
    };

    // Sync immediately and then every 5 minutes
    syncWithInternetTime();
    const syncInterval = setInterval(syncWithInternetTime, 5 * 60 * 1000);

    return () => clearInterval(syncInterval);
  }, []);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(prev => {
        const newTime = new Date(prev.getTime() + 1000);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = useMemo(() => {
    return (date: Date) => {
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      
      // Convert to 12-hour format
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 should be 12
      const hours12 = hours.toString().padStart(2, '0');
      
      return {
        time: `${hours12}:${minutes}:${seconds}`,
        ampm: ampm
      };
    };
  }, []);

  // Convert to IST if timezone is IST
  const displayTime = useMemo(() => {
    if (timezone === 'IST') {
      // Get current local time and convert to IST
      const localTime = new Date();
      const istTime = new Date(localTime.getTime() + (5.5 * 60 * 60 * 1000));
      return formatTime(istTime);
    }
    return formatTime(currentTime);
  }, [currentTime, timezone, formatTime]);

  const { time: timeString, ampm } = displayTime;

  return (
    <motion.div
      className="clock-container"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      <motion.div
        className="clock-icon"
        animate={{ 
          rotate: [0, 5, -5, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <ClockIcon size={18} />
      </motion.div>
      <div className="clock-time-display">
        <span className="clock-time">{timeString}</span>
        <span className="clock-ampm">{ampm}</span>
      </div>
    </motion.div>
  );
};

export default Clock; 