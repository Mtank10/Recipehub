import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="flex flex-col ">
      {/* Sidebar stays visible on all pages */}
      <Sidebar />

      {/* Main content (changes based on routes) */}
      <div className="ml-[250px]">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
