export function getNepaliDateStamp() {
  const now = new Date();
  
  // Format Gregorian
  const gregorianStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Calculate approximate Bikram Sambat (BS is ~56 years, 8 months ahead)
  // For editorial broadsheet header authenticity
  const bsYear = now.getFullYear() + 57;
  const nepaliDays = ['आइतबार', 'सोमबार', 'मङ्गलबार', 'बुधबार', 'बिहीबार', 'शुक्रबार', 'शनिबार'];
  const nepaliDay = nepaliDays[now.getDay()];

  return {
    gregorian: gregorianStr,
    bikramSambat: `${nepaliDay}, वि.सं. ${bsYear}`,
    edition: 'Kathmandu National Edition'
  };
}

export function formatNewsTime(dateString) {
  if (!dateString) return 'Just now';
  const d = new Date(dateString);
  const now = new Date();
  const diffHours = Math.floor((now - d) / (1000 * 60 * 60));

  if (diffHours < 1) {
    const diffMins = Math.floor((now - d) / (1000 * 60));
    return `${diffMins <= 1 ? '1 minute' : diffMins + ' minutes'} ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

