const puppeteer = require('puppeteer');
const fs = require('fs');

const TEAMS = [
    { id: 'mancity', url: 'https://www.transfermarkt.com/manchester-city/kader/verein/281/saison_id/2025/plus/1' },
    { id: 'arsenal', url: 'https://www.transfermarkt.com/fc-arsenal/kader/verein/11/saison_id/2025/plus/1' },
    { id: 'liverpool', url: 'https://www.transfermarkt.com/fc-liverpool/kader/verein/31/saison_id/2025/plus/1' },
    { id: 'chelsea', url: 'https://www.transfermarkt.com/fc-chelsea/kader/verein/631/saison_id/2025/plus/1' },
    { id: 'manutd', url: 'https://www.transfermarkt.com/manchester-united/kader/verein/985/saison_id/2025/plus/1' },
    { id: 'tottenham', url: 'https://www.transfermarkt.com/tottenham-hotspur/kader/verein/148/saison_id/2025/plus/1' },
    { id: 'newcastle', url: 'https://www.transfermarkt.com/newcastle-united/kader/verein/762/saison_id/2025/plus/1' },
    { id: 'astonvilla', url: 'https://www.transfermarkt.com/aston-villa/kader/verein/405/saison_id/2025/plus/1' },
    { id: 'westham', url: 'https://www.transfermarkt.com/west-ham-united/kader/verein/379/saison_id/2025/plus/1' },
    { id: 'brighton', url: 'https://www.transfermarkt.com/brighton-amp-hove-albion/kader/verein/1237/saison_id/2025/plus/1' },
];

const extractPlayersScript = `
(() => {
    const players = [];
    const rows = document.querySelectorAll('table.items > tbody > tr');
    
    rows.forEach(row => {
        const nameLink = row.querySelector('.hauptlink a');
        if (!nameLink) return;
        
        const name = nameLink.textContent.trim();
        
        let position = "";
        const inlineTable = row.querySelector('table.inline-table');
        if (inlineTable) {
            const trs = inlineTable.querySelectorAll('tr');
            if (trs.length > 1) position = trs[1].textContent.trim();
        }

        // NACIONALIDAD
        let nationality = "England";
        const natImg = row.querySelector('img.flaggenrahmen');
        if (natImg) {
            nationality = natImg.getAttribute('title') || "England";
        }

        // EDAD
        let age = 25;
        const cells = row.querySelectorAll('td');
        for (const cell of cells) {
            const match = cell.innerText.match(/\\((\\d{2})\\)/);
            if (match) {
                age = parseInt(match[1]);
                break;
            }
        }
        
        let value = "";
        const mvCell = row.querySelector('td.rechts.hauptlink');
        if (mvCell) value = mvCell.textContent.trim();
        
        if (name && position) {
            players.push({ name, pos: position, val: value || "-", age: age, nat: nationality });
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
    console.log('=== Scraper PREMIER LEAGUE (Inglaterra) ===\n');
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const allData = {};
    for (const team of TEAMS) {
        const result = await scrapeTeam(browser, team);
        allData[result.id] = result.players;
        await new Promise(r => setTimeout(r, 2000));
    }
    await browser.close();

    let jsOutput = '// PREMIER LEAGUE (Inglaterra) - Datos reales Enero 2026\n';
    jsOutput += 'export const englandSquads = {\n';
    for (const [teamId, players] of Object.entries(allData)) {
        jsOutput += `    ${teamId}: [\n`;
        players.forEach(p => {
            jsOutput += `        { name: "${p.name}", pos: "${p.pos}", val: "${p.val}", age: ${p.age}, nat: "${p.nat}" },\n`;
        });
        jsOutput += `    ],\n`;
    }
    jsOutput += '};\n';

    fs.writeFileSync('./src/data/leagues/england.js', jsOutput);
    console.log('\n✅ Datos guardados en src/data/leagues/england.js');
}

main().catch(console.error);
