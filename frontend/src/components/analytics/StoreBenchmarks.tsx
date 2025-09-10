"use client"

import React from 'react'

interface StoreBenchmarksProps {
  storeId?: string
  benchmarkData?: any
}

export function StoreBenchmarks({ storeId, benchmarkData }: StoreBenchmarksProps) {
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Benchmarks da Loja</h3>
      <div className="space-y-2">
        <p className="text-sm text-gray-600">Loja ID: {storeId || 'N/A'}</p>
        <div className="mt-4">
          <p className="text-sm font-medium">Métricas de Performance</p>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="p-2 bg-gray-50 rounded">
              <span className="text-xs text-gray-500">Vendas</span>
              <p className="font-medium">R$ 125.430</p>
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <span className="text-xs text-gray-500">Visitantes</span>
              <p className="font-medium">2.847</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StoreBenchmarks