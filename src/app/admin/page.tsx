export default function AdminPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <div className="space-x-3">
        <a className="text-blue-600 underline" href="/admin/topics/new">Create Topic</a>
        <a className="text-blue-600 underline" href="/admin/problems/new">Create Problem</a>
      </div>
      <p className="text-sm text-gray-600">Note: You must be logged in as an admin to use these endpoints.</p>
    </div>
  );
}
