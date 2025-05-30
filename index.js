import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const METAAPI_TOKEN = process.env.METAAPI_TOKEN;
const ACCOUNT_ID = process.env.ACCOUNT_ID;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

async function fetchAccountInfo() {
  try {
    const response = await axios.get(
      `https://mt-provisioning-api-v1.agiliumtrade.ai/users/current/accounts/${ACCOUNT_ID}/accountInformation`,
      { headers: { 'auth-token': METAAPI_TOKEN } }
    );
    return response.data;
  } catch (err) {
    console.error('❌ Failed to fetch account info:', err.message);
    return null;
  }
}

async function sendToSupabase(data) {
  const timestamp = new Date().toISOString();
  const payload = {
    account_id: data.login?.toString(),
    balance: data.balance,
    equity: data.equity,
    open_trades: data.openPositionsCount || 0,
    closed_today: 0,
    daily_profit: 0.0,
    daily_pl_percent: 0.0,
    weekly_profit: 0.0,
    weekly_pl_percent: 0.0,
    monthly_profit: 0.0,
    monthly_pl_percent: 0.0,
    win_rate: 0.0,
    timestamp: timestamp
  };

  try {
    const response = await axios.post(
      `${SUPABASE_URL}/rest/v1/account_stats`,
      payload,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ Data sent to Supabase:', response.status);
  } catch (err) {
    console.error('❌ Failed to send data to Supabase:', err.message);
  }
}

async function main() {
  while (true) {
    const info = await fetchAccountInfo();
    if (info) {
      await sendToSupabase(info);
    }
    await new Promise(r => setTimeout(r, 60 * 1000)); // wait 60 seconds
  }
}

main();
