// Official FIFA World Cup 2026 Groups
const groupsData = {
    A: ["🇲🇽 Mexico", "🇿🇦 South Africa", "🇰🇷 South Korea", "🇨🇿 Czechia"],
    B: ["🇨🇦 Canada", "🇧🇦 Bosnia and Herzegovina", "🇶🇦 Qatar", "🇨🇭 Switzerland"],
    C: ["🇧🇷 Brazil", "🇲🇦 Morocco", "🇭🇹 Haiti", "🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland"],
    D: ["🇺🇸 United States", "🇵🇾 Paraguay", "🇦🇺 Australia", "🇹🇷 Turkey"],
    E: ["🇩🇪 Germany", "🇨🇼 Curaçao", "🇨🇮 Ivory Coast", "🇪🇨 Ecuador"],
    F: ["🇳🇱 Netherlands", "🇯🇵 Japan", "🇸🇪 Sweden", "🇹🇳 Tunisia"],
    G: ["🇧🇪 Belgium", "🇪🇬 Egypt", "🇮🇷 Iran", "🇳🇿 New Zealand"],
    H: ["🇪🇸 Spain", "🇨🇻 Cape Verde", "🇸🇦 Saudi Arabia", "🇺🇾 Uruguay"],
    I: ["🇫🇷 France", "🇸🇳 Senegal", "🇮🇶 Iraq", "🇳🇴 Norway"],
    J: ["🇦🇷 Argentina", "🇩🇿 Algeria", "🇦🇹 Austria", "🇯🇴 Jordan"],
    K: ["🇵🇹 Portugal", "🇨🇴 Colombia", "🇺🇿 Uzbekistan", "🇨🇩 DR Congo"],
    L: ["🏴󠁧󠁢󠁥󠁮󠁧󠁿 England", "🇭🇷 Croatia", "🇬🇭 Ghana", "🇵🇦 Panama"]
};

// পাওয়ার রেটিং (১০০ এর মধ্যে) - এআই এই ডাটা দিয়ে প্রেডিকশন হিসাব করবে
const teamPowerRatings = {
    "🇲🇽 Mexico": 78, "🇿🇦 South Africa": 65, "🇰🇷 South Korea": 72, "🇨🇿 Czechia": 70,
    "🇨🇦 Canada": 75, "🇧🇦 Bosnia and Herzegovina": 68, "🇶🇦 Qatar": 60, "🇨🇭 Switzerland": 76,
    "🇧🇷 Brazil": 92, "🇲🇦 Morocco": 85, "🇭🇹 Haiti": 55, "🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland": 71,
    "🇺🇸 United States": 82, "🇵🇾 Paraguay": 70, "🇦🇺 Australia": 72, "🇹🇷 Turkey": 75,
    "🇩🇪 Germany": 88, "🇨🇼 Curaçao": 50, "🇨🇮 Ivory Coast": 76, "🇪🇨 Ecuador": 74,
    "🇳🇱 Netherlands": 86, "🇯🇵 Japan": 81, "🇸🇪 Sweden": 75, "🇹🇳 Tunisia": 67,
    "🇧🇪 Belgium": 84, "🇪🇬 Egypt": 74, "🇮🇷 Iran": 70, "🇳🇿 New Zealand": 58,
    "🇪🇸 Spain": 92, "🇨🇻 Cape Verde": 66, "🇸🇦 Saudi Arabia": 68, "🇺🇾 Uruguay": 83,
    "🇫🇷 France": 93, "🇸🇳 Senegal": 78, "🇮🇶 Iraq": 64, "🇳🇴 Norway": 77,
    "🇦🇷 Argentina": 94, "🇩🇿 Algeria": 73, "🇦🇹 Austria": 76, "🇯🇴 Jordan": 61,
    "🇵🇹 Portugal": 89, "🇨🇴 Colombia": 82, "🇺🇿 Uzbekistan": 69, "🇨🇩 DR Congo": 68,
    "🏴󠁧󠁢󠁥󠁮󠁧󠁿 England": 91, "🇭🇷 Croatia": 80, "🇬🇭 Ghana": 71, "🇵🇦 Panama": 65
};

let knockoutState = { r32: [], r16: [], qf: [], sf: [], f: [], champion: null };
let currentMode = "direct"; // 'direct' or 'score'

