"use server";
import dbConnect from "@/lib/dbConnect";
import Task, { ITask } from "@/models/task.model";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export const createTaskAction = async (newTask: any, userId: string) => {
  const { title, description, dueDate, priority } = newTask;

  if (!title || !priority) {
    return { error: "Title and Priority are required.", status: 400 };
  }

  const newTaskData: any = {
    title: title,
    description: description || undefined,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    priority: priority,
    userId: userId,
    status: "pending", // Default status
  };
  try {
    await dbConnect();

    const newTask = await Task.create(newTaskData);

    if (!newTask) {
      return { error: "Error Creating new task in Database", status: 500 };
    }

    return {
      task: JSON.parse(JSON.stringify(newTask)),
      message: "Task created successfully! 🎉",
      status: 201,
    };
  } catch (error) {
    console.error("Database Error:", error);
    // Handling Mongoose validation errors
    if (
      error instanceof Error &&
      "name" in error &&
      error.name === "ValidationError"
    ) {
      return { error: (error as any).message, status: 400 };
    }
    return { error: "Internal Server Error", status: 500 };
  }
};

export const getTasksByUser = async (userId: string) => {
  if (!userId) {
    return { error: "User ID is required.", status: 400 };
  }

  try {
    await dbConnect();

    const tasks = await Task.find({ userId }).sort({ createdAt: -1 });
    // newest first

    return {
      tasks: JSON.parse(JSON.stringify(tasks)),
      status: 200,
    };
  } catch (error) {
    console.error("Database Error (getTasksByUser):", error);
    return { error: "Internal Server Error", status: 500 };
  }
};

export const toggleTaskStatusAction = async (
  taskId: string,
  userId: string,
  newStatus: "pending" | "in-progress" | "completed"
) => {
  if (!userId) {
    return { error: "Unauthorized: User not logged in.", status: 401 };
  }

  if (!taskId) {
    return { error: "Missing Task ID", status: 401 };
  }

  try {
    await dbConnect();

    const task = await Task.findOne({
      _id: taskId,
      userId: userId,
    });

    if (!task) {
      return { error: "Task not found or unauthorized.", status: 404 };
    }


    await Task.updateOne(
      { _id: taskId },
      { $set: { status: newStatus, updatedAt: new Date() } }
    );

    revalidatePath("/");

    return {
      message: `Task marked as ${newStatus}!`,
      status: 200,
      newStatus: newStatus,
    };
  } catch (error) {
    console.error("Database Error during status toggle:", error);
    return { error: "Internal Server Error during update.", status: 500 };
  }
};

export const deleteTaskAction = async (taskId: string, userId: string) => {
  if (!userId) {
    return { error: "Unauthorized: User not logged in.", status: 401 };
  }
  if (!taskId) {
    return { error: "Task Not Find", status: 401 };
  }

  try {
    await dbConnect();

    const result = await Task.deleteOne({ _id: taskId, userId: userId });

    if (result.deletedCount === 0) {
      return {
        error: "Task not found or you are not authorized to delete this task.",
        status: 404,
      };
    }

    revalidatePath("/");

    return {
      message: "Task deleted successfully. 🗑️",
      status: 200,
    };
  } catch (error) {
    console.error("Database Error during deletion:", error);
    return { error: "Internal Server Error during deletion.", status: 500 };
  }
};

export const getTasksByIdAction = async (taskId: string, userId: string) => {
  if (!userId) {
    return { error: "User ID is required.", status: 400 };
  }
  if (!taskId) {
    return { error: "Task ID is required.", status: 400 };
  }

  try {
    await dbConnect();

    const task = await Task.findOne({ userId, _id: taskId });
    console.log("task:", task);

    if (!task) {
      return { error: "Task Not Found", status: 400 };
    }

    return {
      task,
      status: 200,
    };
  } catch (error) {
    console.error("Database Error (getTasksById):", error);
    return { error: "Internal Server Error", status: 500 };
  }
};

export const updateTaskAction = async (
  taskId: string,
  updatedData: {
    title?: string;
    description?: string;
    priority?: "low" | "medium" | "high" | "critical";
    status?: "pending" | "in-progress" | "completed";
    dueDate?: string;
  },
  userId: string
) => {
  if (!userId) {
    return { error: "User ID is required.", status: 400 };
  }
  if (!taskId) {
    return { error: "Task ID is required.", status: 400 };
  }

  try {
    await dbConnect();

    console.log("update data", updatedData);

    const task = await Task.findOneAndUpdate(
      { _id: taskId, userId },
      { $set: updatedData },
      { new: true } // return updated doc
    ).lean(); // convert to plain object

    if (!task) {
      return { error: "Task not found or unauthorized.", status: 404 };
    }

    return {
      task: JSON.parse(JSON.stringify(task)),
      status: 200,
    };
  } catch (error) {
    console.error("Database Error (updateTaskAction):", error);
    return { error: "Internal Server Error", status: 500 };
  }
};
