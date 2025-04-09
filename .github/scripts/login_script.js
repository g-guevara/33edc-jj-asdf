const { chromium } = require('playwright');

(async () => {
  // Obtener credenciales de las variables de entorno
  const username = process.env.USERNAME;
  const password = process.env.PASSWORD;
  
  if (!username || !password) {
    console.error('Error: Falta usuario o contraseña');
    process.exit(1);
  }
  
  console.log(`Intento de inicio de sesión para el usuario: ${username}`);
  
  // Iniciar el navegador
  const browser = await chromium.launch({
    headless: true // En producción, mantén esto en true
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Navegar a la página de login
    await page.goto('https://intranet.uai.cl/');
    
    // Esperar a que el formulario de login esté disponible
    await page.waitForSelector('input[name="username"]');
    
    // Ingresar credenciales
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    
    // Hacer clic en el botón de login
    await page.click('button[type="submit"]');
    
    // Esperar a que se complete el inicio de sesión
    // Esto depende de cómo funciona exactamente la página
    await page.waitForNavigation();
    
    // Verificar si el login fue exitoso
    const isLoggedIn = await page.evaluate(() => {
      // Verifica algo en la página que indique un login exitoso
      // Por ejemplo, si hay un elemento con el nombre de usuario
      return document.body.textContent.includes('Bienvenido') || 
             document.querySelector('.user-profile') !== null;
    });
    
    if (isLoggedIn) {
      console.log(`Inicio de sesión exitoso para el usuario: ${username}`);
      
      // Aquí puedes extraer datos adicionales si es necesario
      
    } else {
      console.error('El inicio de sesión parece haber fallado');
    }
    
  } catch (error) {
    console.error('Error durante el proceso de inicio de sesión:', error);
  } finally {
    // Cerrar el navegador
    await browser.close();
  }
})();