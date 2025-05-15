
const { execSync } = require('child_process');

console.log('Inicializando Capacitor...');
try {
  execSync('npx cap init FinanCasa app.lovable.20450505cb594ed4b96b-9ed6b4acc533 --web-dir dist', { stdio: 'inherit' });
  console.log('Capacitor inicializado com sucesso!');
} catch (error) {
  console.error('Erro ao inicializar Capacitor:', error);
}
