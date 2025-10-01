import { getTasksByIdAction, updateTaskAction } from "@/actions/task.actions";
import TaskEditForm from "@/components/TaskEditForm";
import TaskInfoDisplay from "@/components/TaskInfoDisplay";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function TaskDetailsPage({
  params,
}: {
  params: { taskId: string };
}) {
  const user = await currentUser();
  if (!user) {
    console.error("user id not found");
    redirect("/sign-in");
  }

  const { taskId } = params;

  const result = await getTasksByIdAction(taskId, user.id);

  if (result.error || !result.task) {
    return (
      <div className="py-20 min-h-[90vh] text-white flex justify-center items-center">
        <div className="text-center p-8 bg-gray-800 rounded-xl border border-red-700/50">
          <h1 className="text-3xl font-bold text-red-500 mb-2">
            404 - Task Not Found
          </h1>
          <p className="text-gray-400">
            The task with ID: <span className="text-white">{taskId}</span> could
            not be located,
            <br />
            or you do not have permission to view it.
          </p>
        </div>
      </div>
    );
  }

  const task = JSON.parse(JSON.stringify(result.task));

  return (
    <main className="mt-1 min-h-[90vh]">
      <div className="mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-1">
          <section className="col-span-12 lg:col-span-8">
            <TaskInfoDisplay task={task} />
          </section>

          <section className="col-span-12 lg:col-span-4 sticky top-5 h-fit">
            <TaskEditForm
              initialTask={task}
              updateTaskAction={updateTaskAction}
              userId={user.id}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
