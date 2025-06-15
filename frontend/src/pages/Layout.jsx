import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen gradient-bg">
      <Sidebar />
      <main className="flex-1 mt-16 md:mt-0 md:ml-0">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;