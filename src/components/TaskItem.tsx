import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Task } from '../types';
import './TaskItem.css';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggleComplete, onDelete }) => {
  return (
    <AnimatePresence>
      <motion.div
        key={task.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20, height: 0 }}
        transition={{ duration: 0.3 }}
        className="task-item"
      >
        <motion.div
          className={`task-content ${task.completed ? 'completed' : ''}`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <button
            className="complete-button"
            onClick={() => onToggleComplete(task.id)}
            aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
          >
            <motion.div
              className="check-icon"
              initial={false}
              animate={{ scale: task.completed ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <Check size={16} />
            </motion.div>
          </button>
          
          <span className="task-text">{task.text}</span>
          
          <button
            className="delete-button"
            onClick={() => onDelete(task.id)}
            aria-label="Delete task"
          >
            <X size={16} />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TaskItem; 