import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar />
      <main className="flex-1 mt-14 md:mt-0 md:ml-0 gradient-bg">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;