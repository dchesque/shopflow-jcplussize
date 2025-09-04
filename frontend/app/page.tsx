export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-8">
          Shop Flow
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Sistema de Contagem de Pessoas
        </p>
        <div className="bg-green-500/20 border border-green-500 rounded-lg p-6 max-w-lg">
          <div className="flex items-center justify-center mb-4">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
            <span className="text-green-400 font-semibold">Sistema Online</span>
          </div>
          <p className="text-gray-300 text-sm">
            Deploy local funcionando<br/>
            Frontend ✅ | API Health ✅
          </p>
        </div>
      </div>
    </div>
  );
}