---
name: salat-times
description: Horaires de priÃ¨re prÃ©cis avec gÃ©olocalisation, toutes mÃ©thodes de calcul, notifications et direction Qibla
homepage: https://github.com/arabclaw/salat-times-secure
version: 1.0.0
metadata:
  openclaw:
    emoji: "ð"
    tags: ["islamic", "prayer", "salat", "arabic", "muslim"]
    requires:
      bins: ["node"]
      env: []
    install:
      - id: npm
        kind: node
        package: "axios moment-timezone moment-hijri"
        bins: []
        label: "Installer dÃ©pendances (npm)"
---

# ð Salat Times - Horaires de PriÃ¨re

Le skill le plus complet pour les horaires de priÃ¨re islamique avec gÃ©olocalisation automatique, toutes les mÃ©thodes de calcul, notifications intelligentes et direction Qibla.

## â¨ FonctionnalitÃ©s

### ð GÃ©olocalisation Automatique
- DÃ©tection automatique de votre position
- Support manuel par ville/pays/coordonnÃ©es
- Cache de localisation

### ð¿ MÃ©thodes de Calcul
Support de **12 Ã©coles juridiques** :
- Muslim World League (MWL)
- Islamic Society of North America (ISNA)
- Egyptian General Authority of Survey
- Umm Al-Qura University, Makkah
- University of Islamic Sciences, Karachi
- Institute of Geophysics, University of Tehran
- Shia Ithna-Ashari, Leva Institute, Qum
- Gulf Region
- Kuwait
- Qatar
- Majlis Ugama Islam Singapura, Singapore
- Union Organization Islamic de France (UOIF)
- Diyanet Ä°Åleri BaÅkanlÄ±ÄÄ±, Turkey
- Spiritual Administration of Muslims of Russia

### ð Horaires Disponibles
- **Fajr** (ÙØ¬Ø±) - Aube
- **Sunrise** (Ø´Ø±ÙÙ) - Lever du soleil
- **Dhuhr** (Ø¸ÙØ±) - Midi
- **Asr** (Ø¹ØµØ±) - AprÃ¨s-midi
- **Maghrib** (ÙØºØ±Ø¨) - Coucher du soleil
- **Isha** (Ø¹Ø´Ø§Ø¡) - Nuit

### ð Notifications Intelligentes
- Rappels avant chaque priÃ¨re (configurable)
- IntÃ©gration WhatsApp/Telegram
- Notifications systÃ¨me
- Cron jobs automatiques

### ð§­ Direction Qibla
- Calcul prÃ©cis de la direction
- Distance de la Kaaba
- Angle exact en degrÃ©s

### ð FonctionnalitÃ©s AvancÃ©es
- Export calendrier (.ics)
- Calendrier mensuel
- Calendrier annuel
- Cache offline
- Support multi-langue (AR/FR/EN)
- Ajustements manuels par priÃ¨re
- Fuseau horaire automatique

## ð Installation

```bash
# 1. CrÃ©er le dossier skill
mkdir -p ~/.openclaw/skills/salat-times
cd ~/.openclaw/skills/salat-times

# 2. Copier les fichiers du skill

# 3. Installer dÃ©pendances
npm install
```

## ð Utilisation

### Horaires Aujourd'hui (Auto-localisation)

```bash
salat-times
```

**Sortie** :
```
ð Horaires de PriÃ¨re - Mardi 17 FÃ©vrier 2026
ð Paris, France (48.8566Â°N, 2.3522Â°E)
âï¸  MÃ©thode: Muslim World League

ð Fajr    : 06:23  (dans 8h 15min)
âï¸  Sunrise : 07:52
ð Dhuhr   : 13:42  â¬ï¸ PROCHAINE (dans 14h 34min)
ð Asr     : 16:18
ð Maghrib : 18:45
ð Isha    : 20:15

ð§­ Qibla: 119Â° (ESE) - 3,287 km
```

### Prochaine PriÃ¨re

```bash
salat-times --next
```

**Sortie** :
```
ð PROCHAINE PRIÃRE

Dhuhr (Ø¸ÙØ±)
â° 13:42
â³ Dans 2 heures 34 minutes
```

### Localisation Manuelle

