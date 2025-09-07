'use client'

import { motion } from 'framer-motion'

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-neutral-950 p-6"
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Configurações do Sistema
          </h1>
          <p className="text-neutral-400">
            Gerencie configurações, privacidade, segurança e integrações do ShopFlow
          </p>
        </motion.div>

        {children}
      </div>
    </motion.div>
  )
}