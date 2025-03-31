let rankingData = null;
let allStreamers = null;
let allIds = [];
let allNicknames = [];
let honorWrapper = null;
let isHofTransitioning = false;

const GIST_URL = "https://gist.githubusercontent.com/IDKWTSay/e2779cfa06b34a78cc34f58e6efc6f64/raw/ranking_data.json";
const GIST_HALL_URL = "https://gist.githubusercontent.com/IDKWTSay/fd313081b3d6eed272ee80b79dec313d/raw/hall_of_fame.json";

(function preloadEmblems() {
    const preImg1 = new Image();
    preImg1.src = "rotate_emblem.webp";
    const preImg2 = new Image();
    preImg2.src = "static_emblem.webp";
})();

async function fetchRankingData() {
    const response = await fetch(GIST_URL);
    if (!response.ok) throw new Error("랭킹 데이터 가져오기 실패");
    const data = await response.json();
    return data;
}

const hoverStyle = document.createElement('style');
hoverStyle.textContent = `
    table td {
        transition: background-color 0.2s;
    }
    table td:hover {
        background-color: #ADB3EB87;
    }
`;
document.head.appendChild(hoverStyle);

function createTables(id, streamerData, container) {
    const idContainer = document.createElement('div');
    idContainer.className = 'id-container';

    const h2 = document.createElement('h2');
    h2.innerHTML = `
        <img src="${streamerData.thumbnail}" alt="${streamerData.nickname}" style="width:50px;height:50px;margin-right:10px;vertical-align:middle;border-radius: 50%;">
        <span>${streamerData.nickname}</span>
    `;
    idContainer.appendChild(h2);

    const periodTablesContainer = document.createElement('div');
    periodTablesContainer.className = 'period-tables';

    const periods = ['top_7_days', 'top_30_days', 'top_all_time'];
    const periodNames = {
        'top_7_days': '7일 랭킹',
        'top_30_days': '30일 랭킹',
        'top_all_time': '전체시간'
    };

    periods.forEach(period => {
        const periodContainer = document.createElement('div');
        periodContainer.className = 'period-container';
        const periodTitle = document.createElement('h3');
        periodTitle.textContent = periodNames[period];
        periodTitle.style.marginLeft = "30px";
        periodContainer.appendChild(periodTitle);

        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');

        thead.innerHTML = `
            <tr>
                <th class="trophy-column"></th>
                <th class="rank-column">등수</th>
                <th>닉네임</th>
                <th class="change-column"></th>
            </tr>
        `;
        table.appendChild(thead);

        if (streamerData[period] && streamerData[period].length > 0) {
            const sortedData = [...streamerData[period]].sort((a, b) => b.score - a.score);
            const topEntries = sortedData.slice(0, 30);

            topEntries.forEach((entry, index) => {
                const row = document.createElement('tr');
                let trophyImage = 'bronze_trophy.webp';
                if (index === 0) trophyImage = 'dia_trophy.webp';
                else if (index >= 1 && index <= 4) trophyImage = 'golden_trophy.webp';
                else if (index >= 5 && index <= 9) trophyImage = 'silver_trophy.webp';

                let changeDisplay = '';
                if (entry.rank_change === 'new') {
                    changeDisplay = '<span style="color:red;">new</span>';
                } else if (entry.rank_change.startsWith('+')) {
                    const value = entry.rank_change.substring(1);
                    changeDisplay = `<img src="up.png" width="10" height="10" alt="up"> ${value}`;
                } else if (entry.rank_change.startsWith('-')) {
                    const value = entry.rank_change.substring(1);
                    changeDisplay = `<img src="down.png" width="10" height="10" alt="down"> ${value}`;
                } else if (entry.rank_change === '0') {
                    changeDisplay = '-';
                }

                row.innerHTML = `
                    <td class="trophy-column">
                        <img src="${trophyImage}" width="16" height="21" alt="trophy">
                    </td>
                    <td class="rank-column">${index + 1}</td>
                    <td>
                        <span title="${entry.nickname}">${entry.nickname}</span>
                    </td>
                    <td class="change-column">${changeDisplay}</td>
                `;

                if (index < 30) {
                    const nextEntry = sortedData[index - 1];
                    if (nextEntry) {
                        const scoreDiff = entry.score - nextEntry.score;
                        const absScoreDiff = Math.abs(scoreDiff).toLocaleString('ko-KR');
                        const diffSpan = document.createElement('span');
                        diffSpan.textContent = ` ${absScoreDiff} 포인트차`;
                        diffSpan.style.display = 'none';
                        diffSpan.style.position = 'absolute';
                        diffSpan.style.right = '5px';
                        diffSpan.style.top = '-10px';
                        diffSpan.style.color = '#fff';
                        diffSpan.style.backgroundColor = 'rgba(200,67,77,0.6)';
                        diffSpan.style.padding = '2px 5px';
                        diffSpan.style.borderRadius = '3px';
                        diffSpan.style.zIndex = '10';

                        const nicknameCell = row.querySelector('td:nth-child(3)');
                        nicknameCell.style.position = 'relative';
                        nicknameCell.style.overflow = 'visible';
                        nicknameCell.appendChild(diffSpan);

                        row.addEventListener('mousemove', () => {
                            diffSpan.style.display = 'inline';
                        });
                        row.addEventListener('mouseout', () => {
                            diffSpan.style.display = 'none';
                        });
                    }
                }
                tbody.appendChild(row);
            });
        } else {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="4">데이터 없음</td>`;
            tbody.appendChild(row);
        }

        table.appendChild(tbody);
        periodContainer.appendChild(table);
        periodTablesContainer.appendChild(periodContainer);
    });

    idContainer.appendChild(periodTablesContainer);
    container.appendChild(idContainer);
}

function addStreamerBanners() {
    const fixedIds = [
        'ecvhao', 'inehine', 'jingburger1', 'lilpa0309', 'cotton1217', 'gosegu2', 'viichan6'
    ];

    const bannerContainer = document.createElement('div');
    bannerContainer.className = 'streamer-banners';
    bannerContainer.style.position = 'absolute';
    bannerContainer.style.left = '-18%';
    bannerContainer.style.bottom = '-40px';
    bannerContainer.style.display = 'flex';
    bannerContainer.style.justifyContent = 'center';
    bannerContainer.style.gap = '15px';
    bannerContainer.style.zIndex = '1000';
	bannerContainer.style.pointerEvents = 'auto';
	
    for (const id of fixedIds) {
        if (allStreamers[id]) {
            const streamer = allStreamers[id];
            const bannerImg = document.createElement('div');
            bannerImg.className = 'streamer-banner-img';
            bannerImg.style.width = '60px';
            bannerImg.style.height = '60px';
            bannerImg.style.borderRadius = '50%';
            bannerImg.style.overflow = 'hidden';
            bannerImg.style.cursor = 'pointer';
            bannerImg.style.opacity = '0.8';
            bannerImg.style.border = '3px solid transparent';
            bannerImg.style.boxSizing = 'border-box';
			

            const img = document.createElement('img');
            img.src = streamer.thumbnail;
            img.alt = streamer.nickname;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            bannerImg.appendChild(img);

            bannerImg.addEventListener('mouseover', function() {
                this.style.opacity = '1';
                this.style.transform = 'scale(1.05)';
            });
            bannerImg.addEventListener('mouseout', function() {
                this.style.opacity = '0.7';
                this.style.transform = 'scale(1)';
            });
            bannerImg.addEventListener('click', function() {
                this.style.boxShadow = '0 0 5px 3px #2ecc71';
                const targetElement = document.querySelector(`#tables-container div.id-container h2 img[alt="${streamer.nickname}"]`);
                if (targetElement) {
                    const mainSection = document.querySelector('.main-section');
                    const rectTop = targetElement.getBoundingClientRect().top;
                    const yOffset = -(window.innerHeight * 0.21);
                    const targetPosition = targetElement.getBoundingClientRect().top + mainSection.scrollTop + yOffset;
                    mainSection.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
                setTimeout(() => {
                    this.style.boxShadow = '';
                }, 300);
            });
            bannerContainer.appendChild(bannerImg);
        }
    }
    const banner = document.querySelector('.banner');
    if (banner) {
        banner.appendChild(bannerContainer);
    } else {
        document.body.appendChild(bannerContainer);
    }
}

