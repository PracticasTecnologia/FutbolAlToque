/**
 * Scraper de Equipos Internacionales para FutbolManager
 * Ejecutar con: node scripts/scrape_international.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

// Lista de equipos internacionales TOP, organizados por país para el comentario
const TEAMS = [
    // ESPAÑA
    { id: 'realmadrid', url: 'https://www.transfermarkt.com/real-madrid/kader/verein/418/saison_id/2025/plus/1' },
    { id: 'barcelona', url: 'https://www.transfermarkt.com/fc-barcelona/kader/verein/131/saison_id/2025/plus/1' },
    { id: 'atletico', url: 'https://www.transfermarkt.com/atletico-madrid/kader/verein/13/saison_id/2025/plus/1' },

    // INGLATERRA
    { id: 'mancity', url: 'https://www.transfermarkt.com/manchester-city/kader/verein/281/saison_id/2025/plus/1' },
    { id: 'arsenal', url: 'https://www.transfermarkt.com/arsenal-fc/kader/verein/11/saison_id/2025/plus/1' },
    { id: 'liverpool', url: 'https://www.transfermarkt.com/liverpool-fc/kader/verein/31/saison_id/2025/plus/1' },
    { id: 'chelsea', url: 'https://www.transfermarkt.com/chelsea-fc/kader/verein/631/saison_id/2025/plus/1' },
    { id: 'manutd', url: 'https://www.transfermarkt.com/manchester-united/kader/verein/985/saison_id/2025/plus/1' },

    // ITALIA
    { id: 'inter', url: 'https://www.transfermarkt.com/inter-milan/kader/verein/46/saison_id/2025/plus/1' },
    { id: 'juventus', url: 'https://www.transfermarkt.com/juventus-fc/kader/verein/506/saison_id/2025/plus/1' },
    { id: 'milan', url: 'https://www.transfermarkt.com/ac-milan/kader/verein/5/saison_id/2025/plus/1' },

    // ALEMANIA
    { id: 'bayern', url: 'https://www.transfermarkt.com/bayern-munich/kader/verein/27/saison_id/2025/plus/1' },
    { id: 'leverkusen', url: 'https://www.transfermarkt.com/bayer-04-leverkusen/kader/verein/15/saison_id/2025/plus/1' },

    // FRANCIA
    { id: 'psg', url: 'https://www.transfermarkt.com/paris-saint-germain/kader/verein/583/saison_id/2025/plus/1' },

    // EEUU (Por Messi)
    { id: 'intermiami', url: 'https://www.transfermarkt.com/inter-miami-cf/kader/verein/69261/saison_id/2025/plus/1' },

    // BRASIL (Rivales de Libertadores)
    { id: 'flamengo', url: 'https://www.transfermarkt.com/cr-flamengo/kader/verein/614/saison_id/2025/plus/1' },
    { id: 'palmeiras', url: 'https://www.transfermarkt.com/se-palmeiras/kader/verein/1023/saison_id/2025/plus/1' },
];

const extractPlayersScript = `
(() => {
    const players = [];
    const rows = document.querySelectorAll('table.items > tbody > tr');
    
    rows.forEach(row => {
        const nameLink = row.querySelector('.hauptlink a');
        if (!nameLink) return;
        
        const name = nameLink.textContent.trim();
        
        // Posición
        let position = "";
        const inlineTable = row.querySelector('table.inline-table');
        if (inlineTable) {
            const trs = inlineTable.querySelectorAll('tr');
            if (trs.length > 1) {
                position = trs[1].textContent.trim();
            }
        }
        
        // Edad
        const cells = row.querySelectorAll('td');
        let age = "";
        if (cells[2]) {
            const ageMatch = cells[2].textContent.match(/\\((\\d+)\\)/);
            age = ageMatch ? ageMatch[1] : "";
        }
        
        // Valor de mercado
        let value = "";
        const mvCell = row.querySelector('td.rechts.hauptlink');
        if (mvCell) {
            value = mvCell.textContent.trim();
        }
        
        if (name && position) {
            players.push({ name, pos: position, val: value || "-", age: parseInt(age) || 25 });
        }
    });
    
    return players;
})();
`;

async function scrapeTeam(browser, team) {
    console.log(`Extrayendo ${team.id}...`);
    const page = await browser.newPage();

    try {
        await page.goto(team.url, { waitUntil: 'networkidle2', timeout: 45000 });

        // Scroll y espera para carga dinámica
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await new Promise(r => setTimeout(r, 2000));

        const players = await page.evaluate(extractPlayersScript);
        console.log(`  -> ${players.length} jugadores encontrados`);

        await page.close();
        return { id: team.id, players };
    } catch (error) {
        console.error(`  Error en ${team.id}:`, error.message);
        await page.close();
        return { id: team.id, players: [] };
    }
}

async function main() {
    console.log('=== Scraper Internacional ===\n');

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const allData = {};

    for (const team of TEAMS) {
        const result = await scrapeTeam(browser, team);
        allData[result.id] = result.players;
        // Pausa anti-bloqueo
        await new Promise(r => setTimeout(r, 2000));
    }

    await browser.close();

    // Guardar JSON
    fs.writeFileSync('./international_squads.json', JSON.stringify(allData, null, 2));

    // Generar módulo JS
    let jsOutput = '// Datos internacionales extraídos automáticamente (Enero 2026)\n';
    jsOutput += 'export const internationalSquads = {\n';

    for (const [teamId, players] of Object.entries(allData)) {
        jsOutput += `    ${teamId}: [\n`;
        players.forEach(p => {
            jsOutput += `        { name: "${p.name}", pos: "${p.pos}", val: "${p.val}", age: ${p.age} },\n`;
        });
        jsOutput += `    ],\n`;
    }

    jsOutput += '};\n';

    fs.writeFileSync('./src/data/international_squads.js', jsOutput);
    console.log('\n✅ Datos guardados en src/data/international_squads.js');
}

main().catch(console.error);
