import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getTasksByUser } from "@/actions/task.actions";
import TaskList from "@/components/TaskList";
import CreateTaskForm from "@/components/CreateTaskForm";

export default async function Home() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { tasks, error } = await getTasksByUser(user.id);

  return (
    <main className="mt-1 grid grid-cols-12 gap-1">
      <section className="col-span-12 lg:col-span-8 bg-gray-800 p-6 rounded-lg md:rounded-s-xl md:rounded-e-none  shadow-2xl border border-gray-800">
        <h2 className="text-2xl font-bold text-indigo-400 mb-4 border-b border-gray-700 pb-2">
          Your Assigned Tasks
        </h2>
        <p className="text-gray-400 mb-2">
          Task list will be displayed here, organized by color-coded priority.
        </p>
        <TaskList tasks={tasks} tasksListError={error} userId={user.id} />
      </section>

      <div className="col-span-12 lg:col-span-4">
        <CreateTaskForm userId={user.id} />
      </div>
    </main>
  );
}