async function loadInitialTables() {
    const container = document.getElementById('tables-container');
    const fixedIds = [
        'ecvhao', 'inehine', 'jingburger1', 'lilpa0309', 'cotton1217', 'gosegu2', 'viichan6'
    ];
    let tablesCreated = 0;

    if (!rankingData) {
        container.innerHTML = '<p>데이터를 불러오는 중입니다. 잠시만 기다려주세요...</p>';
        return;
    }
    if (!container) return;
    container.innerHTML = '';

    for (const id of fixedIds) {
        if (allStreamers[id]) {
            createTables(id, allStreamers[id], container);
            tablesCreated++;
        }
    }
    if (tablesCreated === 0 && !container.hasChildNodes()) {
        container.innerHTML = '<p>랭킹 데이터가 아직 준비되지 않았습니다. 나중에 다시 시도해주세요.</p>';
    }
    addStreamerBanners();
}

async function searchId() {
    const input = document.getElementById('search-input').value.trim();
    const resultContainer = document.getElementById('search-result');
    resultContainer.innerHTML = '';

    if (!input) {
        resultContainer.textContent = 'ID 또는 닉네임을 입력해주세요.';
        return;
    }
    if (!rankingData) {
        resultContainer.textContent = '데이터를 불러오지 못했습니다.';
        return;
    }
    let found = false;
    for (const id in allStreamers) {
        const streamer = allStreamers[id];
        if (id === input || streamer.nickname === input) {
            createTables(id, streamer, resultContainer);
            found = true;
            break;
        }
    }
    if (!found) {
        resultContainer.textContent = '해당 ID 또는 닉네임을 찾을 수 없습니다.';
    }
    addStreamerBanners();
}

