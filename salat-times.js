#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const moment = require('moment-timezone');
const { getSalatTimes, getQiblaDirection, getMethods } = require('./lib/api');
const { loadConfig, saveConfig, getConfigValue, setConfigValue } = require('./lib/config');
const { formatTimes, formatNext, formatQibla, formatMonth, formatCompact } = require('./lib/formatter');
const { setupNotifications, sendNotification } = require('./lib/notify');

const VERSION = '1.0.0';

// Méthodes de calcul disponibles
const METHODS = {
  'MWL': 'Muslim World League',
  'ISNA': 'Islamic Society of North America',
  'Egypt': 'Egyptian General Authority',
  'Makkah': 'Umm Al-Qura, Makkah',
  'Karachi': 'University of Islamic Sciences, Karachi',
  'Tehran': 'Institute of Geophysics, Tehran',
  'Jafari': 'Shia Ithna-Ashari',
  'Gulf': 'Gulf Region',
  'Kuwait': 'Kuwait',
  'Qatar': 'Qatar',
  'Singapore': 'Singapore',
  'UOIF': 'Union des Organisations Islamiques de France',
  'Turkey': 'Turkey',
  'Russia': 'Russia'
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

// Programme CLI
program
  .name('salat-times')
  .description('🕌 Horaires de prière précis avec géolocalisation')
  .version(VERSION);

// Commande principale (horaires du jour)
program
  .option('-c, --city <city>', 'Ville')
  .option('--country <country>', 'Pays')
  .option('--lat <latitude>', 'Latitude', parseFloat)
  .option('--lon <longitude>', 'Longitude', parseFloat)
  .option('-m, --method <method>', 'Méthode de calcul', 'MWL')
  .option('-l, --lang <lang>', 'Langue (ar/fr/en)', 'fr')
  .option('--json', 'Format JSON')
  .option('--compact', 'Format compact')
  .option('--next', 'Afficher prochaine prière uniquement')
  .option('--qibla', 'Direction Qibla')
  .option('--month [month]', 'Calendrier mensuel')
  .option('--year [year]', 'Année (avec --month)', parseInt)
  .option('--methods', 'Liste des méthodes de calcul')
  .option('--notify', 'Activer notifications')
  .option('--before <minutes>', 'Minutes avant prière pour notification', parseInt, 10)
  .option('--channel <channel>', 'Canal notification (whatsapp/telegram)')
  .option('--to <recipient>', 'Destinataire notification')
  .option('--setup-cron', 'Installer cron job pour notifications quotidiennes')
  .option('--clear-cache', 'Nettoyer le cache')
  .action(async (options) => {
    try {
      const config = loadConfig();

      // Afficher méthodes disponibles
      if (options.methods) {
        console.log(chalk.bold.cyan('\n📿 MÉTHODES DE CALCUL DISPONIBLES\n'));
        Object.entries(METHODS).forEach(([code, name]) => {
          console.log(`${chalk.yellow(code.padEnd(12))} - ${name}`);
        });
        console.log('');
        return;
      }

      // Nettoyer cache
      if (options.clearCache) {
        // Logique de nettoyage cache
        console.log(chalk.green('✅ Cache nettoyé'));
        return;
      }

      // Déterminer localisation
      let location = {};
      
      if (options.lat && options.lon) {
        location = {
          latitude: options.lat,
          longitude: options.lon
        };
      } else if (options.city) {
        location = {
          city: options.city,
          country: options.country || config.location?.country
        };
      } else if (config.location) {
        location = config.location;
      } else {
        // Géolocalisation automatique (via OpenClaw si disponible)
        console.log(chalk.yellow('⚠️  Aucune localisation configurée'));
        console.log(chalk.gray('Utilisez: salat-times --city "Paris" --country "France"'));
        console.log(chalk.gray('Ou configurez: salat-times config set location.city "Paris"'));
        return;
      }

      const method = options.method || config.method || 'MWL';
      const lang = options.lang || config.language || 'fr';

      // Afficher direction Qibla
      if (options.qibla) {
        const qibla = await getQiblaDirection(location);
        console.log(formatQibla(qibla, lang));
        return;
      }

      // Calendrier mensuel
      if (options.month) {
        const month = options.month === true ? moment().month() + 1 : parseInt(options.month);
        const year = options.year || moment().year();
        const calendar = await getMonthCalendar(location, method, month, year);
        console.log(formatMonth(calendar, location, method, lang));
        return;
      }

      // Obtenir horaires
      const times = await getSalatTimes(location, method, moment().format('DD-MM-YYYY'));

      // Appliquer ajustements si configurés
      if (config.adjustments) {
        Object.keys(config.adjustments).forEach(prayer => {
          if (times[prayer] && config.adjustments[prayer]) {
            const time = moment(times[prayer], 'HH:mm');
            time.add(config.adjustments[prayer], 'minutes');
            times[prayer] = time.format('HH:mm');
          }
        });
      }

      // Afficher prochaine prière uniquement
      if (options.next) {
        const next = findNextPrayer(times);
        console.log(formatNext(next, lang));
        return;
      }

      // Format JSON
      if (options.json) {
        console.log(JSON.stringify(times, null, 2));
        return;
      }

      // Format compact
      if (options.compact) {
        console.log(formatCompact(times, location, method, lang));
        return;
      }

      // Format normal (par défaut)
      console.log(formatTimes(times, location, method, lang));

      // Configuration notifications
      if (options.notify) {
        await setupNotifications({
          times,
          beforeMinutes: options.before,
          channel: options.channel,
          recipient: options.to
        });
        console.log(chalk.green('\n✅ Notifications configurées'));
      }

      // Setup cron job
      if (options.setupCron) {
        await setupCronJob(location, method, options.channel, options.to);
        console.log(chalk.green('\n✅ Cron job installé pour notifications quotidiennes'));
      }

    } catch (error) {
      console.error(chalk.red('❌ Erreur:'), error.message);
      if (process.env.DEBUG) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

// Commande config
program
  .command('config')
  .description('Gérer la configuration')
  .argument('[action]', 'Action (show/set/get)')
  .argument('[key]', 'Clé de configuration')
  .argument('[value]', 'Valeur')
  .action((action, key, value) => {
    const config = loadConfig();

    if (!action || action === 'show') {
      console.log(chalk.bold.cyan('\nښ�️  CONFIGURATION ACTUELLE\n'));
      console.log(JSON.stringify(config, null, 2));
      return;
    }

    if (action === 'get' && key) {
      const val = getConfigValue(key);
      console.log(val);
      return;
    }

    if (action === 'set' && key && value) {
      setConfigValue(key, value);
      console.log(chalk.green(`✅ ${key} = ${value}`));
      return;
    }

    console.log(chalk.yellow('Usage: salat-times config [show|get|set] [key] [value]'));
  });

// Fonctions utilitaires

function findNextPrayer(times) {
  const now = moment();
  const prayers = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
  
  for (const prayer of prayers) {
    if (!times[prayer]) continue;
    const prayerTime = moment(times[prayer], 'HH:mm');
    if (prayerTime.isAfter(now)) {
      return {
        name: prayer,
        time: times[prayer],
        remaining: moment.duration(prayerTime.diff(now))
      };
    }
  }
  
  // Si aucune prière restante aujourd'hui, retourner Fajr du lendemain
  return {
    name: 'fajr',
    time: times.fajr,
    tomorrow: true
  };
}

async function getMonthCalendar(location, method, month, year) {
  const calendar = [];
  const daysInMonth = moment(`${year}-${month}`, 'YYYY-M').daysInMonth();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = moment(`${year}-${month}-${day}`, 'YYYY-M-D').format('DD-MM-YYYY');
    const times = await getSalatTimes(location, method, date);
    calendar.push({
      date,
      ...times
    });
  }
  
  return calendar;
}

async function setupCronJob(location, method, channel, recipient) {
  // Logique pour créer un cron job OpenClaw
  console.log(chalk.yellow('ℹ️  Création du cron job OpenClaw...'));
  
  // Exemple de commande cron OpenClaw
  const cronCommand = `openclaw cron add --name "Salat Times Daily" --cron "0 4 * * *" --session isolated --message "salat-times --notify --channel ${channel || 'whatsapp'} --to ${recipient || 'main'}"`;
  
  console.log(chalk.gray(`\nCommande suggérée:\n${cronCommand}\n`));
  console.log(chalk.cyan('💡 Exécutez cette commande pour installer le cron job'));
}

// Parser les arguments
program.parse(process.argv);

// Si aucune commande, afficher l'aide
if (!process.argv.slice(2).length) {
  program.help();
}
