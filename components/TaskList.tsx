"use client";

import {
  deleteTaskAction,
  toggleTaskStatusAction,
} from "../actions/task.actions";
import { formatDate } from "../lib/helpers";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

interface ITask {
  _id: string; // MongoDB ID
  title: string;
  description?: string;
  dueDate?: string; // Expecting ISO date string from the server
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high" | "critical";
  userId: string;
}
interface ConfirmationModalProps {
  taskTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}
interface TaskListProps {
  paginatedTasks: ITask[]; // Tasks for the current page
  totalTasksInTab: number; // Total count of tasks for the active tab
  tasksListError: any;
  userId: string;
  currentPage: number;
  onPageChange: (page: number) => void;
}
interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// --- CONSTANTS ---
const PRIORITY_STYLES: Record<
  ITask["priority"],
  { chip: string; ring: string }
> = {
  critical: { chip: "bg-red-700 text-red-100", ring: "ring-red-500" },
  high: { chip: "bg-orange-600 text-orange-100", ring: "ring-orange-500" },
  medium: { chip: "bg-yellow-500 text-yellow-900", ring: "ring-yellow-500" },
  low: { chip: "bg-green-600 text-green-100", ring: "ring-green-500" },
};
const TASKS_PER_PAGE = 5; // Define how many tasks to show per page

