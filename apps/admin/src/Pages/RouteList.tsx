
import { Routes, Route } from "react-router-dom";
import Layout from "@/components/global/Layout";
import DashboardPage from "./Dashboard/DashboardPage";
import AdminManagementPage from "./Dashboard/AdminManagementPage";


export default function RoutesList() {

    return (
        <Layout>
            <Routes>
                <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/user-management" element={<AdminManagementPage />} />
            </Routes>
        </Layout>
    );
}

