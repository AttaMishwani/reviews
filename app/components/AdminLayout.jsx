import { useState } from "react";
import Sidebar from "./Sidebar";
import Overview from "./Overview";
import Review from "./Review";

export default function AdminLayout({ shop }) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex min-h-screen bg-[#f7f7f8]">

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        shop={shop}
      />

      <main className="flex-1 px-12 py-10 overflow-y-auto max-w-4xl">
        {activeTab === "overview" && <Overview shop={shop} />}
        {activeTab === "reviews" && <Review />}
      </main>

    </div>
  );
}