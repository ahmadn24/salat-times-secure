# ✅ CHECKLIST VÉRIFICATION - Salat Times Secure

**Version** : 1.0.0-secure  
**Date** : 17 Février 2026  

---

## 📋 VÉRIFICATION INSTALLATION

### 1. Structure Fichiers

```bash
cd ~/.openclaw/skills/salat-times

# Vérifier structure
tree -L 2

# Doit afficher :
# .
# ├── SKILL.md
# ├── README.md
# ├── README-INSTALL.md
# ├── SECURITY-AUDIT.md
# ├── CHANGES.md
# ├── package.json
# ├── salat-times.js
# ├── setup.sh
# ├── lib/
# │   ├── api.js
# │   ├── config.js
# │   ├── formatter.js
# │   ├── notify.js
# │   └── sanitize.js          ← NOUVEAU (critique)
# └── locales/
#     ├── ar.json
#     ├── fr.json
#     └── en.json
```

**Statut** : [ ] ✅ Complet / [ ] ❌ Fichiers manquants

---

### 2. Dépendances

```bash
# Vérifier package.json contient validator
grep "validator" package.json

# Doit afficher :
# "validator": "^13.11.0"
```

**Statut** : [ ] ✅ OK / [ ] ❌ Manquant

```bash
# Installer dépendances
npm install

# Vérifier que validator est installé
ls node_modules/ | grep validator

# Doit afficher :
# validator
```

**Statut** : [ ] ✅ Installé / [ ] ❌ Erreur

---

### 3. Permissions

```bash
# Vérifier exécutables
ls -la salat-times.js setup.sh

# Doit afficher :
# -rwxr-xr-x ... salat-times.js
# -rwxr-xr-x ... setup.sh
```

**Statut** : [ ] ✅ OK / [ ] ❌ À corriger

```bash
# Si nécessaire :
chmod +x salat-times.js setup.sh
```

---

### 4. Vérification Sécurité Sanitize

```bash
# Vérifier que lib/sanitize.js existe
cat lib/sanitize.js | head -20

# Doit contenir :
# const validator = require('validator');
# function sanitizeCoordinates(lat, lon) {
```

**Statut** : [ ] ✅ Présent / [ ] ❌ Manquant

---

### 5. Vérification Sécurité notify.js

```bash
# Vérifier que notify.js utilise execFile
grep "execFile" lib/notify.js

# Doit afficher plusieurs lignes avec execFile

# Vérifier qu'il n'y a PAS de exec() dangereux
grep "exec(" lib/notify.js | grep -v "execFile"

# Ne doit rien afficher (ou seulement dans commentaires)
```

**Statut** : [ ] ✅ Sécurisé / [ ] ❌ Vulnérable

---

### 6. Vérification Sécurité api.js

```bash
# Vérifier timeout
grep "timeout" lib/api.js

# Doit afficher :
# timeout: 10000

# Vérifier validation
grep "sanitize" lib/api.js

# Doit afficher plusieurs lignes
```

**Statut** : [ ] ✅ Sécurisé / [ ] ❌ Manquant

---

## 🧪 TESTS SÉCURITÉ

### Test 1 : Fuzzing Command Injection

```bash
# Test injection city
./salat-times.js --city "Paris'; DROP TABLE;"

# Doit afficher :
# ❌ Error: City contains invalid characters
```

**Statut** : [ ] ✅ Bloqué / [ ] ❌ DANGER

```bash
# Test injection path traversal
./salat-times.js --city "../../../etc/passwd"

# Doit afficher :
# ❌ Error: City contains invalid characters
```

**Statut** : [ ] ✅ Bloqué / [ ] ❌ DANGER

```bash
# Test injection commande
./salat-times.js --city '$(whoami)'

# Doit afficher :
# ❌ Error: City contains invalid characters
```

**Statut** : [ ] ✅ Bloqué / [ ] ❌ DANGER

---

### Test 2 : npm audit

```bash
# Scanner vulnérabilités
npm audit

# Doit afficher :
# found 0 vulnerabilities
```

**Statut** : [ ] ✅ 0 vulns / [ ] ❌ Vulns trouvées

---

### Test 3 : Validation Coordonnées

```bash
# Test coordonnées invalides
./salat-times.js --lat 999 --lon 999

# Doit afficher :
# ❌ Error: Latitude must be between -90 and 90
```

**Statut** : [ ] ✅ Validé / [ ] ❌ Accepté

---

### Test 4 : Validation Méthode

