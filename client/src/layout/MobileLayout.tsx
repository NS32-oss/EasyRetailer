import { Outlet } from "react-router";

export default function MobileLayout() {
  return (
    <div className="mx-auto max-w-[430px] h-[100dvh] bg-gray-50 flex flex-col">
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}