import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 mt-16 md:mt-0 md:ml-[150px] p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
