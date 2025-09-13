'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MENU_ITEMS } from '@/lib/constants'

interface MenuItem {
  id: string
  label: string
  href: string
  icon: LucideIcon
  badge?: string
  children?: MenuItem[]
}

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = React.useState<string[]>([])
  
  const menuItems = MENU_ITEMS as MenuItem[]

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const isChildActive = (children?: MenuItem[]) => {
    return children?.some(child => isActive(child.href))
  }

  return (
    <motion.aside
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "fixed left-0 top-0 z-40 h-screen w-70 bg-neutral-900/95 backdrop-blur-xl border-r border-neutral-800/50",
        "flex flex-col overflow-hidden",
        className
      )}
    >
          {/* Header */}
          <div className="p-6 border-b border-neutral-800/50">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SF</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                ShopFlow
              </h1>
            </motion.div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {menuItems.map((item, index) => {
                const hasChildren = item.children && item.children.length > 0
                const isExpanded = expandedItems.includes(item.id)
                const isItemActive = isActive(item.href) || (hasChildren && isChildActive(item.children))

                return (
                  <motion.li
                    key={item.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {hasChildren ? (
                      <div>
                        <button
                          onClick={() => toggleExpanded(item.id)}
                          className={cn(
                            "w-full flex items-center justify-between p-3 rounded-lg text-sm font-medium transition-all duration-200",
                            "hover:bg-neutral-800/50 hover:text-white group",
                            isItemActive 
                              ? "bg-red-500/10 text-red-500 border border-red-500/20" 
                              : "text-neutral-300"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className={cn(
                              "w-5 h-5 transition-colors duration-200",
                              isItemActive ? "text-red-500" : "text-neutral-400 group-hover:text-white"
                            )} />
                            <span>{item.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.badge && (
                              <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                                {item.badge}
                              </span>
                            )}
                            <ChevronDown className={cn(
                              "w-4 h-4 transition-transform duration-200",
                              isExpanded ? "rotate-180" : ""
                            )} />
                          </div>
                        </button>
                        
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.ul
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="ml-8 mt-2 space-y-1 overflow-hidden"
                            >
                              {item.children?.map((child) => (
                                <motion.li
                                  key={child.id}
                                  initial={{ x: -10, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ delay: 0.1 }}
                                >
                                  <Link
                                    href={child.href}
                                    prefetch={true}
                                    className={cn(
                                      "flex items-center gap-3 p-2 rounded-lg text-sm transition-all duration-200",
                                      "hover:bg-neutral-800/30 hover:text-white group",
                                      isActive(child.href)
                                        ? "bg-red-500/10 text-red-500 border-l-2 border-red-500"
                                        : "text-neutral-400"
                                    )}
                                  >
                                    <child.icon className={cn(
                                      "w-4 h-4 transition-colors duration-200",
                                      isActive(child.href) ? "text-red-500" : "text-neutral-500 group-hover:text-white"
                                    )} />
                                    <span>{child.label}</span>
                                  </Link>
                                </motion.li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        prefetch={true}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg text-sm font-medium transition-all duration-200",
                          "hover:bg-neutral-800/50 hover:text-white group hover:scale-105",
                          isItemActive
                            ? "bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-500 border border-red-500/20 shadow-lg shadow-red-500/10"
                            : "text-neutral-300"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className={cn(
                            "w-5 h-5 transition-colors duration-200",
                            isItemActive ? "text-red-500" : "text-neutral-400 group-hover:text-white"
                          )} />
                          <span>{item.label}</span>
                        </div>
                            {item.badge && (
                              <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                                {item.badge}
                              </span>
                            )}
                      </Link>
                    )}
                  </motion.li>
                )
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-neutral-800/50">
            <div className="text-xs text-neutral-500 text-center">
              ShopFlow v1.0 - Smart Analytics
            </div>
          </div>
        </motion.aside>
  )
}