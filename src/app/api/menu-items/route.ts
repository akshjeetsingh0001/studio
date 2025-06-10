
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import type { sheets_v4 } from 'googleapis';

interface MenuItemVariant {
  size?: string;
  type?: string;
  price: number;
  idSuffix: string;
}

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  availability: boolean;
  description?: string;
  'data-ai-hint'?: string;
  variants?: MenuItemVariant[];
}

// Expected headers in the Google Sheet
const HEADER_ROW = ['id', 'name', 'category', 'price', 'imageUrl', 'availability', 'description', 'dataAiHint', 'variantsJson'];

function parseBoolean(value: string | undefined | null): boolean {
  if (!value) return false;
  return value.toLowerCase() === 'true';
}

function parseJSONSafe<T>(jsonString: string | undefined | null, defaultValue: T): T {
  if (!jsonString) return defaultValue;
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.warn('Failed to parse JSON string:', jsonString, error);
    return defaultValue;
  }
}


export async function GET() {
  try {
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const serviceAccountCredsRaw = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;

    if (!sheetId || !serviceAccountCredsRaw) {
      console.warn('Google Sheets API credentials or Sheet ID are not configured in environment variables.');
      // Return empty array or a specific error response if preferred
      return NextResponse.json({ error: 'Google Sheets API not configured. Menu items cannot be loaded.' }, { status: 500 });
    }

    let serviceAccountCreds;
    try {
      serviceAccountCreds = JSON.parse(serviceAccountCredsRaw);
    } catch (e) {
      console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_CREDENTIALS. Ensure it is valid JSON.', e);
      return NextResponse.json({ error: 'Invalid Google Service Account Credentials format.' }, { status: 500 });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: serviceAccountCreds.client_email,
        private_key: serviceAccountCreds.private_key,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // Assuming data is in the first sheet or a sheet named "MenuItems"
    // Adjust 'Sheet1' if your sheet has a different name
    const range = 'MenuItems!A:I'; // Adjust range based on actual columns, e.g., A:I for 9 columns

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: range, // Or a more specific range like 'MenuItems!A:I'
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return NextResponse.json([]);
    }

    // Assume the first row is headers, and validate it
    const headers = rows[0];
    const dataRows = rows.slice(1);

    // Simple header validation (optional but good practice)
    if (JSON.stringify(headers) !== JSON.stringify(HEADER_ROW)) {
        console.warn("Sheet headers don't match expected headers. Data mapping might be incorrect.", { expected: HEADER_ROW, actual: headers });
        // You might want to return an error here if headers are critical
    }

    const menuItems: MenuItem[] = dataRows.map((row: any[]) => {
      // Map row data to MenuItem object based on header order
      const item: any = {};
      HEADER_ROW.forEach((header, index) => {
          item[header] = row[index];
      });

      return {
        id: item.id || `ITEM_UNKNOWN_${Math.random().toString(36).substr(2, 9)}`,
        name: item.name || 'Unknown Item',
        category: item.category || 'Uncategorized',
        price: parseFloat(item.price) || 0,
        imageUrl: item.imageUrl || 'https://placehold.co/150x100.png',
        availability: parseBoolean(item.availability),
        description: item.description || '',
        'data-ai-hint': item.dataAiHint || '',
        variants: parseJSONSafe<MenuItemVariant[]>(item.variantsJson, []),
      };
    }).filter(item => item.id && item.name); // Ensure basic validity

    return NextResponse.json(menuItems);

  } catch (error) {
    console.error('Error fetching menu items from Google Sheets:', error);
    let errorMessage = 'Failed to load menu items from Google Sheets.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
     // Check for specific Google API errors if possible
    const gapiError = error as any;
    if (gapiError.code === 403) {
      errorMessage = "Permission denied. Ensure the service account has access to the Google Sheet.";
    } else if (gapiError.code === 404) {
      errorMessage = "Google Sheet not found. Check GOOGLE_SHEET_ID.";
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
