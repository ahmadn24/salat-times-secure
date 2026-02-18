const moment = require('moment');
const { execFile } = require('child_process');
const util = require('util');
const { sanitizeRecipient, sanitizeMessage, sanitizeTime, sanitizeMethod, sanitizeCity, sanitizeCountry } = require('./sanitize');

const execFilePromise = util.promisify(execFile);

/**
 * Configurer notifications pour toutes les prières
 */
async function setupNotifications(options) {
  const { times, beforeMinutes = 10, channel = 'whatsapp', recipient } = options;
  
  // Valider inputs
  const safeRecipient = sanitizeRecipient(recipient);
  const safeBeforeMinutes = parseInt(beforeMinutes, 10);
  
  if (isNaN(safeBeforeMinutes) || safeBeforeMinutes < 0 || safeBeforeMinutes > 60) {
    throw new Error('beforeMinutes must be between 0 and 60');
  }
  
  const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const notifications = [];
  
  for (const prayer of prayers) {
    if (!times[prayer]) continue;
    
    const prayerTime = moment(times[prayer], 'HH:mm');
    const notifTime = prayerTime.clone().subtract(safeBeforeMinutes, 'minutes');
    
    // Ne pas créer de notification si l'heure est déjà passée
    if (notifTime.isBefore(moment())) {
      continue;
    }
    
    notifications.push({
      prayer,
      time: times[prayer],
      notifTime: notifTime.format('HH:mm'),
      beforeMinutes: safeBeforeMinutes
    });
  }
  
  // Créer les notifications selon le canal
  for (const notif of notifications) {
    await scheduleNotification(notif, channel, safeRecipient);
  }
  
  return notifications;
}

/**
 * Planifier une notification unique
 */
async function scheduleNotification(notif, channel, recipient) {
  const message = formatNotificationMessage(notif);
  
  if (channel === 'whatsapp') {
    return await sendWhatsAppNotification(message, recipient, notif.notifTime);
  } else if (channel === 'telegram') {
    return await sendTelegramNotification(message, recipient, notif.notifTime);
  } else if (channel === 'system') {
    return await sendSystemNotification(message, notif.notifTime);
  } else {
    throw new Error('Invalid channel. Must be whatsapp, telegram, or system');
  }
}

/**
 * Envoyer notification WhatsApp via OpenClaw
 * ✅ SÉCURISÉ : Utilise execFile avec array pour éviter command injection
 */
async function sendWhatsAppNotification(message, recipient, time) {
  try {
    // Valider tous les inputs
    const safeRecipient = sanitizeRecipient(recipient);
    const safeMessage = sanitizeMessage(message);
    const safeTime = sanitizeTime(time);
    
    // ✅ Utiliser execFile avec array d'arguments (pas de shell)
    const args = [
      'channels', 'send', 'whatsapp',
      '--to', safeRecipient,
      '--message', safeMessage,
      '--at', safeTime
    ];
    
    await execFilePromise('openclaw', args);
    return true;
  } catch (error) {
    // Ne logger que si en développement
    if (process.env.NODE_ENV === 'development') {
      console.error('Erreur notification WhatsApp:', error.message);
    }
    return false;
  }
}

/**
 * Envoyer notification Telegram via OpenClaw
 * ✅ SÉCURISÉ : Utilise execFile avec array
 */
async function sendTelegramNotification(message, recipient, time) {
  try {
    const safeRecipient = sanitizeRecipient(recipient);
    const safeMessage = sanitizeMessage(message);
    const safeTime = sanitizeTime(time);
    
    const args = [
      'channels', 'send', 'telegram',
      '--to', safeRecipient,
      '--message', safeMessage,
      '--at', safeTime
    ];
    
    await execFilePromise('openclaw', args);
    return true;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Erreur notification Telegram:', error.message);
    }
    return false;
  }
}

/**
 * Envoyer notification système (macOS)
 * ✅ SÉCURISÉ : Utilise execFile
 */
async function sendSystemNotification(message, time) {
  try {
    const safeMessage = sanitizeMessage(message);
    const safeTime = sanitizeTime(time);
    
    // Calculer délai en secondes
    const now = moment();
    const targetTime = moment(safeTime, 'HH:mm');
    const delay = targetTime.diff(now, 'seconds');
    
    if (delay <= 0) return false;
    
    // ✅ Utiliser execFile pour éviter injection
    const script = `display notification "${safeMessage.replace(/"/g, '\\"')}" with title "🕌 Salat Times" sound name "default"`;
    
    // Note: sleep + osascript nécessite shell, alternative plus sûre:
    setTimeout(async () => {
      try {
        await execFilePromise('osascript', ['-e', script]);
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Erreur notification système:', err.message);
        }
      }
    }, delay * 1000);
    
    return true;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Erreur notification système:', error.message);
    }
    return false;
  }
}

/**
 * Formater message de notification
 */
