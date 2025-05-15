
# Configuração do FinanCasa para Dispositivos Móveis

Este documento explica como configurar e executar o FinanCasa em dispositivos móveis usando Capacitor.

## Requisitos

- Node.js instalado em seu computador
- Git instalado em seu computador
- Android Studio (para Android) ou Xcode (para iOS, somente Mac)

## Passos para execução em dispositivo

1. Clone o repositório do projeto:
   ```
   git clone [URL_DO_SEU_REPOSITÓRIO]
   cd [NOME_DA_PASTA]
   ```

2. Instale as dependências:
   ```
   npm install
   ```

3. Adicione as plataformas desejadas:
   ```
   npx cap add android
   npx cap add ios   # Somente em Mac
   ```

4. Construa o projeto:
   ```
   npm run build
   ```

5. Sincronize o Capacitor:
   ```
   npx cap sync
   ```

6. Execute em um dispositivo ou emulador:
   ```
   npx cap run android
   npx cap run ios   # Somente em Mac
   ```

## Desenvolvimento

Para continuar o desenvolvimento e testar as alterações:

1. Faça suas alterações no código
2. Execute `npm run build`
3. Execute `npx cap sync`
4. Execute `npx cap run android` ou `npx cap run ios`

## Problemas comuns

- **Erro de conexão**: Certifique-se de que o URL no `capacitor.config.ts` esteja acessível.
- **Problemas de build**: Verifique se todas as dependências estão instaladas corretamente.
- **Erros no Android Studio**: Certifique-se de que o Android SDK está instalado e configurado corretamente.
- **Erros no Xcode**: Certifique-se de que você tem um perfil de desenvolvedor válido configurado.
