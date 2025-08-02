import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '../types';
import TaskItem from './TaskItem';
import './TaskList.css';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onToggleComplete, onDelete }) => {
  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  return (
    <div className="task-list-container">
      <AnimatePresence>
        {activeTasks.length === 0 && completedTasks.length === 0 ? (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="empty-state"
          >
            <div className="empty-icon">✨</div>
            <h3 className="empty-title">No tasks yet</h3>
            <p className="empty-description">
              Add your first task above to get started
            </p>
          </motion.div>
        ) : (
          <div className="tasks-sections">
            {activeTasks.length > 0 && (
              <motion.div
                key="active-tasks"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="tasks-section"
              >
                <h3 className="section-title">Active Tasks</h3>
                <div className="tasks-grid">
                  {activeTasks.map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggleComplete={onToggleComplete}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {completedTasks.length > 0 && (
              <motion.div
                key="completed-tasks"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="tasks-section"
              >
                <h3 className="section-title">Completed</h3>
                <div className="tasks-grid">
                  {completedTasks.map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggleComplete={onToggleComplete}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskList; 