function formatNotificationMessage(notif, lang = 'fr') {
  const prayerNames = {
    fr: {
      fajr: 'Fajr',
      dhuhr: 'Dhuhr',
      asr: 'Asr',
      maghrib: 'Maghrib',
      isha: 'Isha'
    },
    ar: {
      fajr: 'فجر',
      dhuhr: 'ظهر',
      asr: 'عصر',
      maghrib: 'مغرب',
      isha: 'عشاء'
    },
    en: {
      fajr: 'Fajr',
      dhuhr: 'Dhuhr',
      asr: 'Asr',
      maghrib: 'Maghrib',
      isha: 'Isha'
    }
  };
  
  const messages = {
    fr: `🕌 Prière de ${prayerNames.fr[notif.prayer]} dans ${notif.beforeMinutes} minutes (${notif.time})`,
    ar: `🕌 صلاة ${prayerNames.ar[notif.prayer]} بعد ${notif.beforeMinutes} دقيقة (${notif.time})`,
    en: `🕌 ${prayerNames.en[notif.prayer]} prayer in ${notif.beforeMinutes} minutes (${notif.time})`
  };
  
  return messages[lang] || messages.fr;
}

/**
 * Envoyer notification immédiate
 */
async function sendNotification(message, channel = 'whatsapp', recipient = null) {
  if (channel === 'whatsapp') {
    return await sendWhatsAppNow(message, recipient);
  } else if (channel === 'telegram') {
    return await sendTelegramNow(message, recipient);
  } else if (channel === 'system') {
    return await sendSystemNow(message);
  } else {
    throw new Error('Invalid channel');
  }
}

async function sendWhatsAppNow(message, recipient) {
  try {
    const safeRecipient = sanitizeRecipient(recipient);
    const safeMessage = sanitizeMessage(message);
    
    const args = [
      'channels', 'send', 'whatsapp',
      '--to', safeRecipient,
      '--message', safeMessage
    ];
    
    await execFilePromise('openclaw', args);
    return true;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Erreur WhatsApp:', error.message);
    }
    return false;
  }
}

async function sendTelegramNow(message, recipient) {
  try {
    const safeRecipient = sanitizeRecipient(recipient);
    const safeMessage = sanitizeMessage(message);
    
    const args = [
      'channels', 'send', 'telegram',
      '--to', safeRecipient,
      '--message', safeMessage
    ];
    
    await execFilePromise('openclaw', args);
    return true;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Erreur Telegram:', error.message);
    }
    return false;
  }
}

async function sendSystemNow(message) {
  try {
    const safeMessage = sanitizeMessage(message);
    const script = `display notification "${safeMessage.replace(/"/g, '\\"')}" with title "🕌 Salat Times" sound name "default"`;
    
    await execFilePromise('osascript', ['-e', script]);
    return true;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Erreur notification système:', error.message);
    }
    return false;
  }
}

/**
 * Créer cron job quotidien pour notifications
 * ✅ SÉCURISÉ : Valide tous les inputs, utilise execFile
 */
async function setupDailyCron(location, method, channel, recipient, beforeMinutes = 10) {
  try {
    // Valider tous les inputs
    const safeMethod = sanitizeMethod(method);
    const safeRecipient = sanitizeRecipient(recipient);
    const safeBeforeMinutes = parseInt(beforeMinutes, 10);
    
    if (isNaN(safeBeforeMinutes) || safeBeforeMinutes < 0 || safeBeforeMinutes > 60) {
      throw new Error('beforeMinutes must be between 0 and 60');
    }
    
    if (!['whatsapp', 'telegram', 'system'].includes(channel)) {
      throw new Error('Invalid channel');
    }
    
    // Construire arguments de manière sécurisée
    let locationArgs = [];
    
    if (location.city) {
      const safeCity = sanitizeCity(location.city);
      locationArgs.push('--city', safeCity);
      
      if (location.country) {
        const safeCountry = sanitizeCountry(location.country);
        locationArgs.push('--country', safeCountry);
      }
    } else if (location.latitude && location.longitude) {
      const coords = sanitizeCoordinates(location.latitude, location.longitude);
      locationArgs.push('--lat', coords.latitude.toString(), '--lon', coords.longitude.toString());
    } else {
      throw new Error('Invalid location: must provide city or coordinates');
    }
    
    // Construire commande complète pour le cron
    const commandParts = [
      'salat-times',
      ...locationArgs,
      '--method', safeMethod,
      '--notify',
      '--before', safeBeforeMinutes.toString(),
      '--channel', channel,
      '--to', safeRecipient
    ];
    
    // Joindre avec espace pour message (sera parsé par OpenClaw, pas par shell)
    const commandMessage = commandParts.join(' ');
    
    // ✅ Utiliser execFile pour ajouter le cron
    const args = [
      'cron', 'add',
      '--name', 'Salat Times Daily Notifications',
      '--cron', '0 4 * * *',
      '--session', 'isolated',
      '--message', commandMessage
    ];
    
    await execFilePromise('openclaw', args);
    return true;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Erreur création cron job:', error.message);
    }
    throw error; // Re-throw pour que l'appelant sache
  }
}

/**
 * Supprimer cron job
 */
async function removeDailyCron() {
  try {
    const args = [
      'cron', 'remove',
      '--name', 'Salat Times Daily Notifications'
    ];
    
    await execFilePromise('openclaw', args);
    return true;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Erreur suppression cron job:', error.message);
    }
    return false;
  }
}

module.exports = {
  setupNotifications,
  scheduleNotification,
  sendNotification,
  setupDailyCron,
  removeDailyCron,
  formatNotificationMessage
};
