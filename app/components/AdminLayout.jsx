
import Sidebar from "./Sidebar";

import Review from "./Review";

export default function AdminLayout({ shop , reviews }) {


  return (
    <div className="flex min-h-screen bg-[#f7f7f8]">

      <Sidebar
       
        shop={shop}
      />

      <main className="flex-1 px-12 py-10 overflow-y-auto max-w-4xl">
      
         <Review  reviews={reviews} />
      </main>

    </div>
  );
}