document.addEventListener("DOMContentLoaded", () => {
    renderGroupStage();
    
    // মোড চেঞ্জার লিসেনার
    document.querySelectorAll('input[name="simMode"]').forEach(radio => {
        radio.addEventListener("change", (e) => {
            currentMode = e.target.value;
            resetAll();
        });
    });

    document.getElementById("generate-ko-btn").addEventListener("click", processGroupStage);
    document.getElementById("reset-btn").addEventListener("click", resetAll);
    
    const aiBtn = document.getElementById("ai-sim-btn");
    if(aiBtn) aiBtn.addEventListener("click", runFullAISimulation);
});

// মোড অনুযায়ী গ্রুপ স্টেজ রেন্ডার করার ফাংশন
function renderGroupStage() {
    const container = document.getElementById("groups-container");
    if(!container) return;
    container.innerHTML = "";
    
    Object.keys(groupsData).forEach(groupName => {
        const groupCard = document.createElement("div");
        groupCard.className = "group-card";
        groupCard.innerHTML = `<h3>Group ${groupName}</h3>`;
        
        if (currentMode === "direct") {
            groupsData[groupName].forEach(team => {
                const row = document.createElement("div");
                row.className = "group-team-row";
                row.innerHTML = `
                    <span>${team}</span>
                    <select class="group-select" data-group="${groupName}" data-team="${team}">
                        <option value="">-- Rank --</option>
                        <option value="1">1st Place</option>
                        <option value="2">2nd Place</option>
                        <option value="3">3rd Place</option>
                        <option value="4">4th Place</option>
                    </select>
                `;
                groupCard.appendChild(row);
            });
        } else {
            const teams = groupsData[groupName];
            const fixtures = [
                [teams[0], teams[1]], [teams[2], teams[3]], 
                [teams[0], teams[2]], [teams[1], teams[3]], 
                [teams[0], teams[3]], [teams[1], teams[2]]  
            ];

            fixtures.forEach((match) => {
                const row = document.createElement("div");
                row.className = "group-match-row";
                row.innerHTML = `
                    <span style="font-size:0.85rem; width:40%; text-align:right;">${match[0]}</span>
                    <div class="score-inputs">
                        <input type="number" min="0" class="score-input score-t1" value="0">
                        <span class="match-vs">vs</span>
                        <input type="number" min="0" class="score-input score-t2" value="0">
                    </div>
                    <span style="font-size:0.85rem; width:40%; text-align:left;">${match[1]}</span>
                `;
                row.setAttribute("data-t1", match[0]);
                row.setAttribute("data-t2", match[1]);
                groupCard.appendChild(row);
            });
        }
        container.appendChild(groupCard);
    });
}

