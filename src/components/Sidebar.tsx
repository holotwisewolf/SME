import React, { useContext, createContext, useState } from "react";
import ExpandButton from "./ExpandButton"; // Your custom button
import CloudLogo from "./CloudLogo";       // Your custom logo

const SidebarContext = createContext<{ expanded: boolean }>({ expanded: true });

export default function Sidebar({ children }: { children: React.ReactNode }) {
    // Default to false if you want it closed by default to match your original design
    const [expanded, setExpanded] = useState(false);

    return (
        <aside className="h-screen sticky top-0 z-50">
            <nav className="h-full flex flex-col bg-[var(--color-background-primary)] border-r border-[#444] shadow-xl transition-all duration-300 ease-in-out">

                {/* HEADER: Logo + Toggle Button */}
                <div className="p-4 pb-2 flex justify-between items-center h-20">
                    <div className={`overflow-hidden transition-all duration-300 ${expanded ? "w-32" : "w-0 opacity-0"}`}>
                        {/* Text Logo or Full Logo could go here */}
                        <h1 className="text-[#FFD1D1] font-bold text-xl whitespace-nowrap pl-2">Music Explorer</h1>
                    </div>

                    <button
                        onClick={() => setExpanded((curr) => !curr)}
                        className="p-1.5 rounded-lg hover:bg-[#333] transition-colors group"
                    >
                        {/* Using your custom ExpandButton, rotating it based on state */}
                        <div className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}>
                            <ExpandButton />
                        </div>
                    </button>
                </div>

                {/* ITEMS CONTAINER */}
                <SidebarContext.Provider value={{ expanded }}>
                    <ul className="flex-1 px-3 space-y-2 pt-4">{children}</ul>
                </SidebarContext.Provider>

                {/* FOOTER: User Profile (Optional, styled for Dark Mode) */}
                <div className="border-t border-[#444] flex p-3">
                    <img
                        src="https://ui-avatars.com/api/?background=FFD1D1&color=000&bold=true&name=User"
                        alt=""
                        className="w-10 h-10 rounded-md shrink-0"
                    />
                    <div
                        className={`
              flex justify-between items-center
              overflow-hidden transition-all duration-300 ${expanded ? "w-40 ml-3" : "w-0"}
          `}
                    >
                        <div className="leading-4 text-white">
                            <h4 className="font-semibold text-sm">My Profile</h4>
                            <span className="text-xs text-gray-400">user@music.com</span>
                        </div>
                    </div>
                </div>
            </nav>
        </aside>
    );
}
// --- SIDEBAR ITEM COMPONENT ---
interface SidebarItemProps {
    icon: React.ReactNode;
    text: string;
    active?: boolean;
    alert?: boolean;
    onClick?: () => void; // Added onClick support
}

export function SidebarItem({ icon, text, active, alert, onClick }: SidebarItemProps) {
    const { expanded } = useContext(SidebarContext);

    return (
        <li
            onClick={onClick}
            className={`
        relative flex items-center py-3 px-3 my-1
        font-medium rounded-md cursor-pointer
        transition-colors group
        ${active
                    ? "bg-[#FFD1D1]/10 text-[#FFD1D1]" // Active: Pink tint + Pink text
                    : "hover:bg-[#333] text-gray-400 hover:text-white" // Hover: Dark Gray + White text
                }
    `}
        >
            {/* Icon Wrapper */}
            <div className="w-6 h-6 flex items-center justify-center shrink-0">
                {icon}
            </div>

            {/* Text Label (Expands/Collapses) */}
            <span
                className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${expanded ? "w-40 ml-3 opacity-100" : "w-0 opacity-0"
                    }`}
            >
                {text}
            </span>

            {/* Notification Dot (Optional) */}
            {alert && (
                <div
                    className={`absolute right-2 w-2 h-2 rounded bg-[#FFD1D1] ${expanded ? "" : "top-2 right-2"
                        }`}
                />
            )}

            {/* Floating Tooltip (Visible ONLY when collapsed) */}
            {!expanded && (
                <div
                    className={`
          absolute left-full rounded-md px-2 py-1 ml-6
          bg-[#FFD1D1] text-black text-xs font-bold
          invisible opacity-20 -translate-x-3 transition-all
          group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
          z-50
      `}
                >
                    {text}
                </div>
            )}
        </li>
    );
}




