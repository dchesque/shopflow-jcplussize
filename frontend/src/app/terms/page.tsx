import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Termos de Serviço',
  description: 'Termos de Serviço do ShopFlow - Condições de uso',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">Termos de Serviço</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">1. Aceitação dos Termos</h2>
            <p className="text-gray-300 leading-relaxed">
              Ao acessar e usar o ShopFlow, você concorda com estes Termos de Serviço. 
              Se você não concordar com qualquer parte destes termos, não deve usar nosso serviço.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">2. Descrição do Serviço</h2>
            <p className="text-gray-300 leading-relaxed">
              O ShopFlow é um sistema de análise inteligente que utiliza tecnologia de visão 
              computacional e inteligência artificial para contagem e análise comportamental 
              de pessoas em ambientes comerciais.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">3. Uso Autorizado</h2>
            <div className="text-gray-300 space-y-2">
              <p>Você pode usar o ShopFlow para:</p>
              <p>• Análise de fluxo de pessoas em estabelecimentos comerciais</p>
              <p>• Geração de relatórios e insights de negócio</p>
              <p>• Monitoramento de métricas operacionais</p>
              <p>• Otimização de processos comerciais</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">4. Uso Proibido</h2>
            <div className="text-gray-300 space-y-2">
              <p>É expressamente proibido:</p>
              <p>• Identificação individual de pessoas</p>
              <p>• Armazenamento de dados biométricos</p>
              <p>• Uso para fins discriminatórios</p>
              <p>• Violação de leis de privacidade</p>
              <p>• Tentativas de acesso não autorizado</p>
              <p>• Uso comercial não licenciado</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">5. Responsabilidades do Cliente</h2>
            <div className="text-gray-300 space-y-2">
              <p>• Compliance com leis locais de privacidade</p>
              <p>• Sinalização adequada sobre monitoramento</p>
              <p>• Uso ético da tecnologia</p>
              <p>• Segurança das credenciais de acesso</p>
              <p>• Comunicação de incidentes de segurança</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">6. Disponibilidade do Serviço</h2>
            <p className="text-gray-300 leading-relaxed">
              Nos esforçamos para manter 99.5% de uptime, mas não garantimos disponibilidade 
              ininterrupta. Manutenções programadas serão comunicadas com 48h de antecedência.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">7. Propriedade Intelectual</h2>
            <p className="text-gray-300 leading-relaxed">
              Todos os direitos sobre o software, algoritmos, interface e documentação 
              permanecem de propriedade do ShopFlow. O cliente recebe apenas licença de uso.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">8. Limitação de Responsabilidade</h2>
            <div className="text-gray-300 space-y-2">
              <p>O ShopFlow não se responsabiliza por:</p>
              <p>• Danos indiretos ou lucros cessantes</p>
              <p>• Uso inadequado da plataforma</p>
              <p>• Decisões comerciais baseadas nos dados</p>
              <p>• Interrupções de terceiros (internet, energia)</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">9. Modificações dos Termos</h2>
            <p className="text-gray-300 leading-relaxed">
              Estes termos podem ser atualizados periodicamente. Mudanças significativas 
              serão notificadas com 30 dias de antecedência via e-mail.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">10. Rescisão</h2>
            <p className="text-gray-300 leading-relaxed">
              Qualquer parte pode rescindir o serviço mediante aviso prévio de 30 dias. 
              Em caso de violação destes termos, a rescisão pode ser imediata.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">11. Lei Aplicável</h2>
            <p className="text-gray-300 leading-relaxed">
              Estes termos são regidos pelas leis brasileiras. Foro competente: 
              Comarca de São Paulo, SP.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">12. Contato</h2>
            <div className="text-gray-300 space-y-2">
              <p><strong>E-mail:</strong> legal@shopflow.com</p>
              <p><strong>Suporte:</strong> support@shopflow.com</p>
              <p><strong>Prazo de Resposta:</strong> Até 2 dias úteis</p>
            </div>
          </section>

          <div className="mt-12 pt-8 border-t border-neutral-800">
            <p className="text-sm text-gray-400">
              Última atualização: 10 de setembro de 2025
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Versão 1.0 - Válida a partir de 10/09/2025
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}