// গ্রুপ স্টেজের ফলাফল প্রসেস করা
function processGroupStage() {
    let groupResults = {}; 
    let thirdPlaceTeams = [];

    if (currentMode === "direct") {
        const selects = document.querySelectorAll(".group-select");
        Object.keys(groupsData).forEach(g => { groupResults[g] = { 1: null, 2: null, 3: null, 4: null }; });
        let isDuplicate = false;

        selects.forEach(select => {
            const rank = select.value;
            const group = select.getAttribute("data-group");
            const team = select.getAttribute("data-team");
            if (rank) {
                if (groupResults[group][rank]) isDuplicate = true;
                groupResults[group][rank] = team;
            }
        });

        if (isDuplicate) { alert("Duplicate ranks detected! Please fix it."); return; }

        for (let g in groupResults) {
            if (!groupResults[g][1] || !groupResults[g][2] || !groupResults[g][3] || !groupResults[g][4]) {
                alert(`Please assign ranks to all teams in Group ${g}`); return;
            }
        }

        Object.keys(groupResults).forEach((g, index) => {
            thirdPlaceTeams.push({ team: groupResults[g][3], group: g, points: 4 + (index % 3), gd: (index % 2 === 0) ? 1 : -1 });
        });

    } else {
        let tableData = {}; 
        Object.keys(groupsData).forEach(g => {
            groupsData[g].forEach(team => { tableData[team] = { name: team, group: g, points: 0, gd: 0, gf: 0 }; });
        });

        const matchRows = document.querySelectorAll(".group-match-row");
        matchRows.forEach(row => {
            const input1 = row.querySelector(".score-t1");
            const input2 = row.querySelector(".score-t2");
            const t1 = row.getAttribute("data-t1");
            const t2 = row.getAttribute("data-t2");
            const g1 = parseInt(input1.value) || 0;
            const g2 = parseInt(input2.value) || 0;

            tableData[t1].gf += g1; tableData[t2].gf += g2;
            tableData[t1].gd += (g1 - g2); tableData[t2].gd += (g2 - g1);

            if (g1 > g2) { tableData[t1].points += 3; }
            else if (g2 > g1) { tableData[t2].points += 3; }
            else { tableData[t1].points += 1; tableData[t2].points += 1; }
        });

        Object.keys(groupsData).forEach(g => {
            let groupTeams = groupsData[g].map(t => tableData[t]);
            groupTeams.sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
            
            groupResults[g] = {
                1: groupTeams[0].name,
                2: groupTeams[1].name,
                3: groupTeams[2].name,
                4: groupTeams[3].name
            };

            thirdPlaceTeams.push({ team: groupTeams[2].name, group: g, points: groupTeams[2].points, gd: groupTeams[2].gd });
        });
    }

    thirdPlaceTeams.sort((a, b) => b.points - a.points || b.gd - a.gd);
    let best8ThirdPlaces = thirdPlaceTeams.slice(0, 8);

    knockoutState.r32 = [];
    let get3rd = (idx) => best8ThirdPlaces[idx] ? best8ThirdPlaces[idx].team : `3rd Place Pool #${idx + 1}`;

    const officialR32Layout = [
        { id: 0, matchNo: 73, t1: groupResults['A'][2], t2: groupResults['B'][2] },
        { id: 1, matchNo: 74, t1: groupResults['E'][1], t2: get3rd(0) },
        { id: 2, matchNo: 75, t1: groupResults['F'][1], t2: groupResults['C'][2] },
        { id: 3, matchNo: 76, t1: groupResults['C'][1], t2: groupResults['F'][2] },
        { id: 4, matchNo: 77, t1: groupResults['I'][1], t2: get3rd(1) },
        { id: 5, matchNo: 78, t1: groupResults['E'][2], t2: groupResults['I'][2] },
        { id: 7, matchNo: 80, t1: groupResults['L'][1], t2: get3rd(3) },
        { id: 6, matchNo: 79, t1: groupResults['A'][1], t2: get3rd(2) },
        { id: 8, matchNo: 81, t1: groupResults['D'][1], t2: get3rd(4) },
        { id: 9, matchNo: 82, t1: groupResults['G'][1], t2: get3rd(5) },
        { id: 10, matchNo: 83, t1: groupResults['K'][2], t2: groupResults['L'][2] },
        { id: 11, matchNo: 84, t1: groupResults['H'][1], t2: groupResults['J'][2] },
        { id: 12, matchNo: 85, t1: groupResults['B'][1], t2: get3rd(6) },
        { id: 13, matchNo: 86, t1: groupResults['J'][1], t2: groupResults['H'][2] },
        { id: 14, matchNo: 87, t1: groupResults['K'][1], t2: get3rd(7) },
        { id: 15, matchNo: 88, t1: groupResults['D'][2], t2: groupResults['G'][2] }
    ];

    officialR32Layout.forEach(m => {
        knockoutState.r32.push({ id: m.id, matchNo: m.matchNo, t1: m.t1, t2: m.t2, winner: null, s1: "", s2: "" });
    });

    setupBlankRounds();

    const koSection = document.getElementById("knockout-section");
    if(koSection) koSection.classList.remove("id-disabled");
    renderBracket();
}

function setupBlankRounds() {
    knockoutState.r16 = Array(8).fill(null).map((_, i) => ({ id: i, t1: null, t2: null, winner: null, s1: "", s2: "" }));
    knockoutState.qf = Array(4).fill(null).map((_, i) => ({ id: i, t1: null, t2: null, winner: null, s1: "", s2: "" }));
    knockoutState.sf = Array(2).fill(null).map((_, i) => ({ id: i, t1: null, t2: null, winner: null, s1: "", s2: "" }));
    knockoutState.f = [{ id: 0, t1: null, t2: null, winner: null, s1: "", s2: "" }];
    knockoutState.champion = null;
}

