import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock as ClockIcon } from 'lucide-react';
import './Clock.css';

interface ClockProps {
  timezone: string;
}

const Clock: React.FC<ClockProps> = ({ timezone }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
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
      // Convert local time to IST (UTC + 5:30)
      const localTime = new Date();
      const utcTime = localTime.getTime() + (localTime.getTimezoneOffset() * 60000);
      const istTime = new Date(utcTime + (5.5 * 60 * 60 * 1000));
      console.log('🕐 Local time:', localTime.toLocaleString());
      console.log('🌍 IST time:', istTime.toLocaleString());
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