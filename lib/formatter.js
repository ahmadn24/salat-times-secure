const chalk = require('chalk');
const moment = require('moment-timezone');
const { table } = require('table');
const { calculateDistance, getDirectionName } = require('./api');

// Emojis pour les prières
const PRAYER_EMOJIS = {
  fajr: '🌅',
  sunrise: '☀️',
  dhuhr: '🕌',
  asr: '🌆',
  maghrib: '🌙',
  isha: '🌃'
};

// Noms des prières en différentes langues
const PRAYER_NAMES = {
  ar: {
    fajr: 'فجر',
    sunrise: 'شروق',
    dhuhr: 'ظهر',
    asr: 'عصر',
    maghrib: 'مغرب',
    isha: 'عشاء'
  },
  fr: {
    fajr: 'Fajr',
    sunrise: 'Lever',
    dhuhr: 'Dhuhr',
    asr: 'Asr',
    maghrib: 'Maghrib',
    isha: 'Isha'
  },
  en: {
    fajr: 'Fajr',
    sunrise: 'Sunrise',
    dhuhr: 'Dhuhr',
    asr: 'Asr',
    maghrib: 'Maghrib',
    isha: 'Isha'
  }
};

/**
 * Formater l'affichage principal des horaires
 */
function formatTimes(times, location, method, lang = 'fr') {
  const names = PRAYER_NAMES[lang];
  const now = moment();
  const date = moment().format('dddd D MMMM YYYY');
  
  let output = '\n';
  output += chalk.bold.cyan(`🕌 Horaires de Prière - ${date}\n`);
  
  // Localisation
  if (location.city) {
    output += chalk.gray(`📍 ${location.city}`);
    if (location.country) {
      output += chalk.gray(`, ${location.country}`);
    }
  }
  if (times.meta?.location?.latitude) {
    output += chalk.gray(` (${times.meta.location.latitude.toFixed(4)}°N, ${times.meta.location.longitude.toFixed(4)}°E)`);
  }
  output += '\n';
  
  // Méthode
  output += chalk.gray(`⚙️  Méthode: ${times.meta?.method || method}\n\n`);
  
  // Horaires
  const prayers = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
  let nextPrayerFound = false;
  
  prayers.forEach(prayer => {
    if (!times[prayer]) return;
    
    const prayerTime = moment(times[prayer], 'HH:mm');
    const isNext = !nextPrayerFound && prayerTime.isAfter(now);
    
    if (isNext) {
      nextPrayerFound = true;
    }
    
    const emoji = PRAYER_EMOJIS[prayer];
    const name = names[prayer].padEnd(8);
    const time = chalk.bold(times[prayer]);
    
    let line = `${emoji} ${name}: ${time}`;
    
    // Indicateur prochaine prière
    if (isNext) {
      const duration = moment.duration(prayerTime.diff(now));
      const hours = Math.floor(duration.asHours());
      const minutes = duration.minutes();
      
      line += chalk.yellow(` ⬅️ PROCHAINE `);
      line += chalk.gray(`(dans ${hours}h ${minutes}min)`);
    } else if (prayerTime.isBefore(now)) {
      const duration = moment.duration(now.diff(prayerTime));
      const hours = Math.floor(duration.asHours());
      const minutes = duration.minutes();
      
      if (hours === 0 && minutes < 30) {
        line += chalk.gray(` (il y a ${minutes}min)`);
      }
    }
    
    output += line + '\n';
  });
  
  output += '\n';
  
  return output;
}

/**
 * Formater prochaine prière
 */
function formatNext(next, lang = 'fr') {
  const names = PRAYER_NAMES[lang];
  const arabicNames = PRAYER_NAMES.ar;
  
  let output = '\n';
  output += chalk.bold.cyan('🕌 PROCHAINE PRIÈRE\n\n');
  
  const emoji = PRAYER_EMOJIS[next.name];
  const nameFr = names[next.name];
  const nameAr = arabicNames[next.name];
  
  output += chalk.bold(`${emoji} ${nameFr} (${nameAr})\n`);
  output += chalk.bold.yellow(`⏰ ${next.time}\n`);
  
  if (next.tomorrow) {
    output += chalk.gray('📅 Demain\n');
  } else if (next.remaining) {
    const hours = Math.floor(next.remaining.asHours());
    const minutes = next.remaining.minutes();
    output += chalk.gray(`⏳ Dans ${hours} heures ${minutes} minutes\n`);
  }
  
  output += '\n';
  
  return output;
}

