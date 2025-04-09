const express = require('express');
const cors = require('cors');
const { Octokit } = require('@octokit/rest');
const app = express();

app.use(cors());
app.use(express.json());

// Configurar con tus valores
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = 'tu-usuario-github';
const GITHUB_REPO = 'tu-repositorio';

app.post('/trigger-login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Falta usuario o contraseña' });
    }
    
    // Iniciar GitHub Actions workflow
    const octokit = new Octokit({ auth: GITHUB_TOKEN });
    
    // Crear un dispatch event para activar el workflow
    await octokit.rest.actions.createWorkflowDispatch({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      workflow_id: 'intranet_login.yml', // Nombre de tu archivo de workflow
      ref: 'main', // Tu rama principal
      inputs: {
        username: username,
        // NO enviar la contraseña directamente, usar un token temporal o algún otro mecanismo
      }
    });
    
    // Almacenar las credenciales de forma segura (base de datos encriptada, etc.)
    // para que el workflow pueda acceder a ellas
    
    // Responder al cliente
    return res.status(200).json({ message: 'Login iniciado correctamente' });
  } catch (error) {
    console.error('Error al activar el flujo de GitHub Actions:', error);
    return res.status(500).json({ error: 'Error interno al iniciar el proceso de login' });
  }
});

// Ruta para verificar el estado del login
app.get('/login-status/:username', async (req, res) => {
  // Verificar en tu base de datos o en los resultados del workflow
  // si el login fue exitoso
  
  res.status(200).json({ status: 'pending' }); // O 'success', 'failed', etc.
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});