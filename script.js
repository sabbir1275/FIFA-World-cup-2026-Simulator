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
});

// মোড অনুযায়ী গ্রুপ স্টেজ রেন্ডার করার ফাংশন
function renderGroupStage() {
    const container = document.getElementById("groups-container");
    container.innerHTML = "";
    
    Object.keys(groupsData).forEach(groupName => {
        const groupCard = document.createElement("div");
        groupCard.className = "group-card";
        groupCard.innerHTML = `<h3>Group ${groupName}</h3>`;
        
        if (currentMode === "direct") {
            // ১. সরাসরি ড্রপডাউন র‍্যাংকিং মোড
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
            // ২. গোল/ম্যাচ স্কোর ইনপুট মোড (রাউন্ড রবিন ৩টি ম্যাচ ফিক্সচার)
            const teams = groupsData[groupName];
            const fixtures = [
                [teams[0], teams[1]], [teams[2], teams[3]], // Matchday 1
                [teams[0], teams[2]], [teams[1], teams[3]], // Matchday 2
                [teams[0], teams[3]], [teams[1], teams[2]]  // Matchday 3
            ];

            fixtures.forEach((match, idx) => {
                const row = document.createElement("div");
                row.className = "group-match-row";
                row.innerHTML = `
                    <span style="font-size:0.85rem; width:40%; text-align:right;">${match[0]}</span>
                    <div class="score-inputs">
                        <input type="number" min="0" class="score-input score-t1" data-group="${groupName}" data-t1="${match[0]}" data-t2="${match[1]}" value="0">
                        <span class="match-vs">vs</span>
                        <input type="number" min="0" class="score-input score-t2" value="0">
                    </div>
                    <span style="font-size:0.85rem; width:40%; text-align:left;">${match[1]}</span>
                `;
                groupCard.appendChild(row);
            });
        }
        container.appendChild(groupCard);
    });
}

// গ্রুপ স্টেজের ফলাফল প্রসেস করা
function processGroupStage() {
    let groupResults = {}; // { A: { 1: Team, 2: Team, 3: Team, 4: Team } }
    let thirdPlaceTeams = [];

    if (currentMode === "direct") {
        // --- DIRECT MODE LOGIC ---
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

        // ৩য় স্থানগুলোর কাল্পনিক পয়েন্ট জেনারেশন
        Object.keys(groupResults).forEach((g, index) => {
            thirdPlaceTeams.push({ team: groupResults[g][3], points: 4 + (index % 3), gd: (index % 2 === 0) ? 1 : -1 });
        });

    } else {
        // --- SCORE MODE LOGIC ---
        let tableData = {}; // { "Mexico": { points: 0, gd: 0, gf: 0 } }
        Object.keys(groupsData).forEach(g => {
            groupsData[g].forEach(team => { tableData[team] = { name: team, group: g, points: 0, gd: 0, gf: 0 }; });
        });

        const matchRows = document.querySelectorAll(".group-match-row");
        matchRows.forEach(row => {
            const input1 = row.querySelector(".score-t1");
            const input2 = row.querySelector(".score-t2");
            const t1 = input1.getAttribute("data-t1");
            const t2 = input1.getAttribute("data-t2");
            const g1 = parseInt(input1.value) || 0;
            const g2 = parseInt(input2.value) || 0;

            tableData[t1].gf += g1; tableData[t2].gf += g2;
            tableData[t1].gd += (g1 - g2); tableData[t2].gd += (g2 - g1);

            if (g1 > g2) { tableData[t1].points += 3; }
            else if (g2 > g1) { tableData[t2].points += 3; }
            else { tableData[t1].points += 1; tableData[t2].points += 1; }
        });

        // গ্রুপ অনুযায়ী টিম সর্টিং (ফিফা অফিশিয়াল রুলস: Points -> GD -> Goals Scored)
        Object.keys(groupsData).forEach(g => {
            let groupTeams = groupsData[g].map(t => tableData[t]);
            groupTeams.sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
            
            groupResults[g] = {
                1: groupTeams[0].name,
                2: groupTeams[1].name,
                3: groupTeams[2].name,
                4: groupTeams[3].name
            };

            thirdPlaceTeams.push({ team: groupTeams[2].name, points: groupTeams[2].points, gd: groupTeams[2].gd });
        });
    }

    // টপ ৮টি ৩য় স্থানের দল সিলেক্ট করা
    thirdPlaceTeams.sort((a, b) => b.points - a.points || b.gd - a.gd);
    let best8ThirdPlaces = thirdPlaceTeams.slice(0, 8).map(t => t.team);

    // ২৪ (১ম ও ২য়) + ৮ (সেরা ৩য়) = ৩২টি দল রেডি
    let final32Teams = [];
    Object.keys(groupResults).forEach(g => {
        final32Teams.push(groupResults[g][1]);
        final32Teams.push(groupResults[g][2]);
    });
    final32Teams = final32Teams.concat(best8ThirdPlaces);

    // রাউন্ড অফ ৩২ ফিক্সচার ম্যাপিং
    knockoutState.r32 = [];
    for (let i = 0; i < 16; i++) {
        knockoutState.r32.push({ id: i, t1: final32Teams[i], t2: final32Teams[31 - i], winner: null, s1: "", s2: "" });
    }

    // ক্লিন নকআউট স্টেট সেটআপ
    setupBlankRounds();

    const koSection = document.getElementById("knockout-section");
    koSection.classList.remove("id-disabled");
    renderBracket();
    koSection.scrollIntoView({ behavior: 'smooth' });
}

