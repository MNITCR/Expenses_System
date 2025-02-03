export const formatMoney = (amount, currency, decimalPlaces, dsSeparator, thsSeparator, dscSymbol) => {
    // Adjust decimal places if necessary
    let formattedAmount = amount.toFixed(decimalPlaces);

    // Handle USD formatting
    if (currency === "USD") {
      // Handle decimal separator based on dsSeparator
      if (dsSeparator === 2) {
        formattedAmount = formattedAmount.replace('.', ',');
      }

      // Apply thousands separator
      if (thsSeparator === 1) {
        formattedAmount = formattedAmount.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Dot as separator
      } else if (thsSeparator === 2) {
        formattedAmount = formattedAmount.replace(/\B(?=(\d{3})+(?!\d))/g, ','); // Comma as separator
      } else if (thsSeparator === 3) {
        formattedAmount = formattedAmount.replace(/\B(?=(\d{3})+(?!\d))/g, ' '); // Space as separator
      }

      // Handle decimal places when choosing 1 decimal place
      if (decimalPlaces === 1) {
        formattedAmount = formattedAmount.replace('.00', ',00');
      }

      // Add currency symbol placement
      if (dscSymbol === 1) {
        return "$" + formattedAmount;
      } else if (dscSymbol === 2) {
        return formattedAmount + " $";
      }
    }

    // Handle Khmer Riel formatting
    if (currency === "KHR") {
      const integerPart = Math.floor(amount);
      formattedAmount = integerPart.toLocaleString("en-US");

      // Handle decimal separator
      if (dsSeparator === 2) {
        formattedAmount = formattedAmount.replace('.', ',');
      }

      // Apply thousands separator for KHR
      if (thsSeparator === 1) {
        formattedAmount = formattedAmount.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Dot as separator
      } else if (thsSeparator === 2) {
        formattedAmount = formattedAmount.replace(/\B(?=(\d{3})+(?!\d))/g, ','); // Comma as separator
      } else if (thsSeparator === 3) {
        formattedAmount = formattedAmount.replace(/\B(?=(\d{3})+(?!\d))/g, ' '); // Space as separator
      }

      // Handle currency symbol placement
      if (dscSymbol === 1) {
        return "៛" + formattedAmount;
      } else if (dscSymbol === 2) {
        return formattedAmount + " ៛";
      }
    }

    return amount;
  };
