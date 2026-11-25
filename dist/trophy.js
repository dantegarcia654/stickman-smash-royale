// A sports-style trophy sculpture with the actual winner and last defeated rival.
export function victoryTrophy(winner,loser){return `<svg class="victory-trophy" viewBox="0 0 340 330" role="img" aria-label="${winner.name} victory trophy: a triumphant stickman standing over defeated ${loser.name}">
<defs><linearGradient id="trophy-gold" x1="0" x2="1" y2="1"><stop stop-color="#fff3b4"/><stop offset=".45" stop-color="#efc85c"/><stop offset="1" stop-color="#ac721f"/></linearGradient><radialGradient id="trophy-glow"><stop stop-color="${winner.color}" stop-opacity=".3"/><stop offset="1" stop-color="${winner.color}" stop-opacity="0"/></radialGradient></defs>
<ellipse cx="170" cy="157" rx="158" ry="155" fill="url(#trophy-glow)"/><circle cx="170" cy="144" r="113" fill="none" stroke="#f8d67c" stroke-opacity=".2" stroke-dasharray="4 12"/>
<g class="trophy-sparkles" fill="#ffe497"><path d="M54 96l4 11 11 4-11 4-4 11-4-11-11-4 11-4zM282 62l4 9 9 4-9 4-4 9-4-9-9-4 9-4zM292 179l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/><circle cx="77" cy="40" r="3"/><circle cx="249" cy="119" r="3"/><circle cx="63" cy="203" r="3"/></g>
<ellipse cx="170" cy="306" rx="109" ry="12" fill="#080e19" opacity=".5"/>
<path d="M70 267h200l15 21H55z" fill="url(#trophy-gold)"/><rect x="55" y="286" width="230" height="25" rx="6" fill="#9d6d26"/><rect x="81" y="287" width="178" height="19" rx="3" fill="#182230"/><text x="170" y="301" text-anchor="middle" fill="#ffe9a0" font-family="Barlow,Arial,sans-serif" font-size="13" font-weight="800" letter-spacing="2">${winner.name} · CHAMPION</text>
<path d="M116 259h108l10 9H106z" fill="#f2cc69"/>
<!-- The defeated rival is a relaxed, flat cartoon silhouette. -->
<g stroke="${loser.color}" stroke-opacity=".7" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" fill="none"><circle cx="264" cy="241" r="14" fill="#192333"/><path d="M249 238l-46-13-30 13m30-13-27-18m58 27 1 21 18 3m-19-24 14-15"/></g>
<!-- The champion plants one foot on the rival and raises both hands in victory. -->
<g stroke="url(#trophy-gold)" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M149 124l5 51-23 42-6 24m29-66 27 22 29 30M150 137l-28-24-17-40m48 63 28-25 23-44"/><circle cx="149" cy="101" r="22" fill="#192333"/></g>
<g stroke="${winner.color}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M149 124l5 51-23 42-6 24m29-66 27 22 29 30M150 137l-28-24-17-40m48 63 28-25 23-44"/><circle cx="149" cy="101" r="18"/></g>
<path d="M128 73l-5-23 17 10 10-20 10 20 17-11-5 24z" fill="url(#trophy-gold)"/><path d="M139 99l4 3m12 0 4-3" stroke="#fff1ba" stroke-width="3" stroke-linecap="round"/><path d="M142 110q8 8 16-1" stroke="#fff1ba" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M103 75l-8-12m11 10 1-16m96 13-1-17m4 16 9-14" stroke="#f6d67d" stroke-width="6" stroke-linecap="round"/>
${winner.name==='ROTT'?'<path d="M130 87l-8-15 20 10m13 0 17-12-4 23" fill="#48db72" stroke="#f6d67d" stroke-width="3"/>':''}
</svg><figcaption><strong>${winner.name} WINS THE TROPHY</strong><span>Standing tall over ${loser.name}.</span></figcaption>`;}