/**
 * Formater direction Qibla
 */
function formatQibla(qibla, lang = 'fr') {
  const direction = qibla.direction;
  const compassDir = getDirectionName(direction);
  const distance = calculateDistance(qibla.latitude, qibla.longitude);
  
  let output = '\n';
  output += chalk.bold.cyan('🧭 DIRECTION QIBLA\n\n');
  output += chalk.gray(`📍 Votre Position: ${qibla.latitude.toFixed(4)}°N, ${qibla.longitude.toFixed(4)}°E\n`);
  output += chalk.gray(`🕋 Kaaba: Makkah, Arabie Saoudite\n\n`);
  
  output += chalk.bold(`Direction : ${direction.toFixed(1)}° (${compassDir})\n`);
  output += chalk.bold(`Distance  : ${distance.toLocaleString()} km\n\n`);
  
  // Boussole ASCII
  output += chalk.gray('Orientation:\n');
  output += chalk.gray('    N (0°)\n');
  output += chalk.gray('    ↑\n');
  output += chalk.gray('W ← + → E\n');
  output += chalk.gray('    ↓\n');
  output += chalk.gray('    S (180°)\n\n');
  
  output += chalk.yellow(`→ La Qibla est à ${direction.toFixed(0)}° (${getDirectionDescription(compassDir, lang)})\n\n`);
  
  return output;
}

/**
 * Formater calendrier mensuel
 */
function formatMonth(calendar, location, method, lang = 'fr') {
  const names = PRAYER_NAMES[lang];
  
  const firstDate = moment(calendar[0].date, 'DD-MM-YYYY');
  const monthName = firstDate.format('MMMM YYYY');
  
  let output = '\n';
  output += chalk.bold.cyan(`🗓️  ${monthName.toUpperCase()} - HORAIRES DE PRIÈRE\n`);
  
  if (location.city) {
    output += chalk.gray(`📍 ${location.city}`);
    if (location.country) {
      output += chalk.gray(`, ${location.country}`);
    }
    output += '\n';
  }
  
  output += '\n';
  
  // Tableau
  const data = [
    ['Date', 'Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
  ];
  
  calendar.forEach(day => {
    const date = moment(day.date, 'DD-MM-YYYY').format('DD MMM');
    data.push([
      date,
      day.fajr,
      day.sunrise,
      day.dhuhr,
      day.asr,
      day.maghrib,
      day.isha
    ]);
  });
  
  output += table(data, {
    border: {
      topBody: '─',
      topJoin: '┬',
      topLeft: '┌',
      topRight: '┐',
      bottomBody: '─',
      bottomJoin: '┴',
      bottomLeft: '└',
      bottomRight: '┘',
      bodyLeft: '│',
      bodyRight: '│',
      bodyJoin: '│',
      joinBody: '─',
      joinLeft: '├',
      joinRight: '┤',
      joinJoin: '┼'
    }
  });
  
  return output;
}

/**
 * Formater en mode compact
 */
function formatCompact(times, location, method, lang = 'fr') {
  const city = location.city || 'Position';
  const prayers = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
  
  const timesStr = prayers
    .filter(p => times[p])
    .map(p => `${p}:${times[p]}`)
    .join(' | ');
  
  return `🕌 ${city} | ${timesStr}`;
}

/**
 * Description textuelle direction
 */
function getDirectionDescription(compassDir, lang) {
  const descriptions = {
    fr: {
      'N': 'plein nord',
      'NNE': 'nord-nord-est',
      'NE': 'nord-est',
      'ENE': 'est-nord-est',
      'E': 'plein est',
      'ESE': 'est-sud-est',
      'SE': 'sud-est',
      'SSE': 'sud-sud-est',
      'S': 'plein sud',
      'SSW': 'sud-sud-ouest',
      'SW': 'sud-ouest',
      'WSW': 'ouest-sud-ouest',
      'W': 'plein ouest',
      'WNW': 'ouest-nord-ouest',
      'NW': 'nord-ouest',
      'NNW': 'nord-nord-ouest'
    },
    en: {
      'N': 'due north',
      'NE': 'northeast',
      'E': 'due east',
      'SE': 'southeast',
      'S': 'due south',
      'SW': 'southwest',
      'W': 'due west',
      'NW': 'northwest'
    }
  };
  
  return descriptions[lang]?.[compassDir] || compassDir;
}

module.exports = {
  formatTimes,
  formatNext,
  formatQibla,
  formatMonth,
  formatCompact
};
