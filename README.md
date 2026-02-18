# 🕌 Salat Times - Version Sécurisée

**Version** : 1.0.0-secure  
**Date** : 17 Février 2026  
**Status** : ✅ Production Ready  

---

## 🎯 À PROPOS

Skill OpenClaw pour horaires de prière islamique avec :
- ✅ 12 méthodes de calcul
- ✅ Géolocalisation automatique
- ✅ Direction Qibla
- ✅ Notifications WhatsApp/Telegram
- ✅ Calendrier mensuel
- ✅ Multi-langue (AR/FR/EN)
- ✅ **SÉCURISÉ** contre injections et attaques

---

## 🔒 SÉCURITÉ

Cette version inclut **TOUTES les corrections de sécurité** identifiées lors de l'audit :

### ✅ Corrections Appliquées

1. **Command Injection** (CRITIQUE) → ✅ CORRIGÉ
   - Remplacement `exec()` par `execFile()`
   - Validation stricte de tous inputs

2. **Input Validation** (HAUTE) → ✅ CORRIGÉ
   - Nouveau module `lib/sanitize.js`
   - Whitelist pour city, country, method, etc.

3. **HTTP Security** (MOYENNE) → ✅ CORRIGÉ
    - Timeouts 10 secondes
    - HTTPS obligatoire
    - Validation certificats SSL

4. **Rate Limiting** (MOYENNE) → ✅ CORRIGÉ
   - Cache local 24h
   - Prévention abus API

5. **Error Handling** (MOYENNE) → ✅ CORRIGÉ
   - Pas de leak d'informations sensibles
   - Logs sécurisés en production

**Score Sécurité** : 9.0/10 ⭐⭐⭐⭐⭐

Voir [SECURITY-AUDIT.md](SECURITY-AUDIT.md) pour détails complets.

---

## 📦 INSTALLATION

### Méthode 1 : Automatique (Recommandée)

```bash
# Télécharger et exécuter le script d'installation
./setup.sh
```

### Méthode 2 : Manuelle

```bash
# 1. Copier dans OpenClaw
cp -r salat-times-secure ~/.openclaw/skills/salat-times

# 2. Installer dépendances
cd ~/.openclaw/skills/salat-times
npm install

# 3. Tester
./salat-times.js --help
```

Voir [README-INSTALL.md](README-INSTALL.md) pour guide détaillé.

---

## 🚀 USAGE RAPIDE

### Configuration Initiale

```bash
# Définir localisation
./salat-times.js config set location.city "Paris"
./salat-times.js config set location.country "France"

# Choisir méthode
./salat-times.js config set method "UOIF"  # Pour France

# Définir langue
./salat-times.js config set language "fr"
```

### Commandes Principales

```bash
# Horaires aujourd'hui
./salat-times.js

# Prochaine prière
./salat-times.js --next

# Direction Qibla
./salat-times.js --qibla

# Calendrier mensuel
./salat-times.js --month

# Autre ville
./salat-times.js --city "Casablanca" --country "Morocco"
```

### Notifications

```bash
# Activer notifications WhatsApp (10 min avant chaque prière)
./salat-times.js --notify --channel whatsapp --to "+33612345678" --before 10

# Installer cron job pour notifications quotidiennes
./salat-times.js --setup-cron
```

---

## 📖 DOCUMENTATION

- **[SKILL.md](SKILL.md)** - Documentation complète (5000+ mots)
- **[README-INSTALL.md](README-INSTALL.md)** - Guide installation détaillé
- **[SECURITY-AUDIT.md](SECURITY-AUDIT.md)** - Audit sécurité complet
- **[CHANGES.md](CHANGES.md)** - Liste des corrections appliquées

---

## 📊 STRUCTURE

