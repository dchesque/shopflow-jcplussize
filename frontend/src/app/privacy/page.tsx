import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Política de Privacidade do ShopFlow - Conformidade com LGPD e GDPR',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">Política de Privacidade</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">1. Informações Gerais</h2>
            <p className="text-gray-300 leading-relaxed">
              Esta Política de Privacidade descreve como o ShopFlow (&quot;nós&quot;, &quot;nosso&quot; ou &quot;sistema&quot;) 
              coleta, usa, armazena e protege suas informações pessoais. Estamos comprometidos com 
              a proteção da sua privacidade e cumprimento da Lei Geral de Proteção de Dados (LGPD) 
              e do Regulamento Geral de Proteção de Dados (GDPR).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">2. Dados Coletados</h2>
            <div className="text-gray-300 space-y-2">
              <p><strong>Dados de Contagem:</strong> Informações anônimas de contagem de pessoas</p>
              <p><strong>Dados de Sistema:</strong> Logs de acesso, métricas de performance</p>
              <p><strong>Dados de Usuário:</strong> E-mail, nome, preferências de sistema (quando aplicável)</p>
              <p><strong>Dados Técnicos:</strong> IP, navegador, timestamps de acesso</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">3. Base Legal para Processamento</h2>
            <div className="text-gray-300 space-y-2">
              <p>• <strong>Interesse legítimo:</strong> Análise de fluxo de pessoas para otimização comercial</p>
              <p>• <strong>Execução de contrato:</strong> Fornecimento do serviço contratado</p>
              <p>• <strong>Consentimento:</strong> Para cookies não essenciais e marketing (quando aplicável)</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">4. Retenção de Dados</h2>
            <div className="text-gray-300 space-y-2">
              <p>• <strong>Dados de Contagem:</strong> Mantidos por até 2 anos para análise histórica</p>
              <p>• <strong>Logs de Sistema:</strong> Mantidos por 90 dias para troubleshooting</p>
              <p>• <strong>Dados de Usuário:</strong> Mantidos enquanto a conta estiver ativa</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">5. Seus Direitos (LGPD/GDPR)</h2>
            <div className="text-gray-300 space-y-2">
              <p>• <strong>Acesso:</strong> Solicitar cópia dos seus dados pessoais</p>
              <p>• <strong>Retificação:</strong> Corrigir dados incorretos ou incompletos</p>
              <p>• <strong>Exclusão:</strong> Solicitar remoção dos seus dados (&quot;direito ao esquecimento&quot;)</p>
              <p>• <strong>Portabilidade:</strong> Receber seus dados em formato estruturado</p>
              <p>• <strong>Oposição:</strong> Opor-se ao processamento baseado em interesse legítimo</p>
              <p>• <strong>Limitação:</strong> Solicitar limitação do processamento</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">6. Medidas de Segurança</h2>
            <div className="text-gray-300 space-y-2">
              <p>• Criptografia de dados em trânsito e em repouso</p>
              <p>• Controles de acesso baseados em funções</p>
              <p>• Monitoramento contínuo de segurança</p>
              <p>• Backups automáticos seguros</p>
              <p>• Anonização de dados sensíveis</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">7. Compartilhamento de Dados</h2>
            <p className="text-gray-300">
              Não compartilhamos dados pessoais com terceiros, exceto quando necessário para:
            </p>
            <div className="text-gray-300 space-y-2 mt-2">
              <p>• Cumprimento de obrigações legais</p>
              <p>• Proteção dos nossos direitos ou segurança</p>
              <p>• Prestação de serviços técnicos essenciais (provedores de nuvem)</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">8. Cookies e Tecnologias Similares</h2>
            <p className="text-gray-300">
              Utilizamos cookies essenciais para funcionamento do sistema e cookies analíticos 
              para melhorar a experiência do usuário. Você pode gerenciar suas preferências 
              de cookies nas configurações do navegador.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">9. Contato e DPO</h2>
            <div className="text-gray-300 space-y-2">
              <p>Para exercer seus direitos ou esclarecer dúvidas sobre privacidade:</p>
              <p><strong>E-mail:</strong> privacy@shopflow.com</p>
              <p><strong>Encarregado de Dados (DPO):</strong> dpo@shopflow.com</p>
              <p><strong>Prazo de Resposta:</strong> Até 15 dias úteis</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">10. Alterações nesta Política</h2>
            <p className="text-gray-300">
              Esta política pode ser atualizada periodicamente. Alterações significativas 
              serão comunicadas com 30 dias de antecedência via e-mail ou notificação no sistema.
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-neutral-800">
            <p className="text-sm text-gray-400">
              Última atualização: 10 de setembro de 2025
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Esta política está em conformidade com a LGPD (Lei 13.709/2018) e GDPR (Regulamento UE 2016/679).
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}