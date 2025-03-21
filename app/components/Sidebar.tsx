import React from 'react';
import { useSidebarStore } from '@/store/sidebarStore';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SidebarItem {
  href: string;
  icon: React.ReactNode;
  label: string;
}

const sidebarItems: SidebarItem[] = [
  {
    href: '/home',
    icon: <span>🏠</span>,
    label: 'Home'
  },
  {
    href: '/pomodoro-timer',
    icon: <span>⏱️</span>,
    label: 'Pomodoro'
  },
  {
    href: '/notes',
    icon: <span>📝</span>,
    label: 'Notes'
  },
  {
    href: '/profile',
    icon: <span>👤</span>,
    label: 'Profile'
  }
];

const Sidebar: React.FC = () => {
  const { isExpanded, setHovered, isMobile } = useSidebarStore();
  const router = useRouter();

  const handleMouseEnter = () => {
    if (!isMobile) {
      setHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setHovered(false);
    }
  };

  const handleItemClick = async (href: string) => {
    if (isMobile) {
      setTimeout(() => {
        setHovered(false);
      }, 300);
    }
    router.push(href);
  };

  return (
    <motion.div
      className={cn(
        "fixed left-0 top-0 z-40 h-screen w-64 -translate-x-full border-r border-gray-200 bg-white pt-20 transition-transform dark:border-gray-800 dark:bg-gray-900 md:translate-x-0 md:w-20",
        isExpanded && "md:w-64",
        "md:hover:w-64"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{ translateX: isExpanded ? 0 : isMobile ? "-100%" : 0 }}
      transition={{ duration: 0.3 }}
    >
      <nav className="h-full px-3">
        <ul className="space-y-2">
          {sidebarItems.map((item: SidebarItem) => (
            <li key={item.href} onClick={() => handleItemClick(item.href)} className="flex items-center p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
              <div className="min-w-[1.5rem]">{item.icon}</div>
              <span className={cn("ml-3 whitespace-nowrap", !isExpanded && "md:hidden")}>{item.label}</span>
            </li>
          ))}
        </ul>
      </nav>
    </motion.div>
  );
};

export default Sidebar; 