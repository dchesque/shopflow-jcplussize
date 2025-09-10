"use client"

import React from 'react'

interface PeriodComparisonProps {
  startDate?: string
  endDate?: string  
  comparisonStartDate?: string
  comparisonEndDate?: string
}

export function PeriodComparison({ 
  startDate, 
  endDate, 
  comparisonStartDate, 
  comparisonEndDate 
}: PeriodComparisonProps) {
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Comparação de Períodos</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">Período Atual</p>
          <p className="font-medium">{startDate} - {endDate}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Período Anterior</p>
          <p className="font-medium">{comparisonStartDate} - {comparisonEndDate}</p>
        </div>
      </div>
    </div>
  )
}

export default PeriodComparison