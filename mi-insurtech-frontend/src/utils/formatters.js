// src/utils/formatters.js

export const formatMoney = (amount, currencySymbol = '$', language = 'es') => {
  // 1. Nos aseguramos de que sea un número real
  const num = Number(amount);
  if (isNaN(num)) return `${currencySymbol} 0.00`;

  // 2. Aplicamos la regla de formato según el idioma/región
  // Si está en inglés, usa estilo gringo (1,000.00). Si es español, usa estilo latino/europeo (1.000,00)
  const formattedNumber = new Intl.NumberFormat(language === 'en' ? 'en-US' : 'es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);

  // 3. Unimos el símbolo elegido por el usuario con el número formateado
  return `${currencySymbol} ${formattedNumber}`;
};