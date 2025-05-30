const axios = require('axios');
require('dotenv').config();

const METAAPI_TOKEN = process.env.METAAPI_TOKEN;
const ACCOUNT_ID = process.env.ACCOUNT_ID;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

async function fetchAccountStats() {
    try {
        const response = await axios.get(
            `https://mt-provisioning-api-v1.agiliumtrade.ai/users/current/accounts/${ACCOUNT_ID}/accountInformation`,
            {
                headers: { 'auth-token': METAAPI_TOKEN }
            }
        );
        return response.data;
    } catch (error) {
        console.error("MetaAPI error:", error.message);
        return null;
    }
}

async function sendToSupabase(data) {
    try {
        await axios.post(
            `${SUPABASE_URL}/rest/v1/account_stats`,
            {
                account_id: data.login,
                balance: data.balance,
                equity: data.equity,
                open_trades: 0,
                closed_today: 0,
                daily_profit: 0,
                daily_pl_percent: 0,
                weekly_profit: 0,
                weekly_pl_percent: 0,
                monthly_profit: 0,
                monthly_pl_percent: 0,
                win_rate: 0,
                timestamp: new Date().toISOString()
            },
            {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                }
            }
        );
        console.log("✅ Stats pushed to Supabase.");
    } catch (error) {
        console.error("Supabase error:", error.message);
    }
}

async function main() {
    const stats = await fetchAccountStats();
    if (stats) await sendToSupabase(stats);
}

setInterval(main, 60 * 1000);  // Run every 60 seconds
main();
