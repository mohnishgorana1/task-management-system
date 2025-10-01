"use client";

import { useRouter } from "next/navigation";
import React, { useState, useTransition } from "react";

const statusOptions = ["pending", "in-progress", "completed"];
const priorityOptions = ["low", "medium", "high", "critical"];

export default function TaskEditForm({
  initialTask,
  updateTaskAction,
  userId,
}: {
  initialTask: any;
  updateTaskAction: (
    taskId: string, 
    updatedData: any, 
    userId: string
  ) => Promise<any>;
  userId: string;
}) {
  const [taskData, setTaskData] = useState({
    title: initialTask.title || "",
    description: initialTask.description || "",
    dueDate: initialTask.dueDate
      ? new Date(initialTask.dueDate).toISOString().substring(0, 10) // ensures YYYY-MM-DD
      : "",
    status: initialTask.status || "pending",
    priority: initialTask.priority || "medium",
  });
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    startTransition(async () => {
      if (!taskData.title || !taskData.dueDate) {
        setError("Title and Due Date are required.");
        return;
      }

      const dataToSend = {
        ...taskData,
        dueDate: new Date(taskData.dueDate).toISOString(),
      };

      const result = await updateTaskAction(initialTask._id, dataToSend, userId);

      if (result?.error) {
        setError(result.error);
      } else {
        setSuccessMessage("Task updated successfully!");
        router.refresh();
      }
    });
  };

  const renderField = (
    label: string,
    name: keyof typeof taskData,
    type: string = "text",
    placeholder: string = `Enter ${label}`,
    isTextArea: boolean = false
  ) => (
    <div className="flex flex-col w-full">
      <label
        htmlFor={name}
        className="block text-sm font-semibold text-indigo-300 mb-1"
      >
        {label}
      </label>
      {isTextArea ? (
        <textarea
          id={name}
          name={name}
          rows={3}
          value={taskData[name] || ""}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={isPending}
          className="w-full border border-gray-700 rounded-lg shadow-sm p-2.5 bg-gray-800 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition duration-150 resize-none"
        />
      ) : (
        <input
          id={name}
          type={type}
          name={name}
          value={taskData[name] || ""}
          onChange={handleChange}
          placeholder={placeholder}
          required={name === "title" || name === "dueDate"}
          disabled={isPending}
          className="w-full border border-gray-700 rounded-lg shadow-sm p-2.5 bg-gray-800 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition duration-150"
        />
      )}
    </div>
  );

  return (
    <div className="bg-gray-800 p-6 rounded-lg md:rounded-s-none md:rounded-e-xl shadow-2xl h-full ">
      <h2 className="text-2xl font-bold text-indigo-400 mb-4 border-b border-gray-700 pb-3">
        Edit Task
      </h2>

      {error && (
        <div className="p-3 mb-4 rounded-lg bg-red-900 text-red-300 border border-red-700 text-sm">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="p-3 mb-4 rounded-lg bg-green-900 text-green-300 border border-green-700 text-sm">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {renderField("Title", "title")}
        {renderField("Description", "description", "text", "Detailed steps...", true)}
        {renderField("Due Date", "dueDate", "date")}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Status */}
          <div className="flex flex-col w-full">
            <label htmlFor="status" className="block text-sm font-semibold text-indigo-300 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={taskData.status}
              onChange={handleChange}
              disabled={isPending}
              className="w-full border border-gray-700 rounded-lg shadow-sm p-2.5 bg-gray-800 text-white"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ")}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="flex flex-col w-full">
            <label htmlFor="priority" className="block text-sm font-semibold text-indigo-300 mb-1">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={taskData.priority}
              onChange={handleChange}
              disabled={isPending}
              className="w-full border border-gray-700 rounded-lg shadow-sm p-2.5 bg-gray-800 text-white"
            >
              {priorityOptions.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="bg-indigo-600 hover:bg-indigo-700 cursor-pointer text-white font-semibold py-3 px-4 rounded-xl transition duration-200 disabled:bg-gray-600 mt-4 flex items-center justify-center"
        >
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
