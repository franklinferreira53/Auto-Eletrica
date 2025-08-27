# Recomendações de Melhorias para o Sistema Auto-Elétrica

## 1. Imagens de Alta Qualidade

### Diretrizes para imagens:
- **Resolução mínima**: 1920x1080px para imagens de fundo, 800x600px para imagens de destaque
- **Formato**: Usar WebP para melhor performance, com fallback em JPG
- **Estilo**: Imagens profissionais, bem iluminadas, mostrando claramente os detalhes
- **Consistência**: Manter paleta de cores consistente com o tema do site

### Imagens necessárias por seção:

#### Instaladores de Rastreadores:
- `installer-closeup.jpg` - Imagem de close-up de uma instalação profissional
- `tracking-diagram-detailed.jpg` - Diagrama detalhado colorido de instalação
- `installer-with-tablet.jpg` - Técnico usando tablet para consultar diagrama

#### Eletricistas Automotivos:
- `auto-electrician-diagnostics.jpg` - Profissional usando equipamento de diagnóstico
- `circuit-board-closeup.jpg` - Close-up de circuito elétrico automotivo
- `wiring-color-coded.jpg` - Imagem de fiação com código de cores destacado

#### Página Principal:
- `hero-background.jpg` - Imagem de fundo profissional para a seção principal
- `dashboard-preview-full.jpg` - Imagem em alta resolução do dashboard em uso
- `mobile-desktop-view.jpg` - Demonstração do sistema em múltiplos dispositivos

#### Seção de Benefícios:
- `time-saving.jpg` - Imagem representando economia de tempo
- `professional-accuracy.jpg` - Imagem representando precisão profissional
- `updated-database.jpg` - Imagem representando banco de dados atualizado

## 2. Limitações para o Teste Gratuito de 7 Dias

### Configuração Back-end:

1. **Modelo de usuário**:
   - Adicionar campo `trialStart` (data de início do trial)
   - Adicionar campo `trialEnd` (data de término do trial)
   - Adicionar campo `trialActive` (booleano)
   - Adicionar campo `subscriptionActive` (booleano)

2. **Middleware de verificação de acesso**:
   - Criar `trialAccessMiddleware.js` para verificar o nível de acesso do usuário
   - Implementar lógica para limitar acesso baseado no status do usuário

3. **Controllers**:
   - Modificar `diagramController.js` para retornar versões limitadas dos diagramas para usuários em teste
   - Adicionar marca d'água nas imagens de diagramas para usuários em teste

### Restrições de funcionalidade:

1. **Download de diagramas**:
   - Desativar botões de download para usuários em teste
   - Mostrar modal informativo ao tentar fazer download, incentivando upgrade

2. **Visualização limitada**:
   - Implementar versões de baixa resolução dos diagramas
   - Limitar o número de diagramas acessíveis (5-10 modelos populares)

3. **Informação parcial**:
   - Mostrar apenas informações básicas sobre os diagramas
   - Ofuscar detalhes técnicos avançados

4. **Acesso offline**:
   - Desabilitar recursos de armazenamento offline
   - Mostrar mensagem sobre recurso premium

## 3. Melhorias Funcionais

### Tour guiado interativo:
1. **Implementar usando react-joyride**:
   - Instalar: `npm install react-joyride --save`
   - Criar componente `GuidedTour.js` com passos para cada seção importante
   - Disparar automaticamente no primeiro login de novos usuários

### Filtros de pesquisa avançados:
1. **Adicionar filtros**:
   - Por ano do veículo
   - Por sistema específico (ignição, alimentação, etc.)
   - Por popularidade/mais acessados

### Sistema de favoritos:
1. **Modelo de dados**:
   - Criar modelo `UserFavorite.js` para armazenar favoritos
   - Relacionamentos com usuário e diagramas

2. **Interface**:
   - Adicionar ícone de estrela para favoritar diagramas
   - Criar página "Meus Favoritos"

### Modo noturno:
1. **Implementar usando o tema Material UI**:
   - Estender o tema atual com variante dark
   - Adicionar toggle para alternar entre temas

### Sistema de marketing e conversão:
1. **Contador regressivo**:
   - Mostrar dias restantes do teste em componente de notificação
   - Aumentar urgência conforme se aproxima do fim

2. **Depoimentos**:
   - Criar seção de depoimentos na página inicial
   - Destacar benefícios reais de usuários premium

### Funcionalidades premium:
1. **Sistema de anotações**:
   - Permitir que usuários premium adicionem notas aos diagramas
   - Salvar em banco de dados para acesso futuro

2. **Comparação de diagramas**:
   - Implementar visualização lado a lado de diagramas similares
   - Destacar diferenças entre modelos/anos

## 4. Implementação técnica

### Frontend:
1. **Melhorias no RegisterPage.js**:
   - Adicionar campo para tipo de perfil (instalador/eletricista)
   - Incluir termos específicos do período de teste
   - Atualizar validação do formulário

2. **Componentes novos**:
   - `TrialBanner.js` - Banner informativo sobre o período de teste
   - `UpgradeModal.js` - Modal para incentivar upgrade ao tentar acessar recursos premium
   - `FeatureComparison.js` - Tabela comparativa de recursos trial vs premium

3. **Páginas adicionais**:
   - `PricingPage.js` - Página de preços e planos
   - `TestimonialPage.js` - Página com depoimentos de usuários
   - `UpgradePage.js` - Página específica para conversão

### Backend:
1. **Novos endpoints**:
   - `/api/trial/status` - Verificar status do período de teste
   - `/api/upgrade` - Processar upgrade de conta
   - `/api/diagrams/preview` - Obter versões limitadas dos diagramas

2. **Modificações no banco de dados**:
   - Adicionar campos relacionados ao período de teste na tabela de usuários
   - Criar tabela para tracking de uso durante o período de teste

## 5. Próximos passos

1. **Design**:
   - Adquirir/criar as imagens profissionais recomendadas
   - Atualizar o design das páginas principais com as novas imagens

2. **Desenvolvimento backend**:
   - Implementar middleware de controle de acesso baseado no status do trial
   - Modificar controllers para limitar funcionalidades para usuários em trial

3. **Desenvolvimento frontend**:
   - Atualizar componentes existentes com as novas imagens
   - Implementar novos componentes para funcionalidades premium
   - Criar páginas adicionais para marketing e conversão

4. **Testing**:
   - Testar fluxo completo de registro, período de teste e upgrade
   - Verificar restrições funcionando corretamente
   - Testar responsividade das novas imagens em diferentes dispositivos
