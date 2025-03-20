export default function SidebarWidget() {
  return (
    <div className="mx-auto mb-6 w-full max-w-60 rounded-2xl bg-gray-100 px-4 py-5 text-center dark:bg-gray-800">
      <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
        Retail Management System
      </h3>
      <p className="mb-4 text-gray-600 text-sm dark:text-gray-400">
        Manage inventory, sales, and employees with ease.
      </p>
      <a
        href="/"
        className="flex items-center justify-center p-3 font-medium text-white rounded-lg bg-blue-600 text-sm hover:bg-blue-700 transition"
      >
        Go to Dashboard
      </a>
    </div>
  );
}