function setupBlankRounds() {
    knockoutState.r16 = Array(8).fill(null).map((_, i) => ({ id: i, t1: null, t2: null, winner: null, s1: "", s2: "" }));
    knockoutState.qf = Array(4).fill(null).map((_, i) => ({ id: i, t1: null, t2: null, winner: null, s1: "", s2: "" }));
    knockoutState.sf = Array(2).fill(null).map((_, i) => ({ id: i, t1: null, t2: null, winner: null, s1: "", s2: "" }));
    knockoutState.f = [{ id: 0, t1: null, t2: null, winner: null, s1: "", s2: "" }];
    knockoutState.champion = null;
}

// ব্র্যাকেট রেন্ডার করা
function renderBracket() {
    renderKoRound(knockoutState.r32, "r32-slots", "r32");
    renderKoRound(knockoutState.r16, "r16-slots", "r16");
    renderKoRound(knockoutState.qf, "qf-slots", "qf");
    renderKoRound(knockoutState.sf, "sf-slots", "sf");
    renderKoRound(knockoutState.f, "f-slots", "f");
    document.getElementById("champion-name").innerText = knockoutState.champion ? knockoutState.champion : "???";
}

function renderKoRound(matches, containerId, roundKey) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    matches.forEach(match => {
        const matchBox = document.createElement("div");
        matchBox.className = "match-box";

        const name1 = match.t1 || "Waiting...";
        const name2 = match.t2 || "Waiting...";

        // Team 1 Row
        const div1 = document.createElement("div");
        div1.className = `ko-team ${match.winner === match.t1 && match.t1 ? 'advanced' : ''} ${match.winner && match.winner !== match.t1 ? 'eliminated' : ''}`;
        
        if (currentMode === "direct" || !match.t1 || !match.t2) {
            div1.innerText = name1;
            if(match.t1 && match.t2) div1.onclick = () => advanceTeamDirect(roundKey, match.id, match.t1);
        } else {
            div1.innerHTML = `<span>${name1}</span><input type="number" class="score-input" value="${match.s1}" onchange="advanceTeamScore('${roundKey}', ${match.id}, this.value, 't1')">`;
        }

        // Team 2 Row
        const div2 = document.createElement("div");
        div2.className = `ko-team ${match.winner === match.t2 && match.t2 ? 'advanced' : ''} ${match.winner && match.winner !== match.t2 ? 'eliminated' : ''}`;
        
        if (currentMode === "direct" || !match.t1 || !match.t2) {
            div2.innerText = name2;
            if(match.t1 && match.t2) div2.onclick = () => advanceTeamDirect(roundKey, match.id, match.t2);
        } else {
            div2.innerHTML = `<span>${name2}</span><input type="number" class="score-input" value="${match.s2}" onchange="advanceTeamScore('${roundKey}', ${match.id}, this.value, 't2')">`;
        }

        matchBox.appendChild(div1);
        matchBox.appendChild(div2);
        container.appendChild(matchBox);
    });
}

// ১. ডিরেক্ট মোডে টিম এডভান্স করা
function advanceTeamDirect(currentRound, matchId, selectedTeam) {
    pushToNextRound(currentRound, matchId, selectedTeam);
}

// ২. স্কোর মোডে গোল অনুযায়ী টিম এডভান্স করা (টাই হলে পেনাল্টি শুটআউট প্রোম্পট)
function advanceTeamScore(currentRound, matchId, val, teamType) {
    let match = knockoutState[currentRound][matchId];
    if (teamType === 't1') match.s1 = val; else match.s2 = val;

    if (match.s1 !== "" && match.s2 !== "") {
        let g1 = parseInt(match.s1) || 0;
        let g2 = parseInt(match.s2) || 0;
        let winner = null;

        if (g1 > g2) winner = match.t1;
        else if (g2 > g1) winner = match.t2;
        else {
            // গোল ড্র হলে পেনাল্টি শুটআউট ডিসিশন
            let p = prompt(`Match Tied! Enter Penalty Shootout Winner:\n1 for ${match.t1}\n2 for ${match.t2}`);
            winner = (p === "2") ? match.t2 : match.t1;
        }
        pushToNextRound(currentRound, matchId, winner);
    }
}

// পরের রাউন্ডে ডেটা পুশ করার কোর মেকানিজম
function pushToNextRound(currentRound, matchId, selectedTeam) {
    const prevWinner = knockoutState[currentRound][matchId].winner;
    knockoutState[currentRound][matchId].winner = selectedTeam;

    if (prevWinner && prevWinner !== selectedTeam) resetDownstream(prevWinner);

    const nextMatchId = Math.floor(matchId / 2);
    const isTeam1 = matchId % 2 === 0;

    if (currentRound === "r32") {
        if (isTeam1) knockoutState.r16[nextMatchId].t1 = selectedTeam; else knockoutState.r16[nextMatchId].t2 = selectedTeam;
    } else if (currentRound === "r16") {
        if (isTeam1) knockoutState.qf[nextMatchId].t1 = selectedTeam; else knockoutState.qf[nextMatchId].t2 = selectedTeam;
    } else if (currentRound === "qf") {
        if (isTeam1) knockoutState.sf[nextMatchId].t1 = selectedTeam; else knockoutState.sf[nextMatchId].t2 = selectedTeam;
    } else if (currentRound === "sf") {
        if (isTeam1) knockoutState.f[0].t1 = selectedTeam; else knockoutState.f[0].t2 = selectedTeam;
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
    document.getElementById("knockout-section").classList.add("id-disabled");
    renderGroupStage();
    renderBracket();
}