function renderBracket() {
    renderKoRound(knockoutState.r32, "r32-slots", "r32");
    renderKoRound(knockoutState.r16, "r16-slots", "r16");
    renderKoRound(knockoutState.qf, "qf-slots", "qf");
    renderKoRound(knockoutState.sf, "sf-slots", "sf");
    renderKoRound(knockoutState.f, "f-slots", "f");
    
    const champField = document.getElementById("champion-name");
    if(champField) champField.innerText = knockoutState.champion ? knockoutState.champion : "???";
}

function renderKoRound(matches, containerId, roundKey) {
    const container = document.getElementById(containerId);
    if(!container) return;
    container.innerHTML = "";

    matches.forEach(match => {
        const matchBox = document.createElement("div");
        matchBox.className = "match-box";

        const name1 = match.t1 || "Waiting...";
        const name2 = match.t2 || "Waiting...";

        const div1 = document.createElement("div");
        div1.className = `ko-team ${match.winner === match.t1 && match.t1 ? 'advanced' : ''} ${match.winner && match.winner !== match.t1 ? 'eliminated' : ''}`;
        
        if (currentMode === "direct" || !match.t1 || !match.t2) {
            div1.innerText = name1;
            if(match.t1 && match.t2) div1.onclick = () => advanceTeamDirect(roundKey, match.id, match.t1);
        } else {
            div1.innerHTML = `<span>${name1}</span><input type="number" min="0" class="score-input" value="${match.s1}" onchange="advanceTeamScore('${roundKey}', ${match.id}, this.value, 't1')">`;
        }

        const div2 = document.createElement("div");
        div2.className = `ko-team ${match.winner === match.t2 && match.t2 ? 'advanced' : ''} ${match.winner && match.winner !== match.t2 ? 'eliminated' : ''}`;
        
        if (currentMode === "direct" || !match.t1 || !match.t2) {
            div2.innerText = name2;
            if(match.t1 && match.t2) div2.onclick = () => advanceTeamDirect(roundKey, match.id, match.t2);
        } else {
            div2.innerHTML = `<span>${name2}</span><input type="number" min="0" class="score-input" value="${match.s2}" onchange="advanceTeamScore('${roundKey}', ${match.id}, this.value, 't2')">`;
        }

        matchBox.appendChild(div1);
        matchBox.appendChild(div2);
        container.appendChild(matchBox);
    });
}

function advanceTeamDirect(currentRound, matchId, selectedTeam) {
    pushToNextRound(currentRound, matchId, selectedTeam);
}

function advanceTeamScore(currentRound, matchId, val, teamType) {
    let match = knockoutState[currentRound][matchId];
    if (teamType === 't1') match.s1 = val; else match.s2 = val;

    if (match.s1 !== "" && match.s2 !== "" && match.s1 !== undefined && match.s2 !== undefined) {
        let g1 = parseInt(match.s1) || 0;
        let g2 = parseInt(match.s2) || 0;
        let winner = null;

        if (g1 > g2) winner = match.t1;
        else if (g2 > g1) winner = match.t2;
        else {
            let p = prompt(`Match Tied! Enter Penalty Shootout Winner:\n1 for ${match.t1}\n2 for ${match.t2}`);
            winner = (p === "2") ? match.t2 : match.t1;
        }
        pushToNextRound(currentRound, matchId, winner);
    }
}

// AI কোর লজিক ইঞ্জিন
function calculateAIScore(team1, team2) {
    const p1 = teamPowerRatings[team1] || 70;
    const p2 = teamPowerRatings[team2] || 70;
    const diff = p1 - p2;
    
    let g1 = Math.floor(Math.random() * 3); 
    let g2 = Math.floor(Math.random() * 3);
    
    if (diff > 15) g1 += Math.floor(Math.random() * 3) + 1;
    else if (diff > 5) g1 += 1;
    else if (diff < -15) g2 += Math.floor(Math.random() * 3) + 1;
    else if (diff < -5) g2 += 1;
    
    return { g1, g2 };
}