```bash
# Test méthode invalide
./salat-times.js --method "INVALID"

# Doit afficher :
# ❌ Error: Invalid calculation method
```

**Statut** : [ ] ✅ Validé / [ ] ❌ Accepté

---

## 🚀 TESTS FONCTIONNELS

### Test 5 : Horaires Basiques

```bash
# Configuration
./salat-times.js config set location.city "Paris"
./salat-times.js config set location.country "France"
./salat-times.js config set method "UOIF"

# Afficher horaires
./salat-times.js

# Doit afficher :
# 🕌 Horaires de Prière - [Date]
# 📍 Paris, France
# 🌅 Fajr    : XX:XX
# ...
```

**Statut** : [ ] ✅ Fonctionne / [ ] ❌ Erreur

---

### Test 6 : Prochaine Prière

```bash
./salat-times.js --next

# Doit afficher :
# 🕌 PROCHAINE PRIÈRE
# [Nom prière]
# ⏰ XX:XX
```

**Statut** : [ ] ✅ Fonctionne / [ ] ❌ Erreur

---

### Test 7 : Direction Qibla

```bash
./salat-times.js --qibla

# Doit afficher :
# 🧭 DIRECTION QIBLA
# Direction : XXX°
# Distance  : X,XXX km
```

**Statut** : [ ] ✅ Fonctionne / [ ] ❌ Erreur

---

### Test 8 : Calendrier Mensuel

```bash
./salat-times.js --month

# Doit afficher :
# 🗓️  [MOIS] - HORAIRES DE PRIÈRE
# [Tableau avec dates et horaires]
```

**Statut** : [ ] ✅ Fonctionne / [ ] ❌ Erreur

---

### Test 9 : Autres Villes

```bash
# Casablanca
./salat-times.js --city "Casablanca" --country "Morocco"

# Londres
./salat-times.js --city "London" --country "UK"

# Doit afficher horaires pour chaque ville
```

**Statut** : [ ] ✅ Fonctionne / [ ] ❌ Erreur

---

### Test 10 : Toutes Méthodes

```bash
# Lister méthodes
./salat-times.js --methods

# Doit afficher :
# 📿 MÉTHODES DE CALCUL DISPONIBLES
# MWL      0  - Muslim World League
# ISNA        - ...
# [etc...]
```

**Statut** : [ ] ✅ Fonctionne / [ ] ❌ Erreur

```bash
# Tester méthode spécifique
./salat-times.js --city "Paris" --method "MWL"

# Doit fonctionner
```

**Statut** : [ ] ✅ Fonctionne / [ ] ❌ Erreur

---

## 📊 SCORE FINAL

### Sécurité

- [ ] ✅ lib/sanitize.js présent
- [ ] ✅ execFile utilisé (pas exec)
- [ ] ✅ Timeouts configurés
- [ ] ✅ Fuzzing tests passés
- [ ] ✅ npm audit clean
- [ ] ✅ Validation inputs active

**Score** : [ ] /6

---

### Fonctionnel

- [ ] ✅ Horaires s'affichent
- [ ] ✅ Prochaine prière fonctionne
- [ ] ✅ Qibla fonctionne
- [ ] ✅ Calendrier fonctionne
- [ ] ✅ Autres villes fonctionnent
- [ ] ✅ Toutes méthodes fonctionnent

**Score** : [ ] /6

---

## 🎯 STATUT GLOBAL

- [ ] ✅ **PRODUCTION READY** (12/12 tests passés)
- [ ] ⚠️ **CORRECTIONS NÉCESSAIRES** (< 12/12)
- [ ] ❌ **NE PAS DÉPLOYER** (tests sécurité échoués)

---

## 🔧 ACTIONS SI ÉCHEC

### Si tests sécurité échouent :

```bash
# Vérifier versions fichiers
md5sum lib/notify.js lib/api.js lib/sanitize.js

# Comparer avec versions sécurisées
# Réinstaller si nécessaire
```

### Si tests fonctionnels échouent :

```bash
# Vérifier logs
./salat-times.js [commande] 2>&1 | tee debug.log

# Vérifier dépendances
npm list

# Réinstaller
rm -rf node_modules package-lock.json
npm install
```

---

## 📞 SUPPORT

Si problèmes persistent :

1. Consulter SECURITY-AUDIT.md
2. Consulter README-INSTALL.md
3. Créer issue GitHub
4. Email : [email protected]

---

**Date vérification** : _______________  
**Vérifié par** : _______________  
**Statut** : [ ] ✅ OK / [ ] ❌ KO

---

**🔒 Ne déployez qu'après validation complète**
