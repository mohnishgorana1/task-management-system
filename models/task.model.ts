import mongoose, { Document } from "mongoose";

export interface ITask extends Document {
  title: string;
  description?: string;
  dueDate?: Date | string;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high" | "critical";
  userId: string; // The Clerk user ID
}

const TaskSchema = new mongoose.Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, "A task title is required."],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters."],
    },
    description: {
      type: String,
    },
    dueDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
      required: true,
    },
    userId: {
      type: String,
      required: [true, "The task must be assigned to a user."],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

const Task = mongoose.models.Task || mongoose.model("Task", TaskSchema);

export default Task;