```bash
# Par ville
salat-times --city "Casablanca"

# Par ville et pays
salat-times --city "Lyon" --country "France"

# Par coordonnÃ©es GPS
salat-times --lat 33.5731 --lon -7.5898

# Adresse complÃ¨te
salat-times --address "MosquÃ©e de Paris, France"
```

### Changer MÃ©thode de Calcul

```bash
# Liste des mÃ©thodes
salat-times --methods

# Utiliser une mÃ©thode spÃ©cifique
salat-times --method "UOIF"          # Pour France
salat-times --method "Karachi"       # Pour Pakistan
salat-times --method "Turkey"        # Pour Turquie
salat-times --method "MWL"           # Muslim World League (dÃ©faut)
```

### Calendrier Mensuel

```bash
# Mois courant
salat-times --month

# Mois spÃ©cifique
salat-times --month 3 --year 2026

# Export format calendrier
salat-times --month --export calendar.ics
```

**Sortie** :
```
ðï¸  FÃVRIER 2026 - HORAIRES DE PRIÃRE
ð Paris, France

Date       Fajr   Sunrise  Dhuhr   Asr     Maghrib  Isha
âââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
01 FÃ©v     06:45  08:15    13:35   16:05   18:30    20:00
02 FÃ©v     06:44  08:14    13:36   16:06   18:31    20:01
03 FÃ©v     06:43  08:13    13:37   16:07   18:32    20:02
...
28 FÃ©v     06:10  07:40    13:48   16:25   18:50    20:25
```

### Direction Qibla

```bash
salat-times --qibla
```

**Sortie** :
```
ð§­ DIRECTION QIBLA

ð Votre Position: Paris, France
ð Kaaba: Makkah, Arabie Saoudite

Direction : 119.2Â° (ESE - Est-Sud-Est)
Distance  : 3,287 km
Azimut    : 119Â° 12' 34"

Orientation:
    N (0Â°)
    â
W â + â E
    â
    S (180Â°)

â La Qibla est Ã  119Â° (lÃ©gÃ¨rement vers l'est-sud-est)
```

### Notifications

```bash
# Activer notifications (10 min avant chaque priÃ¨re)
salat-times --notify --before 10

# Notifications via WhatsApp
salat-times --notify --channel whatsapp --to "+33612345678"

# Notifications via Telegram
salat-times --notify --channel telegram --to "@mehdi"

# Configurer cron job (notifications automatiques)
salat-times --setup-cron
```

### Ajustements Manuels

```bash
# Ajouter 2 minutes Ã  Fajr
salat-times --adjust fajr +2

# Retirer 1 minute de Isha
salat-times --adjust isha -1

# Voir ajustements actuels
salat-times --adjustments

# RÃ©initialiser ajustements
salat-times --reset-adjustments
```

### Options de Langue

```bash
# Arabe
salat-times --lang ar

# FranÃ§ais (dÃ©faut)
salat-times --lang fr

# Anglais
salat-times --lang en
```

### Mode Compact

```bash
# Format court
salat-times --compact

# Format JSON (pour scripting)
salat-times --json
```

## âï¸ Configuration

### Fichier de Configuration

Localisation : `~/.openclaw/skills/salat-times/config.json`

```json
{
  "location": {
    "city": "Paris",
    "country": "France",
    "latitude": 48.8566,
    "longitude": 2.3522,
    "timezone": "Europe/Paris"
  },
  "method": "UOIF",
  "language": "fr",
  "adjustments": {
    "fajr": 0,
    "dhuhr": 0,
    "asr": 0,
    "maghrib": 0,
    "isha": 0
  },
  "notifications": {
    "enabled": true,
    "before_minutes": 10,
    "channel": "whatsapp",
    "recipient": "+33612345678"
  },
  "cache": {
    "enabled": true,
    "duration_hours": 24
  }
}
```

### Configuration via CLI

```bash
# DÃ©finir localisation par dÃ©faut
salat-times config set location.city "Casablanca"
salat-times config set location.country "Morocco"

# DÃ©finir mÃ©thode par dÃ©faut
salat-times config set method "MWL"

# DÃ©finir langue
salat-times config set language "ar"

# Voir configuration actuelle
salat-times config show
```

## ð§ MÃ©thodes de Calcul DÃ©taillÃ©es