// এক ক্লিকে সম্পূর্ণ টুর্নামেন্ট জেনারেট করার মাস্টার ফাংশন (Bulletproof & Safe)
function runFullAISimulation() {
    currentMode = "score"; 
    
    const scoreRadio = document.getElementById("mode-score");
    if(scoreRadio) scoreRadio.checked = true;
    
    renderGroupStage();

    const matchRows = document.querySelectorAll(".group-match-row");
    matchRows.forEach(row => {
        const t1 = row.getAttribute("data-t1");
        const t2 = row.getAttribute("data-t2");
        const { g1, g2 } = calculateAIScore(t1, t2);
        
        const inp1 = row.querySelector(".score-t1");
        const inp2 = row.querySelector(".score-t2");
        if(inp1 && inp2) {
            inp1.value = g1;
            inp2.value = g2;
        }
    });

    processGroupStage(); 

    const rounds = ["r32", "r16", "qf", "sf", "f"];
    rounds.forEach(roundKey => {
        if(knockoutState[roundKey]) {
            knockoutState[roundKey].forEach(match => {
                if (match.t1 && match.t2) {
                    let { g1, g2 } = calculateAIScore(match.t1, match.t2);
                    if (g1 === g2) { 
                        Math.random() > 0.5 ? g1++ : g2++;
                    }
                    match.s1 = g1;
                    match.s2 = g2;
                    let winner = g1 > g2 ? match.t1 : match.t2;
                    pushToNextRound(roundKey, match.id, winner);
                }
            });
        }
    });
    
    const koSec = document.getElementById("knockout-section");
    if(koSec) koSec.scrollIntoView({ behavior: 'smooth' });
}

function pushToNextRound(currentRound, matchId, selectedTeam) {
    const prevWinner = knockoutState[currentRound][matchId].winner;
    knockoutState[currentRound][matchId].winner = selectedTeam;

    if (prevWinner && prevWinner !== selectedTeam) resetDownstream(prevWinner);

    if (currentRound === "r32") {
        const r16Map = {
            0: { nextId: 0, slot: 't1' }, 2: { nextId: 0, slot: 't2' },  
            1: { nextId: 1, slot: 't1' }, 4: { nextId: 1, slot: 't2' },  
            3: { nextId: 2, slot: 't1' }, 5: { nextId: 2, slot: 't2' },  
            6: { nextId: 3, slot: 't1' }, 7: { nextId: 3, slot: 't2' },  
            10: { nextId: 4, slot: 't1' }, 11: { nextId: 4, slot: 't2' }, 
            8: { nextId: 5, slot: 't1' }, 9: { nextId: 5, slot: 't2' },  
            13: { nextId: 6, slot: 't1' }, 15: { nextId: 6, slot: 't2' }, 
            12: { nextId: 7, slot: 't1' }, 14: { nextId: 7, slot: 't2' }  
        };
        let target = r16Map[matchId];
        if(target) knockoutState.r16[target.nextId][target.slot] = selectedTeam;

    } else if (currentRound === "r16") {
        let nextMatchId = Math.floor(matchId / 2);
        if (matchId % 2 === 0) knockoutState.qf[nextMatchId].t1 = selectedTeam; 
        else knockoutState.qf[nextMatchId].t2 = selectedTeam;

    } else if (currentRound === "qf") {
        let nextMatchId = Math.floor(matchId / 2);
        if (matchId % 2 === 0) knockoutState.sf[nextMatchId].t1 = selectedTeam; 
        else knockoutState.sf[nextMatchId].t2 = selectedTeam;

    } else if (currentRound === "sf") {
        if (matchId === 0) knockoutState.f[0].t1 = selectedTeam; 
        else knockoutState.f[0].t2 = selectedTeam;

    } else if (currentRound === "f") {
        knockoutState.champion = selectedTeam;
    }
    renderBracket();
}

function resetDownstream(teamName) {
    const rounds = ["r16", "qf", "sf", "f"];
    rounds.forEach(r => {
        knockoutState[r].forEach(m => {
            if(m.t1 === teamName) { m.t1 = null; m.winner = null; m.s1 = ""; }
            if(m.t2 === teamName) { m.t2 = null; m.winner = null; m.s2 = ""; }
        });
    });
    if(knockoutState.champion === teamName) knockoutState.champion = null;
}

function resetAll() {
    knockoutState = { r32: [], r16: [], qf: [], sf: [], f: [], champion: null };
    const koSection = document.getElementById("knockout-section");
    if(koSection) koSection.classList.add("id-disabled");
    renderGroupStage();
    renderBracket();
}
