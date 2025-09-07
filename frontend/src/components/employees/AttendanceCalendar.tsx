'use client'

import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths, getDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Download, Eye, FileText, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface AttendanceRecord {
  date: Date
  status: 'present' | 'absent' | 'late' | 'half_day' | 'vacation' | 'sick'
  checkIn?: string
  checkOut?: string
  hoursWorked?: number
  notes?: string
}

interface AttendanceCalendarProps {
  employeeId: string
  employeeName: string
  month?: Date
  data: AttendanceRecord[]
  onExportPDF?: () => void
  onExportExcel?: () => void
}

const statusConfig = {
  present: { label: 'Presente', color: 'bg-green-500', textColor: 'text-green-700' },
  absent: { label: 'Ausente', color: 'bg-red-500', textColor: 'text-red-700' },
  late: { label: 'Atrasado', color: 'bg-yellow-500', textColor: 'text-yellow-700' },
  half_day: { label: 'Meio Período', color: 'bg-blue-500', textColor: 'text-blue-700' },
  vacation: { label: 'Férias', color: 'bg-purple-500', textColor: 'text-purple-700' },
  sick: { label: 'Atestado', color: 'bg-orange-500', textColor: 'text-orange-700' }
}

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function AttendanceCalendar({ 
  employeeId, 
  employeeName, 
  month = new Date(), 
  data,
  onExportPDF,
  onExportExcel 
}: AttendanceCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(month)
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Add empty cells for days before the first day of the month
  const startPadding = Array.from({ length: getDay(monthStart) }, (_, i) => null)
  const calendarDays = [...startPadding, ...daysInMonth]

  const getAttendanceForDay = (date: Date) => {
    return data.find(record => isSameDay(record.date, date))
  }

  const getStatusStats = () => {
    const stats = {
      present: 0,
      absent: 0,
      late: 0,
      half_day: 0,
      vacation: 0,
      sick: 0
    }

    data.forEach(record => {
      if (isSameMonth(record.date, currentMonth)) {
        stats[record.status]++
      }
    })

    return stats
  }

  const selectedDayAttendance = selectedDay ? getAttendanceForDay(selectedDay) : null
  const stats = getStatusStats()

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Calendário de Presença
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {employeeName} - {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onExportExcel}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExportPDF}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(stats).map(([status, count]) => {
          const config = statusConfig[status as keyof typeof statusConfig]
          return (
            <Card key={status} className="text-center">
              <CardContent className="p-4">
                <div className={`w-4 h-4 rounded-full ${config.color} mx-auto mb-2`} />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {count}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {config.label}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </CardTitle>
          
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {/* Week days header */}
            {weekDays.map(day => (
              <div
                key={day}
                className="p-3 text-center text-sm font-medium text-gray-600 dark:text-gray-400"
              >
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {calendarDays.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="p-3" />
              }

              const attendance = getAttendanceForDay(day)
              const isCurrentMonth = isSameMonth(day, currentMonth)
              const isTodayDate = isToday(day)

              return (
                <Dialog key={day.toISOString()}>
                  <DialogTrigger asChild>
                    <button
                      className={cn(
                        "p-3 text-center rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-800 relative",
                        !isCurrentMonth && "text-gray-400 dark:text-gray-600",
                        isTodayDate && "ring-2 ring-blue-500"
                      )}
                      onClick={() => setSelectedDay(day)}
                    >
                      <div className="text-sm font-medium">
                        {format(day, 'd')}
                      </div>
                      
                      {attendance && isCurrentMonth && (
                        <div
                          className={cn(
                            "absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full",
                            statusConfig[attendance.status].color
                          )}
                        />
                      )}
                    </button>
                  </DialogTrigger>
                  
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {format(day, 'dd/MM/yyyy', { locale: ptBR })}
                      </DialogTitle>
                    </DialogHeader>
                    
                    {attendance ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={statusConfig[attendance.status].textColor}>
                            {statusConfig[attendance.status].label}
                          </Badge>
                        </div>
                        
                        {attendance.checkIn && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Entrada
                              </label>
                              <div className="text-lg font-semibold">
                                {attendance.checkIn}
                              </div>
                            </div>
                            
                            {attendance.checkOut && (
                              <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                  Saída
                                </label>
                                <div className="text-lg font-semibold">
                                  {attendance.checkOut}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {attendance.hoursWorked && (
                          <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              Horas Trabalhadas
                            </label>
                            <div className="text-lg font-semibold">
                              {attendance.hoursWorked}h
                            </div>
                          </div>
                        )}
                        
                        {attendance.notes && (
                          <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              Observações
                            </label>
                            <div className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                              {attendance.notes}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Nenhum registro encontrado para este dia</p>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Legenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {Object.entries(statusConfig).map(([status, config]) => (
              <div key={status} className="flex items-center gap-2">
                <div className={cn("w-3 h-3 rounded-full", config.color)} />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {config.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}