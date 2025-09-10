import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Controle de Presença',
}

export default function AttendancePage() {
  const todayAttendance = [
    { id: 1, name: 'Ana Silva', department: 'Vendas', checkIn: '08:00', checkOut: '-', status: 'present' },
    { id: 2, name: 'Carlos Santos', department: 'Caixa', checkIn: '08:15', checkOut: '-', status: 'present' },
    { id: 3, name: 'Maria Oliveira', department: 'Gerência', checkIn: '-', checkOut: '-', status: 'absent' },
    { id: 4, name: 'João Costa', department: 'Segurança', checkIn: '07:45', checkOut: '-', status: 'present' },
    { id: 5, name: 'Lucia Ferreira', department: 'Estoque', checkIn: '08:30', checkOut: '-', status: 'late' },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'text-green-500 bg-green-500/10'
      case 'absent': return 'text-red-500 bg-red-500/10'
      case 'late': return 'text-yellow-500 bg-yellow-500/10'
      default: return 'text-gray-500 bg-gray-500/10'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present': return 'Presente'
      case 'absent': return 'Ausente'
      case 'late': return 'Atrasado'
      default: return 'N/A'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Controle de Presença</h1>
          <p className="text-gray-400">Monitore a presença e horários dos funcionários</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Hoje</p>
          <p className="text-lg font-semibold text-white">{new Date().toLocaleDateString('pt-BR')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Total</h3>
          <p className="text-3xl font-bold text-blue-500">5</p>
          <p className="text-sm text-gray-400">funcionários</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Presentes</h3>
          <p className="text-3xl font-bold text-green-500">4</p>
          <p className="text-sm text-gray-400">80% do total</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Ausentes</h3>
          <p className="text-3xl font-bold text-red-500">1</p>
          <p className="text-sm text-gray-400">20% do total</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Atrasados</h3>
          <p className="text-3xl font-bold text-yellow-500">1</p>
          <p className="text-sm text-gray-400">25% dos presentes</p>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Presença de Hoje</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-700">
                <th className="text-left py-3 px-4 text-white">Funcionário</th>
                <th className="text-left py-3 px-4 text-white">Departamento</th>
                <th className="text-left py-3 px-4 text-white">Entrada</th>
                <th className="text-left py-3 px-4 text-white">Saída</th>
                <th className="text-left py-3 px-4 text-white">Status</th>
              </tr>
            </thead>
            <tbody>
              {todayAttendance.map((employee) => (
                <tr key={employee.id} className="border-b border-neutral-800">
                  <td className="py-3 px-4 text-white">{employee.name}</td>
                  <td className="py-3 px-4 text-gray-300">{employee.department}</td>
                  <td className="py-3 px-4 text-gray-300">{employee.checkIn}</td>
                  <td className="py-3 px-4 text-gray-300">{employee.checkOut}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                      {getStatusText(employee.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Horários de Trabalho</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white">Manhã</span>
              <span className="text-gray-400">08:00 - 12:00</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white">Tarde</span>
              <span className="text-gray-400">13:00 - 18:00</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white">Noite</span>
              <span className="text-gray-400">18:00 - 22:00</span>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Ações Rápidas</h3>
          <div className="space-y-3">
            <button className="w-full p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors">
              Marcar Entrada Manual
            </button>
            <button className="w-full p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors">
              Gerar Relatório Diário
            </button>
            <button className="w-full p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/20 transition-colors">
              Exportar Dados
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}