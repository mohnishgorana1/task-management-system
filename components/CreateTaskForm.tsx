"use client";

import { createTaskAction } from "@/actions/task.actions";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const initialTaskState = {
  title: "",
  description: "",
  dueDate: "",
  priority: "medium",
};

const priorityOptions = ["low", "medium", "high", "critical"];

export default function CreateTaskForm({ userId }: { userId: string }) {
  const [newTask, setNewTask] = useState(initialTaskState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setNewTask({
      ...newTask,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await createTaskAction(newTask, userId);
      console.log("Task Created:", response);

      if (response.error) {
        setMessage(`Error: ${response.error}`);
      } else {
        setMessage("Task created successfully 🎉");
        setNewTask(initialTaskState);
        router.refresh();
      }
    } catch (error) {
      console.log(error);
      setMessage("Error creating task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (
    label: string,
    name: keyof typeof initialTaskState,
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
          name={name}
          id={name}
          rows={3}
          value={newTask[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full border border-gray-700 rounded-lg shadow-sm p-2.5 bg-gray-800 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition duration-150 resize-none"
        />
      ) : (
        <input
          type={type}
          name={name}
          id={name}
          value={newTask[name]}
          onChange={handleChange}
          placeholder={placeholder}
          required={name === "title"}
          className="w-full border border-gray-700 rounded-lg shadow-sm p-2.5 bg-gray-800 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition duration-150"
        />
      )}
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-y-4 p-6 rounded-lg md:rounded-s-none md:rounded-e-xl shadow-2xl bg-gray-800 sticky top-5 h-fit"
    >
      <h3 className="text-xl font-bold text-indigo-400 border-b border-gray-700 pb-3 mb-2">
        Create New Task
      </h3>

      {renderField("Title", "title")}
      {renderField(
        "Description",
        "description",
        "text",
        "Detailed steps...",
        true
      )}
      {renderField("Due Date", "dueDate", "date")}

      {/* Priority Dropdown */}
      <div className="flex flex-col w-full">
        <label
          htmlFor="priority"
          className="block text-sm font-semibold text-indigo-300 mb-1"
        >
          Priority
        </label>
        <select
          name="priority"
          id="priority"
          value={newTask.priority}
          onChange={handleChange}
          required
          className="w-full border border-gray-700 rounded-lg shadow-sm p-2.5 bg-gray-800 text-white appearance-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition duration-150"
        >
          {priorityOptions.map((p) => (
            <option key={p} value={p} className="bg-gray-800">
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Submission Feedback */}
      {message && (
        <div
          className={`text-sm py-2 px-3 rounded-lg ${
            message.startsWith("Error")
              ? "bg-red-900 text-red-300"
              : "bg-green-900 text-green-300"
          }`}
        >
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !newTask.title}
        className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 disabled:bg-gray-600 disabled:shadow-none disabled:cursor-not-allowed mt-2"
      >
        {isSubmitting ? "Creating Task..." : "Create Task"}
      </button>
    </form>
  );
}
