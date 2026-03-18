export function isValidDate(dateString) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false;
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return false;
  }

  const [year, month, day] = dateString.split('-').map(Number);

  if (year < 1900 || year > new Date().getFullYear() + 100) {
    return false;
  }

  if (month < 1 || month > 12) {
    return false;
  }

  if (day < 1 || day > 31) {
    return false;
  }

  const reconstructed = date.toISOString().substring(0, 10);
  return reconstructed === dateString;
}

export function getTodayMonthDay() {
  const today = new Date();
  return today.toISOString().substring(5, 10);
}

export function getCurrentYear() {
  return new Date().getFullYear();
}

export function formatDateForDisplay(dateString) {
  if (!dateString) return 'N/A';

  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

export function getAge(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

export function getDaysUntilBirthday(birthDate) {
  const today = new Date();
  const [, month, day] = birthDate.split('-').map(Number);

  const thisYearBirthday = new Date(today.getFullYear(), month - 1, day);

  if (thisYearBirthday < today) {
    thisYearBirthday.setFullYear(today.getFullYear() + 1);
  }

  const diffTime = thisYearBirthday - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

export function getCurrentHourInTimezone(timezone) {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false
    });

    const hour = parseInt(formatter.format(now), 10);
    return hour;
  } catch (error) {
    console.error(`Invalid timezone: ${timezone}`, error);
    return new Date().getHours();
  }
}

export function isTimeToSend(sendHour, timezone) {
  const currentHour = getCurrentHourInTimezone(timezone);
  return currentHour >= sendHour;
}
