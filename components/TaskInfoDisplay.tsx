"use client";

import React from "react";

const PRIORITY_STYLES: any = {
  critical: { chip: "bg-red-700 text-red-100", ring: "ring-red-500" },
  high: { chip: "bg-orange-600 text-orange-100", ring: "ring-orange-500" },
  medium: { chip: "bg-yellow-500 text-yellow-900", ring: "ring-yellow-500" },
  low: { chip: "bg-green-600 text-green-100", ring: "ring-green-500" },
};

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "Invalid Date";
  }
};

export default function TaskInfoDisplay({ task }: { task: any }) {
  const priorityStyle: any =
    PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium;
  const isCompleted = task.status === "completed";

  return (
    <div className="bg-gray-800 p-6 rounded-lg md:rounded-e-none md:rounded-s-xl shadow-2xl h-full">
      <h2 className="text-2xl font-bold text-indigo-400 mb-4 border-b border-gray-700 pb-3">
        Task Details
      </h2>

      <div className="space-y-5">
        <div>
          <p className="text-sm font-semibold uppercase text-indigo-300">
            Title
          </p>
          <p
            className={`text-xl font-bold mt-1 ${
              isCompleted ? "line-through text-gray-400" : "text-white"
            }`}
          >
            {task.title}
          </p>
        </div>

        {/* Priority and Status */}
        <div className="flex flex-wrap gap-4">
          <div>
            <p className="text-sm font-semibold uppercase text-indigo-300">
              Priority
            </p>
            <span
              className={`text-xs font-semibold px-3 py-0.5 rounded-full uppercase tracking-wider mt-1 inline-block ${priorityStyle.chip}`}
            >
              {task.priority}
            </span>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase text-indigo-300">
              Status
            </p>
            <span
              className={`text-xs font-semibold px-3 py-0.5 rounded-full uppercase tracking-wider mt-1 inline-block ${
                isCompleted
                  ? "bg-green-600 text-white"
                  : "bg-yellow-500 text-gray-900"
              }`}
            >
              {task.status && task.status.replace(/-/g, " ")}
            </span>
          </div>
        </div>

        {/* Due Date */}
        <div>
          <p className="text-sm font-semibold uppercase text-indigo-300">
            Due Date
          </p>
          <p className="text-lg text-gray-300 mt-1">
            {formatDate(task.dueDate)}
          </p>
        </div>

        {/* Description */}
        <div>
          <p className="text-sm font-semibold uppercase text-indigo-300">
            Description
          </p>
          <p className="text-gray-300 whitespace-pre-wrap mt-1 text-base">
            {task.description || "No description provided."}
          </p>
        </div>
      </div>
    </div>
  );
}