```
salat-times-secure/
├── SKILL.md                    # Documentation complète
├── README.md                   # Ce fichier
├── README-INSTALL.md           # Guide installation
├── SECURITY-AUDIT.md           # Audit sécurité
├── CHANGES.md                  # Corrections appliquées
├── package.json                # Dépendances (avec validator)
├── salat-times.js             # CLI principal
├── setup.sh                    # Script installation auto
├── lib/
│   ├── api.js                 # API Aladhan (SÉCURISÉ)
│   ├── config.js              # Configuration
│   ├── formatter.js           # Formatage sorties
│   ├── notify.js              # Notifications (SÉCURISÉ)
│   └── sanitize.js            # Validation inputs (NOUVEAU)
└── locales/
    ├── ar.json                # Traductions arabe
    ├── fr.json                # Traductions français
    └── en.json                # Traductions anglais
```

---

## 🔧 DÉPENDANCES

### Production

- `axios` ^1.6.0 - Requêtes HTTP
- `moment-timezone` ^0.5.45 - Fuseaux horaires
- `moment-hijri` ^2.1.2 - Calendrier hijri
- `chalk` ^4.1.2 - Couleurs terminal
- `commander` ^11.1.0 - CLI
- `node-cache` ^5.1.2 - Cache local
- `table` ^6.8.1 - Tableaux formatés
- `validator` ^13.11.0 - Validation inputs (**NOUVEAU**)

### Développement

- `eslint` ^8.55.0 - Linting
- `eslint-plugin-security` ^2.1.0 - Audit sécurité (**NOUVEAU**)

---

## ✅ TESTS

### Tests Sécurité

```bash
# Audit dépendances
npm audit

# Scan code avec ESLint Security
npm run lint

# Tests fuzzing (inputs malicieux)
./salat-times.js --city "Paris'; DROP TABLE;"     # Doit échouer
./salat-times.js --city "../../../etc/passwd"     # Doit échouer
./salat-times.js --city '$(whoami)'               # Doit échouer
```

### Tests Fonctionnels

```bash
# Horaires
./salat-times.js --city "Paris" --country "France"

# Direction Qibla
./salat-times.js --qibla --city "Paris"

# Calendrier
./salat-times.js --month

# Configuration
./salat-times.js config show
```

---

## 🆘 SUPPORT

### Problèmes Courants

**"Command not found: salat-times"**
```bash
# Solution : Utiliser chemin complet
./salat-times.js

# OU créer alias
echo 'alias salat="~/.openclaw/skills/salat-times/salat-times.js"' >> ~/.zshrc
```

**"Module not found: validator"**
```bash
# Solution : Réinstaller dépendances
npm install
```

**"Erreur API Aladhan"**
```bash
# Solution : Vérifier connexion Internet
ping api.aladhan.com

# Nettoyer cache
./salat-times.js --clear-cache
```

### Contact

- GitHub Issues : https://github.com/arabclaw/salat-times-secure/issues
- Email : [email protected]
- OpenClaw Discord : [Lien Discord]

---

## 📄 LICENSE

MIT License - Voir LICENSE file

---

## 👨‍💻 AUTEUR

Créé par arabclaw pour la communauté OpenClaw arabophone.

GitHub : @arabclaw  
Twitter : @arabclaw

---

## 🙏 REMERCIEMENTS

- **Aladhan API** : https://aladhan.com
- **OpenClaw Team** : https://openclaw.com
- **Communauté ArabClaw**

---

## 🔐 SÉCURITÉ

Pour reporter une vulnérabilité de sécurité :

📧 **Email** : [email protected]  
🔒 **PGP Key** : [Lien vers clé PGP]

**NE PAS** créer d'issue publique pour failles de sécurité.

---

## 📈 ROADMAP

### v1.1.0 (Prochaine version)

- [ ] Calendrier Hijri complet
- [ ] Export .ics pour Google Calendar
- [ ] Adhan audio (différents muezzins)
- [ ] Widget macOS pour barre menu
- [ ] Mode offline (cache 1 an)
- [ ] Tests unitaires complets
- [ ] CI/CD avec security checks

### v2.0.0 (Future)

- [ ] Application mobile (React Native)
- [ ] Synchronisation cloud
- [ ] Support Android Auto / CarPlay
- [ ] Intégration Alexa/Google Home
- [ ] API REST publique

---

**🕌 Qu'Allah accepte vos prières | تقبل الله صلاتكم**

**Version sécurisée - Production Ready ✅**
