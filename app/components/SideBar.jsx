const navItems = [
  { id: "overview", label: "Overview", icon: "▦" },
  { id: "reviews", label: "Reviews", icon: "✦" },
];

export default function Sidebar({ activeTab, setActiveTab, shop }) {
  return (
    <aside className="w-[220px] min-h-screen bg-[#0e0e10] flex flex-col shrink-0 border-r border-white/[0.06]">

      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div>
            <div className="text-sm font-bold text-white tracking-tight">
              ReviewsApp
            </div>
            <div className="text-[10px] text-white/30 mt-px">
              Admin Panel
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="px-2.5 py-3 flex-1">
        <div className="text-[10px] text-white/20 px-2.5 pb-1.5 pt-2 tracking-widest uppercase">
          Menu
        </div>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg mb-0.5 text-[13px] text-left transition-all duration-150 cursor-pointer border-l-2 font-sans
              ${activeTab === item.id
                ? "bg-amber-500/10 text-amber-400 border-amber-400 font-semibold"
                : "bg-transparent text-white/40 border-transparent font-normal hover:text-white/60 hover:bg-white/5"
              }`}
          >
            <span className="text-xs">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Shop at bottom */}
      <div className="px-5 py-4 border-t border-white/[0.06]">
        <div className="text-[10px] text-white/20 uppercase tracking-wider mb-1">
          Store
        </div>
        <div className="text-[11px] text-white/35 break-all leading-snug">
          {shop}
        </div>
      </div>

    </aside>
  );
}