| Code | Nom | RÃ©gion | Fajr Angle | Isha Angle |
|------|-----|--------|------------|------------|
| MWL | Muslim World League | Mondial | 18Â° | 17Â° |
| ISNA | Islamic Society of North America | AmÃ©rique du Nord | 15Â° | 15Â° |
| Egypt | Egyptian General Authority | Ãgypte | 19.5Â° | 17.5Â° |
| Makkah | Umm Al-Qura, Makkah | Arabie Saoudite | 18.5Â° | 90 min |
| Karachi | University of Islamic Sciences | Pakistan | 18Â° | 18Â° |
| Tehran | Institute of Geophysics | Iran | 17.7Â° | 14Â° |
| Jafari | Shia Ithna-Ashari | Chiite | 16Â° | 14Â° |
| Gulf | Gulf Region | Golfe | 19.5Â° | 90 min |
| Kuwait | Kuwait | KoweÃ¯t | 18Â° | 17.5Â° |
| Qatar | Qatar | Qatar | 18Â° | 90 min |
| Singapore | Majlis Ugama Islam | Singapour | 20Â° | 18Â° |
| UOIF | Union des Organisations Islamiques | France | 12Â° | 12Â° |
| Turkey | Diyanet Ä°Åleri BaÅkanlÄ±ÄÄ± | Turquie | 18Â° | 17Â° |
| Russia | Spiritual Administration | Russie | 16Â° | 15Â° |

## ð± IntÃ©grations

### Cron Job Automatique

```bash
# Installer cron job (notifications quotidiennes)
salat-times --setup-cron

# DÃ©sinstaller
salat-times --remove-cron
```

CrÃ©e automatiquement un cron job OpenClaw qui :
- Calcule horaires chaque jour Ã  4h du matin
- Envoie notifications avant chaque priÃ¨re
- Met Ã  jour le cache

### WhatsApp

```bash
# Recevoir horaires quotidiens par WhatsApp
salat-times --daily --channel whatsapp --to "+33612345678" --time "05:00"
```

### Telegram

```bash
# Recevoir notifications Telegram
salat-times --notify --channel telegram --to "@mehdi"
```

## ð API UtilisÃ©e

**Aladhan Prayer Times API**
- URL: https://aladhan.com/prayer-times-api
- Gratuit et open-source
- PrÃ©cision astronomique
- Couvre le monde entier

## ð§ª Exemples d'Usage

### Cas 1 : Setup Initial (France)

```bash
# Configuration initiale
salat-times config set location.city "Lyon"
salat-times config set method "UOIF"
salat-times config set language "fr"

# Horaires du jour
salat-times
```

### Cas 2 : Voyage (Maroc)

```bash
# Horaires temporaires pour Casablanca
salat-times --city "Casablanca" --country "Morocco"

# Changer mÃ©thode pour le Maroc
salat-times --city "Casablanca" --method "MWL"
```

### Cas 3 : Notifications Ramadan

```bash
# Activer notifications 15 min avant
salat-times --notify --before 15 --channel whatsapp

# Calendrier complet du mois
salat-times --month
```

### Cas 4 : Plusieurs Villes

```bash
# Paris
salat-times --city "Paris"

# Londres
salat-times --city "London" --country "UK"

# New York
salat-times --city "New York" --country "USA" --method "ISNA"
```

## ð Troubleshooting

### Erreur de gÃ©olocalisation

```bash
# Utiliser coordonnÃ©es manuelles
salat-times --lat 48.8566 --lon 2.3522
```

### Cache corrompu

```bash
# Nettoyer cache
salat-times --clear-cache
```

### Horaires incorrects

```bash
# VÃ©rifier mÃ©thode de calcul
salat-times --methods

# Essayer une autre mÃ©thode
salat-times --method "Egypt"
```

## ð Ressources

- [Aladhan API Documentation](https://aladhan.com/prayer-times-api)
- [MÃ©thodes de Calcul](https://aladhan.com/calculation-methods)
- [IslamicFinder](https://www.islamicfinder.org/)

## ð¤ Contribution

Contributions bienvenues ! 

GitHub: https://github.com/arabclaw/salat-times-secure

## ð License

MIT License

## ð¨âð» Auteur

CrÃ©Ã© par [@MDI](https://github.com/mdi) pour la communautÃ© OpenClaw arabophone.

---

**ð Qu'Allah accepte vos priÃ¨res | ØªÙØ¨Ù Ø§ÙÙÙ ØµÙØ§ØªÙÙ**