async function fetchHallOfFameData() {
    try {
        const response = await fetch(GIST_HALL_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data;
    } catch (error) {
        return null;
    }
}

function addIfariTooltip(thElement) {
    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    tooltip.innerHTML = '이세계아이돌 6명의 포인트의 조화평균값을 계산한 뒤, 한 차례 추가 보정을 거쳐 산출한 값을 바탕으로 합니다.';
    document.body.appendChild(tooltip);

    thElement.addEventListener('mouseenter', (e) => {
        const rect = thElement.getBoundingClientRect();
        tooltip.classList.add('show');
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.top = `${rect.top - 10}px`;
        tooltip.style.transform = 'translate(-50%, -100%)';
    });

    thElement.addEventListener('mouseleave', () => {
        tooltip.classList.remove('show');
    });
}


function createHallOfFameTable(data) {
    const container = document.createElement('div');
    container.id = 'hall-of-fame-container';

    const staticEmblem = document.createElement('img');
    staticEmblem.src = 'static_emblem.webp';
    staticEmblem.alt = '명예의 전당 엠블럼';
    staticEmblem.className = 'static-emblem';

    const title = document.createElement('h1');
    title.textContent = '명예의 전당';

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    const headers = ['date', 'ifari', 'total', 'ecvhao', 'inehine', 'jingburger1', 'lilpa0309', 'cotton1217', 'gosegu2', 'viichan6'];
    const headerNames = {
        'date': '',
        'ifari': '이달의 이파리상',
        'total': '최다 포인트상',
        'ecvhao': '포인트상 - 우왁굳',
        'inehine': '포인트상 - 아이네',
        'jingburger1': '포인트상 - 징버거',
        'lilpa0309': '포인트상 - 릴파',
        'cotton1217': '포인트상 - 주르르',
        'gosegu2': '포인트상 - 고세구',
        'viichan6': '포인트상 - 비챤'
    };

    const headerRow = document.createElement('tr');
	headers.forEach((headerKey, colIndex) => {
		const th = document.createElement('th');
		th.style.setProperty('--column-index', colIndex);
		const label = headerNames[headerKey] || headerKey;

		if (headerKey === 'ifari') {
			th.textContent = label;

			setTimeout(() => addIfariTooltip(th), 0);
		} else {
			th.textContent = label;
		}

		headerRow.appendChild(th);
	});

	thead.appendChild(headerRow);

    if (data && Array.isArray(data)) {
		
		    data.sort((a, b) => {
            if (!a.date && !b.date) return 0;
            if (!a.date) return 1;
            if (!b.date) return -1;
            return b.date.localeCompare(a.date);
        });
		
	
		
		
        data.forEach(rowData => {
            const row = document.createElement('tr');
            headers.forEach((headerKey, cellIndex) => {
                const td = document.createElement('td');
				td.style.setProperty('--cell-delay-index', cellIndex);
                const cellData = rowData[headerKey];
                let displayText = '-';
                if (headerKey !== 'date' && Array.isArray(cellData) && cellData.length > 0) {
                    if (cellData[0] && typeof cellData[0].nickname === 'string') {
                        displayText = cellData[0].nickname;
                    }
					} else if (headerKey === 'date' && cellData !== null && cellData !== undefined) {
						
						const [yyyy, mm] = cellData.split('-');
						const monthNames = [
							'January', 'February', 'March', 'April', 'May', 'June',
							'July', 'August', 'September', 'October', 'November', 'December'
						];
						const monthIndex = parseInt(mm, 10) - 1;

						if (yyyy && monthIndex >= 0 && monthIndex < 12) {
							displayText = `${monthNames[monthIndex]} ${yyyy}`;
						} else {
							displayText = cellData;
						}
					}
                td.textContent = displayText;
                if (typeof displayText === 'string' && displayText.length > 15) {
                    td.title = displayText;
                }
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });
    } else {
        const row = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = headers.length;
        td.textContent = '명예의 전당 데이터가 없습니다.';
        row.appendChild(td);
        tbody.appendChild(row);
    }

    table.appendChild(thead);
    table.appendChild(tbody);

    container.appendChild(staticEmblem);
    container.appendChild(title);
    container.appendChild(table);

    const backButton = document.createElement('button');
    backButton.id = 'hof-back-button';
    backButton.textContent = '돌아가기';
    backButton.addEventListener('click', hideHallOfFame);

    document.body.appendChild(container);
    document.body.appendChild(backButton);

    requestAnimationFrame(() => {
        container.classList.add('visible');
        backButton.classList.add('visible');
    });
	const rows = tbody.querySelectorAll('tr');
	const initialRowDelay = 1200;
	const subsequentRowDelay = 5000;
	
    rows.forEach((tr, index) => {
        setTimeout(() => {
            tr.classList.add('row-visible');
        }, initialRowDelay + index * subsequentRowDelay);
    });
}

async function showHallOfFame() {
    if (isHofTransitioning) return;
    isHofTransitioning = true;

    const mainSection = document.querySelector('.main-section');
    const searchSection = document.querySelector('.search-section');
    const honorWrapper = document.querySelector('.honor-wrapper');
    const tablesContainer = document.getElementById('tables-container');
    const streamerBanners = mainSection?.querySelector('.streamer-banners');
    const startTime = performance.now();

    if (!mainSection || !searchSection || !honorWrapper || !tablesContainer) {
        console.error("필수 섹션을 찾을 수 없습니다.");
        isHofTransitioning = false;
        return;
    }

    honorWrapper.classList.add('fade-out');
    mainSection.classList.add('slide-out-left');
    searchSection.classList.add('slide-out-right');
    tablesContainer.innerHTML = '';
    if (streamerBanners) streamerBanners.remove();

    let overlay = document.getElementById('black-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'black-overlay';
        document.body.appendChild(overlay);
    }
    requestAnimationFrame(() => {
        overlay.classList.add('visible');
    });

    let emblem = document.getElementById('rotating-emblem');
    if (!emblem) {
        emblem = document.createElement('img');
        emblem.id = 'rotating-emblem';
        emblem.src = 'rotate_emblem.webp';
        emblem.alt = '회전 엠블럼';
        document.body.appendChild(emblem);
    } else {
        emblem.classList.remove('visible');
        emblem.style.opacity = '0';
        emblem.style.transition = '';
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    requestAnimationFrame(() => {
        if (emblem) {
            emblem.style.transition = 'opacity 0.5s ease';
            emblem.classList.add('visible');
        }
    });

    const hallOfFameDataPromise = fetchHallOfFameData();

    const fadeOutStartTime = 5500;
    const timeUntilFadeOut = Math.max(0, fadeOutStartTime - (performance.now() - startTime));
    const fadeOutTimeout = setTimeout(() => {
        if (emblem) {
            emblem.style.opacity = '0';
        }
    }, timeUntilFadeOut);

    const minimumWaitTime = 6000;
    try {
        const [hallOfFameData, _] = await Promise.all([
            hallOfFameDataPromise,
            new Promise(resolve => {
                const timeElapsed = performance.now() - startTime;
                const waitTime = Math.max(0, minimumWaitTime - timeElapsed);
                setTimeout(resolve, waitTime);
            })
        ]);

        clearTimeout(fadeOutTimeout);

        if (emblem) {
            emblem.remove();
            emblem = null;
        }

        if (hallOfFameData) {
            const existingHofTable = document.getElementById('hall-of-fame-container');
            if (existingHofTable) existingHofTable.remove();
            const existingBackButton = document.getElementById('hof-back-button');
            if (existingBackButton) existingBackButton.remove();

            createHallOfFameTable(hallOfFameData);
        } else {
            const errorMsg = document.createElement('div');
            errorMsg.id = 'hof-error-message';
            document.body.appendChild(errorMsg);

            const errorBackButton = document.createElement('button');
            document.body.appendChild(errorBackButton);
        }
    } catch (error) {
        console.error("명예의 전당 처리 중 오류:", error);
        if (emblem) emblem.remove();

        const errorMsg = document.createElement('div');
        errorMsg.id = 'hof-error-message';
        errorMsg.textContent = `오류 발생: ${error.message}`;
        document.body.appendChild(errorMsg);

        const errorBackButton = document.createElement('button');
        document.body.appendChild(errorBackButton);

    } finally {
        setTimeout(() => {
            isHofTransitioning = false;
        }, 1200);
    }
}

function hideHallOfFame() {
    if (isHofTransitioning) return;
    isHofTransitioning = true;

    const hofContainer = document.getElementById('hall-of-fame-container');
    const backButton = document.getElementById('hof-back-button');
    const overlay = document.getElementById('black-overlay');
    const mainSection = document.querySelector('.main-section');
    const searchSection = document.querySelector('.search-section');
    const honorWrapper = document.querySelector('.honor-wrapper');
    const errorMsg = document.getElementById('hof-error-message');
    const errorBackButton = document.querySelector('button[style*="zIndex: 10001"]');

    if (errorMsg) errorMsg.remove();
    if (errorBackButton && errorBackButton.textContent === '돌아가기') errorBackButton.remove();

    if (!overlay || !mainSection || !searchSection || !honorWrapper) {
        if (hofContainer) hofContainer.remove();
        if (backButton) backButton.remove();
        isHofTransitioning = false;
        return;
    }

    const returnDuration = 5000;
    const returnDurationSec = `${returnDuration / 1000}s`;

    if (hofContainer) {
        hofContainer.style.transition = 'opacity 0.5s ease';
        hofContainer.classList.remove('visible');
    }
    if (backButton) {
        backButton.style.transition = 'opacity 0.5s ease';
        backButton.classList.remove('visible');
    }
    setTimeout(() => {
        if (hofContainer) hofContainer.remove();
        if (backButton) backButton.remove();
    }, 500);

    loadInitialTables();

    requestAnimationFrame(() => {
        overlay.style.transition = `opacity ${returnDurationSec} ease`;
        mainSection.style.transition = `transform ${returnDurationSec} ease, opacity ${returnDurationSec} ease, width 0.3s ease`;
        searchSection.style.transition = `transform ${returnDurationSec} ease, opacity ${returnDurationSec} ease, width 0.3s ease`;
        honorWrapper.style.transition = `opacity ${returnDurationSec} ease`;

        overlay.classList.remove('visible');
        mainSection.classList.remove('slide-out-left');
        searchSection.classList.remove('slide-out-right');
        honorWrapper.classList.remove('fade-out');
        honorWrapper.style.pointerEvents = 'auto';

        setTimeout(() => {
            if (overlay) overlay.remove();
            mainSection.style.transition = '';
            searchSection.style.transition = '';
            honorWrapper.style.transition = '';
            mainSection.style.overflowY = '';
            searchSection.style.overflowY = '';
            isHofTransitioning = false;
        }, returnDuration);
    });
}

document.addEventListener('DOMContentLoaded', async function() {
    const mainSection = document.querySelector('.main-section');
    const searchSection = document.querySelector('.search-section');
    const container = document.querySelector('.container');
    const searchInput = document.getElementById('search-input');
    const autocompleteDropdown = document.getElementById('autocomplete-dropdown');

    try {
        rankingData = await fetchRankingData();
        if (rankingData) {
            const updatedTime = rankingData.updated;
            const banner = document.querySelector('.banner');
            if (banner) {
                banner.innerHTML = '';

                const timeSpan = document.createElement('span');
                timeSpan.textContent = `갱신시간: ${updatedTime}`;
                timeSpan.style.cssText = "display: block; margin-top: 1vh; margin-left: 1.5vw; font-size: 15px; color: black;";

                const announcement = document.createElement('span');
                announcement.textContent = "방송 당일 포인트를 업데이트하지 못한 채 브라우저가 종료된 경우, 다음 날 브라우저를 실행하면 업데이트가 될 수 있습니다.\n이로 인해 리더보드 갱신이 다음 날 이루어질 수도 있습니다.";
                announcement.style.cssText = "display: block; white-space: pre-line; line-height: 1.4; margin-top: 1vh; margin-left: 1.5vw; font-size: 13px; color: white;";

                const countingImg = document.createElement('img');
				countingImg.src = 'https://hits.sh/hits.sh/idkwtsay.github.io/rankpage/ranking.svg?view=today-total&style=for-the-badge&label=%EB%B0%A9%EB%AC%B8%EC%88%98&color=575757&labelColor=ec7b9a&logo=data%3Aimage%2Fpng%3Bbase64%2CiVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8%2F9hAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAD80lEQVQ4yy1TeUybZRh%2F0c2YaMY2FkoPQIFytV9LKb2oXDvYIFyrY0NhS43ARDZgQ%2Bix9uv39YBeMI3ihIHMBTNmAopmbMk2FFkNC26oQ2VCpokbi0dMjPFq%2B72PL8Q%2F3uTJm%2Bd3PckP0TSNnE4W%2Bf0%2BFOwLbsx2ux2xLifq8fYgT28PYv%2F%2Fo%2B10DMsyyNPj3thzOBwIuciiyWTJKNbvm6k1PO8%2Bdcqe5vZ4EG21J3W0thecPNahd9jsQk%2BPB7ncbgJitr5yoivfbLKkMoQM%2BQNedNBQHxDEpcNTCVlQJC%2F5rUpXFsoTyf7QiSiQbheDOinn99rCyllDSc1Meor8QdyTIqjae%2BC9YF8AoUDQj%2FbtrhrLEMoixZn6v1R8CaQ9kQhlYjUcK6zhxLEpnCI%2BC%2BRxYtDy5aAQUjj2cR6385my6dOv9hMHQR%2BqrTjYrxHkgFZIhZUJWdHMbanR7pJabNl9CGdsTcVqAcWphFRULSIiycp%2FdIkqXLHXMOLzexFibDS1M1u%2FkktUlAnZURWf4rK3p2FP1QvYVWnEkjgxVgkonMeXEiIZpxZS%2F%2Br5CmhpeIlxkWMib8D3WNP%2BIwMaHgVakTysEckIKBUclUYYqO8ABU8CahJrPRoBY62ICqt2ZEJj9eHzveR%2B6wToSGndR5p4KeQn50Y0fAmWxaVBs74aJtucUJCUA%2FmJ1Ho8UPKycH6SPKImbg%2Foym%2F3%2BgiB08GKy6TFazoBBXnxWVxDcRXXXFkHsthUGG00QWuRAcpziqBCXgit1fVYFS%2BJ6oUyXK3Y873L7YpBnU1tJ0pSNH%2FqiIJ0Swr2W6z4DdYFRAlqpIXA1B0FY6kBju5%2FDp%2Fr7%2Bc0PEm0KCkPqnNLl1mnE6GTDa2jxU%2Brwopt6dDd0Mzd%2F3Iefxe6jm9d%2FhCHpibw%2FKVJvHDpA7w8ew3Wlj7HVuPLXPbmlIjp0Iu%2FTFx8V4lsjZ3v7EnLDxcIlLjDYAyfP%2FN6tLvtOHdtYhz%2FvLyIf%2FrmNp6%2FMoW72o9zF0cHOXdLZ6Rp17Nwc3wMLk9N1qO2hhZveXrB37uSNdExpxeWpifg69mrsHLzU7wyd51bvTHDrS7c4BZnrnChC2%2FD0tVpWF2cX7pwbrjSTjtiEEuzksO6moe1maVwtu81Zumzufd%2FWFx4cP%2FbLyL3QjNwL%2FQxrN29gx%2FevRP58auFX2%2FNfTIeCAR4Xd0mxDAMIXC7ENN9SmtvNxtphkE2O418Pt%2BWM28OZIyMDKvODg9ph4cGc4cG38oM9vXtsNloZLPZEMuyj5JiIeSg6UccpFWMm0WMw7GZZZhNNKmu1WpFZrMZWcwWZLZYkIU8%2BwaQ2UTAMetVJg7Qf7xZ2y9K2xlZAAAAAElFTkSuQmCC';
                countingImg.style.cssText = 'position: absolute; right: 0; bottom: -28px;';

                honorWrapper = document.createElement('div');
                honorWrapper.className = 'honor-wrapper';
                honorWrapper.style.cssText = 'position: absolute; top: 1.2vh; right: 3vw; cursor: pointer; z-index: 3000; display: inline-block; pointer-events: auto;';

                const hallImg = document.createElement('img');
                hallImg.src = 'dia_trophy_playing.webp';
                hallImg.style.cssText = 'width: 6vw; height: auto; display: block; z-index: 3000;';

                const honorText = document.createElement('div');
                honorText.className = 'honor-text';
                honorText.textContent = '명예의 전당';

                honorWrapper.appendChild(hallImg);
                honorWrapper.appendChild(honorText);

                honorWrapper.addEventListener('mouseenter', () => { hallImg.src = 'dia_trophy_hover.webp'; });
                honorWrapper.addEventListener('mouseleave', () => { hallImg.src = 'dia_trophy_playing.webp'; });
                honorWrapper.addEventListener('click', showHallOfFame);

                banner.appendChild(announcement);
                banner.appendChild(timeSpan);
                banner.appendChild(countingImg);
                banner.appendChild(honorWrapper);

                requestAnimationFrame(() => {
                    if (honorWrapper) honorWrapper.classList.add('animate-in');
                });
            }
            allStreamers = rankingData.streamers;
            allIds = Object.keys(allStreamers);
            allNicknames = allIds.map(id => allStreamers[id].nickname);
            loadInitialTables();
        } else {
            throw new Error("랭킹 데이터가 비어있습니다.");
        }
    } catch (error) {
        const tablesContainer = document.getElementById('tables-container');
        if (tablesContainer) {
            tablesContainer.innerHTML = `<p>데이터를 불러오는 데 실패했습니다: ${error.message}. 페이지를 새로고침 해주세요.</p>`;
        }
    }

    searchInput.addEventListener('input', function() {
        const query = this.value.trim().toLowerCase();
        if (query.length === 0) {
            autocompleteDropdown.innerHTML = '';
            autocompleteDropdown.style.display = 'none';
            return;
        }
        let suggestions = [];
        const idSuggestions = allIds.filter(id => id.toLowerCase().startsWith(query));
        suggestions = suggestions.concat(idSuggestions.map(id => ({ type: 'id', value: id })));
        const nicknameSuggestions = allNicknames.filter(nickname => nickname.toLowerCase().startsWith(query));
        suggestions = suggestions.concat(nicknameSuggestions.map(nickname => ({ type: 'nickname', value: nickname })));
        suggestions = [...new Set(suggestions.map(s => JSON.stringify(s)))].map(s => JSON.parse(s)).slice(0, 10);

        if (suggestions.length === 0) {
            autocompleteDropdown.innerHTML = '';
            autocompleteDropdown.style.display = 'none';
            return;
        }
        autocompleteDropdown.innerHTML = '';
        suggestions.forEach((suggestion, index) => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            if (index === 0) item.classList.add('selected');
            item.textContent = suggestion.type === 'id' ? `(id)${suggestion.value}` : `${suggestion.value}`;
            item.addEventListener('click', function() {
                searchInput.value = suggestion.value;
                autocompleteDropdown.style.display = 'none';
                searchId();
            });
            autocompleteDropdown.appendChild(item);
        });
        autocompleteDropdown.style.display = 'block';
    });

    searchInput.addEventListener('keydown', function(e) {
        const dropdown = autocompleteDropdown;
        const items = dropdown.querySelectorAll('.autocomplete-item');
        if (items.length === 0) return;
        let selectedIndex = Array.from(items).findIndex(item => item.classList.contains('selected'));

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (selectedIndex < items.length - 1) {
                if (selectedIndex >= 0) items[selectedIndex].classList.remove('selected');
                selectedIndex++;
                items[selectedIndex].classList.add('selected');
                items[selectedIndex].scrollIntoView({ block: 'nearest' });
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (selectedIndex > 0) {
                items[selectedIndex].classList.remove('selected');
                selectedIndex--;
                items[selectedIndex].classList.add('selected');
                items[selectedIndex].scrollIntoView({ block: 'nearest' });
            }
        } else if (e.key === 'Enter') {
            if (selectedIndex >= 0) {
                e.preventDefault();
                searchInput.value = items[selectedIndex].textContent.split(' ')[0];
                autocompleteDropdown.style.display = 'none';
                searchId();
            }
        }
    });

    searchInput.addEventListener('blur', function() {
        setTimeout(() => {
            autocompleteDropdown.style.display = 'none';
        }, 200);
    });

    addNavigationButtons(searchSection);
    mainSection.addEventListener('mouseenter', () => {
        mainSection.style.width = '60%';
        searchSection.style.width = '40%';
    });
    searchSection.addEventListener('mouseenter', () => {
        mainSection.style.width = '50%';
        searchSection.style.width = '50%';
    });
    container.addEventListener('mouseleave', () => {
        mainSection.style.width = '55%';
        searchSection.style.width = '45%';
    });

    if (mainSection && searchSection && container) {
        mainSection.addEventListener('mouseenter', () => {
            mainSection.style.width = '60%';
            searchSection.style.width = '40%';
        });
        searchSection.addEventListener('mouseenter', () => {
            mainSection.style.width = '50%';
            searchSection.style.width = '50%';
        });
        container.addEventListener('mouseleave', () => {
            mainSection.style.width = '55%';
            searchSection.style.width = '45%';
        });
        addNavigationButtons(searchSection);
    }
    function addNavigationButtons(section) {
        const navButtonsDiv = document.createElement('div');
        navButtonsDiv.className = 'section-nav-buttons';

        const ascendButton = document.createElement('button');
        ascendButton.className = 'ascend-button';
        const ascendImg = document.createElement('img');
        ascendImg.src = 'ascend.png';
        ascendImg.alt = 'Up';
        ascendButton.appendChild(ascendImg);

        const descendButton = document.createElement('button');
        descendButton.className = 'descend-button';
        const descendImg = document.createElement('img');
        descendImg.src = 'descend.png';
        descendImg.alt = 'Down';
        descendButton.appendChild(descendImg);

        navButtonsDiv.appendChild(ascendButton);
        navButtonsDiv.appendChild(descendButton);
        document.body.appendChild(navButtonsDiv);

        function updateButtonPosition() {
            const rect = section.getBoundingClientRect();
            const rightOffset = 25;
            const bottomOffset = 25;
            navButtonsDiv.style.right = `${window.innerWidth - rect.right + rightOffset}px`;
            navButtonsDiv.style.bottom = `${window.innerHeight - rect.bottom + bottomOffset}px`;
            if (rect.bottom < 0 || rect.top > window.innerHeight) {
                navButtonsDiv.style.display = 'none';
            } else {
                navButtonsDiv.style.display = 'flex';
            }
        }
        ascendButton.addEventListener('click', function() {
            section.scrollTo({ top: 0, behavior: 'smooth' });
        });
        descendButton.addEventListener('click', function() {
            section.scrollTo({ top: section.scrollHeight, behavior: 'smooth' });
        });
        window.addEventListener('scroll', updateButtonPosition);
        window.addEventListener('resize', updateButtonPosition);
        section.addEventListener('scroll', updateButtonPosition);
        updateButtonPosition();
    }
});
