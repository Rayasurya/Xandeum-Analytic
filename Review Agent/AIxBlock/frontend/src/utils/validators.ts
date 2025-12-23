import { PublicKey } from "@solana/web3.js";

export function isValidIPv4(ip: string) {
    const blocks = ip.split('.');

    if (blocks.length !== 4) {
        return false;
    }

    for (const block of blocks) {
        const numericBlock = parseInt(block, 10);

        if (!(numericBlock >= 0 && numericBlock <= 255)) {
            return false;
        }
    }

    return true;
}


// Function to validate Docker image format
export function validateDockerImage(image: string) {
    // Regular expression to match Docker image format
    // The format is: [registry-hostname:port/]repository/image-name[:tag]
    // Reference: https://docs.docker.com/engine/reference/commandline/tag/#extended-description
    const dockerImageRegex =
      /^(([a-z0-9]+(?:[.-_][a-z0-9]+)*)\/)?([a-z0-9]+(?:[.-_][a-z0-9]+)*)\/([a-z0-9]+(?:[.-_][a-z0-9]+)*)((:([a-zA-Z0-9_.-]+))?)$/;

    return dockerImageRegex.test(image);
}

export function validateEmail(email: string) {
	const emailRex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

	return emailRex.test(email);
}


interface PriceValidationOptions {
  minPrice: number;
  maxPrice: number;
  currency?: string; 
}


interface PriceValidationResult {
  isValid: boolean;
  errorMessage?: string;
}


export function validatePriceRange(
  price: number,
  options: PriceValidationOptions
): PriceValidationResult {
  if (price < options.minPrice) {
    return {
      isValid: false,
      errorMessage: `Price must be at least ${options.currency || ''}${options.minPrice}`
    };
  }


  if (price > options.maxPrice) {
    return {
      isValid: false,
      errorMessage: `Price must be at most ${options.currency || ''}${options.maxPrice}`
    };
  }


  return { isValid: true };
}

interface PriceValidationResult {
  isValid: boolean;
  errorMessage?: string; 
}


export function validatePrices(price1?: number, price2?: number): PriceValidationResult {
  if (!price1 || isNaN(price1) || price1 < 0 ) {
    return { isValid: false, errorMessage: "Prices must be valid positive numbers" };
	}
	if (price2) {
		if (isNaN(price2) || price2 < 0) {
			return { isValid: false, errorMessage: "Max price must be valid positive numbers" };
		}
		if (price2 < price1) {
			return { isValid: false, errorMessage: "Max Price needs to be higher than Min Price" };
		}	
	}

  return { isValid: true }; 
}

export const isValidSolanaAddress = (address: string): boolean => {
  try {
    new PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
};