const TruncatedDescription: React.FC<{ description: string }> = ({
  description,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const MAX_LENGTH = 120;

  if (!description) return null;

  if (description.length <= MAX_LENGTH) {
    return <p className="text-gray-400 text-sm mt-1">{description}</p>;
  }

  const displayedText = isExpanded
    ? description
    : description.substring(0, MAX_LENGTH) + "...";

  return (
    <p className="text-gray-400 text-sm mt-1">
      {displayedText}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="cursor-pointer ml-2 text-indigo-400 hover:text-indigo-300 font-semibold text-xs"
      >
        {isExpanded ? "Show less" : "Show more"}
      </button>
    </p>
  );
};

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  taskTitle,
  onConfirm,
  onCancel,
  isLoading,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-2xl border border-red-700/50 w-full max-w-sm mx-4">
        <h3 className="text-xl font-bold text-red-400 mb-2">
          Confirm Deletion
        </h3>
        <p className="text-gray-300 mb-6">
          Are you absolutely sure you want to permanently delete the task:
          <span className="font-semibold text-white block mt-1">
            {`"${taskTitle}"`}
          </span>
          ? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="cursor-pointer px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="cursor-pointer px-4 py-2 bg-red-700 text-white font-semibold rounded-md hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center min-w-[100px]"
          >
            {isLoading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-center items-center space-x-2 mt-6 p-4 border-t border-gray-700">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="cursor-pointer px-4 py-2 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        Previous
      </button>

      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`cursor-pointer h-10 w-10 text-sm font-semibold rounded-lg transition-colors ${
            page === currentPage
              ? "bg-indigo-500 text-white shadow-lg"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="cursor-pointer px-4 py-2 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        Next
      </button>
    </div>
  );
};

function TaskListInner({
  paginatedTasks,
  totalTasksInTab,
  tasksListError,
  userId,
  currentPage,
  onPageChange,
}: TaskListProps) {
  const [localError, setLocalError] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const totalPages = Math.ceil(totalTasksInTab / TASKS_PER_PAGE);

  const currentTask =
    paginatedTasks && paginatedTasks.find((t) => t._id === taskToDelete?.id);
  const taskTitle = currentTask
    ? currentTask.title
    : taskToDelete?.title || "Unknown Task";

  const handleToggleStatus = async (
    taskId: string,
    newStatus: "pending" | "in-progress" | "completed"
  ) => {
    setLocalError(null);
    // Use the correct action function
    const result = await toggleTaskStatusAction(taskId, userId, newStatus);
    if (result.error) {
      console.error("Status Toggle Error:", result.error);
      setLocalError(result.error);
    }
  };

  const openConfirmationModal = (taskId: string, taskTitle: string) => {
    setTaskToDelete({ id: taskId, title: taskTitle });
  };

  const executeDeleteTask = async () => {
    if (!taskToDelete) return;

    setLocalError(null);
    setIsDeleting(true);

    try {
      const result = await deleteTaskAction(taskToDelete.id, userId);

      if (result.error) {
        console.error("Deletion Error:", result.error);
        setLocalError(result.error);
      }
    } catch (error) {
      console.error("Deletion Error:", error);
      setLocalError("An unexpected error occurred during deletion.");
    } finally {
      setIsDeleting(false);
      setTaskToDelete(null); // Close the modal
    }
  };

  if (tasksListError) {
    return (
      <p className="text-lg text-red-500 p-4 bg-red-900/20 rounded-lg border border-red-800">
        Error loading tasks: {tasksListError}
      </p>
    );
  }

  if (!paginatedTasks || paginatedTasks.length === 0) {
    return (
      <div className="p-8 text-center border border-indigo-700/50 rounded-xl bg-gray-800/50">
        <p className="text-xl font-medium text-indigo-300">
          No tasks found in this category! 📝
        </p>
        <p className="text-gray-400 mt-2">
          Create a new task or check the other tabs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {localError && (
        <div className="text-sm py-2 px-3 rounded-lg bg-red-900 text-red-300 mb-4">
          {localError}
        </div>
      )}
      {taskToDelete && (
        <ConfirmationModal
          taskTitle={taskTitle}
          onConfirm={executeDeleteTask}
          onCancel={() => setTaskToDelete(null)}
          isLoading={isDeleting}
        />
      )}

      <ul className="space-y-4">
        {/* Use paginatedTasks for mapping */}
        {paginatedTasks.map((task) => {
          const isCompleted = task.status === "completed";
          const priorityStyle =
            PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium;

          return (
            <li
              key={task._id}
              className={`p-4 rounded-xl shadow-lg transition duration-200 flex flex-col sm:flex-row justify-between items-start md:items-center gap-3 ${
                isCompleted
                  ? "bg-gray-700 border border-gray-600 opacity-60 hover:opacity-100"
                  : "bg-gray-800 border border-indigo-700/50 hover:border-indigo-500/80"
              }`}
            >
              {/* Task Info */}
              <div className="flex-1 min-w-0 pr-4 w-full">
                <div className="flex items-center gap-3 mb-1">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      isCompleted ? "bg-green-500" : "bg-indigo-500"
                    } flex-shrink-0`}
                    title={task.status.toUpperCase()}
                  />
                  <span
                    className={`font-bold text-lg truncate ${
                      isCompleted ? "text-gray-400 line-through" : "text-white"
                    }`}
                    title={task.title}
                  >
                    {task.title}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${priorityStyle.chip} flex-shrink-0`}
                  >
                    {task.priority}
                  </span>
                </div>
                {task.description && (
                  <TruncatedDescription description={task.description} />
                )}
                <p
                  className={`text-sm mt-2 flex items-center gap-1 ${
                    isCompleted ? "text-gray-500" : "text-indigo-300"
                  }`}
                >
                  Due: {formatDate(task.dueDate)}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col items-end gap-2 flex-shrink-0 min-w-[120px] w-full md:w-auto mt-2 md:mt-0">
                {task.status === "pending" && (
                  <button
                    onClick={() => handleToggleStatus(task._id, "in-progress")}
                    disabled={!!taskToDelete}
                    className="cursor-pointer w-full text-center bg-green-600 hover:bg-green-500 text-white font-medium py-1.5 px-3 rounded-md text-sm transition duration-150"
                  >
                    Start Task
                  </button>
                )}

                {task.status === "in-progress" && (
                  <div className="flex flex-col gap-2 w-full">
                    <button
                      onClick={() => handleToggleStatus(task._id, "completed")}
                      disabled={!!taskToDelete}
                      className="cursor-pointer w-full text-center bg-blue-600 hover:bg-blue-500 text-white font-medium py-1.5 px-3 rounded-md text-sm transition duration-150"
                    >
                      Mark Completed
                    </button>
                    <button
                      onClick={() => handleToggleStatus(task._id, "pending")}
                      disabled={!!taskToDelete}
                      className="cursor-pointer w-full text-center bg-yellow-600 hover:bg-yellow-500 text-white font-medium py-1.5 px-3 rounded-md text-sm transition duration-150"
                    >
                      Move to Pending
                    </button>
                  </div>
                )}

                {task.status === "completed" && (
                  <button
                    onClick={() => handleToggleStatus(task._id, "pending")}
                    disabled={!!taskToDelete}
                    className="cursor-pointer w-full text-center bg-purple-600 hover:bg-purple-500 text-white font-medium py-1.5 px-3 rounded-md text-sm transition duration-150"
                  >
                    Move to Pending
                  </button>
                )}

                {/* Edit / Delete Buttons */}
                <div className="grid grid-cols-2 gap-2 w-full mt-1">
                  <Link href={`/task/${task._id}`} className="">
                    <button className="cursor-pointer w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-1.5 px-2 rounded-md text-sm transition duration-150">
                      Edit
                    </button>
                  </Link>
                  <button
                    onClick={() => openConfirmationModal(task._id, task.title)}
                    className="cursor-pointer flex-1 bg-red-700 hover:bg-red-600 text-white font-medium py-1.5 px-2 rounded-md text-sm transition duration-150"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Pagination Controls at the bottom of the list */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}

export default function TaskTabs({
  tasks,
  userId,
  tasksListError,
}: {
  tasks: ITask[];
  userId: string;
  tasksListError: any;
}) {
  const [activeTab, setActiveTab] = useState<ITask["status"]>("pending");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const tabs: { label: string; value: ITask["status"] }[] = [
    { label: "Pending", value: "pending" },
    { label: "In Progress", value: "in-progress" },
    { label: "Completed", value: "completed" },
  ];

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => t.status === activeTab);
  }, [tasks, activeTab]);

  const totalTasksInTab = filteredTasks.length;
  const totalPages = Math.ceil(totalTasksInTab / TASKS_PER_PAGE);

  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * TASKS_PER_PAGE;
    const endIndex = startIndex + TASKS_PER_PAGE;
    return filteredTasks.slice(startIndex, endIndex);
  }, [filteredTasks, currentPage]);

  const handleTabChange = (tab: ITask["status"]) => {
    setActiveTab(tab);
    // Reset page to 1 when changing tabs
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    // Ensure page is within bounds (1 to totalPages)
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Optional: Scroll to the top of the task list when changing pages
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Auto-correct page number if the current page becomes invalid due to task deletion
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  return (
    <div className="w-full">
      {/* Tabs Header */}
      <div className="flex border-b border-gray-600 mb-6 sticky top-0 bg-gray-800 z-10">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`cursor-pointer flex-1 py-2 text-center font-medium transition-colors ${
              activeTab === tab.value
                ? "border-b-2 border-indigo-500 text-indigo-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {tab.label} ({tasks.filter((t) => t.status === tab.value).length})
          </button>
        ))}
      </div>

      {/* Task List filtered by active tab */}
      <TaskListInner
        paginatedTasks={paginatedTasks}
        totalTasksInTab={totalTasksInTab}
        tasksListError={tasksListError}
        userId={userId}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
