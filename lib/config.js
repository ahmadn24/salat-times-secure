const fs = require('fs');
const path = require('path');
const os = require('os');

const CONFIG_DIR = path.join(os.homedir(), '.openclaw', 'skills', 'salat-times');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

// Configuration par défaut
const DEFAULT_CONFIG = {
  location: {
    city: null,
    country: null,
    latitude: null,
    longitude: null,
    timezone: null
  },
  method: 'MWL',
  language: 'fr',
  adjustments: {
    fajr: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0
  },
  notifications: {
    enabled: false,
    before_minutes: 10,
    channel: null,
    recipient: null
  },
  cache: {
    enabled: true,
    duration_hours: 24
  }
};

/**
 * Charger la configuration
 */
function loadConfig() {
  try {
    if (!fs.existsSync(CONFIG_FILE)) {
      return { ...DEFAULT_CONFIG };
    }
    
    const data = fs.readFileSync(CONFIG_FILE, 'utf8');
    return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
  } catch (error) {
    console.warn('Erreur lecture config, utilisation valeurs par défaut:', error.message);
    return { ...DEFAULT_CONFIG };
  }
}

/**
 * Sauvegarder la configuration
 */
function saveConfig(config) {
  try {
    // Créer le dossier si nécessaire
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Erreur sauvegarde config:', error.message);
    return false;
  }
}

/**
 * Obtenir une valeur de configuration
 */
function getConfigValue(key) {
  const config = loadConfig();
  const keys = key.split('.');
  
  let value = config;
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return null;
    }
  }
  
  return value;
}

/**
 * Définir une valeur de configuration
 */
function setConfigValue(key, value) {
  const config = loadConfig();
  const keys = key.split('.');
  
  let current = config;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (!(k in current)) {
      current[k] = {};
    }
    current = current[k];
  }
  
  const lastKey = keys[keys.length - 1];
  
  // Essayer de parser comme JSON si c'est une string
  try {
    current[lastKey] = JSON.parse(value);
  } catch {
    current[lastKey] = value;
  }
  
  return saveConfig(config);
}

/**
 * Réinitialiser la configuration
 */
function resetConfig() {
  return saveConfig(DEFAULT_CONFIG);
}

/**
 * Obtenir chemin du fichier de config
 */
function getConfigPath() {
  return CONFIG_FILE;
}

module.exports = {
  loadConfig,
  saveConfig,
  getConfigValue,
  setConfigValue,
  resetConfig,
  getConfigPath,
  DEFAULT_CONFIG
};
