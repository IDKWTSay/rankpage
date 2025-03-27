let rankingData = null;
let allStreamers = null;
let allIds = [];
let allNicknames = [];

// async function fetchRankingData() {
//     try {
//         const response = await fetch('ranking_data.json');
//         if (!response.ok) {
//             throw new Error(`HTTP 오류: ${response.status}`);
//         }
//         const data = await response.json();
//         return data;
//     } catch (error) {
//         return null;
//     }
// }

const GIST_URL = "https://gist.githubusercontent.com/IDKWTSay/e2779cfa06b34a78cc34f58e6efc6f64/raw/ranking_data.json";

async function fetchRankingData() {
    const response = await fetch(GIST_URL);
    if (!response.ok) throw new Error("데이터 가져오기 실패");
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
                if (index === 0) {
                    trophyImage = 'dia_trophy.webp';
                } else if (index >= 1 && index <= 4) {
                    trophyImage = 'golden_trophy.webp';
                } else if (index >= 5 && index <= 9) {
                    trophyImage = 'silver_trophy.webp';
                }
                
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
						const absScoreDiff = Math.abs(scoreDiff);
						const formattedDiff = absScoreDiff.toLocaleString('ko-KR');
                        const diffSpan = document.createElement('span');
                        diffSpan.textContent = ` ${formattedDiff} 포인트차`;
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
        
		periodContainer.style.zIndex = "100"
        table.appendChild(tbody);
        periodContainer.appendChild(table)
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
    bannerContainer.style.position = 'fixed';
    bannerContainer.style.top = '13.3vh';
    bannerContainer.style.left = '15vw';
    bannerContainer.style.width = '35vw';
    bannerContainer.style.display = 'flex';
    bannerContainer.style.justifyContent = 'center';
    bannerContainer.style.gap = '15px';
    bannerContainer.style.zIndex = '1000';

    for (const id of fixedIds) {
        if (allStreamers[id]) {
            const streamer = allStreamers[id];
            
            const bannerImg = document.createElement('div');
            bannerImg.className = 'streamer-banner-img';
			bannerImg.style.marginTop = '20px';
            bannerImg.style.width = '60px';
            bannerImg.style.height = '60px';
            bannerImg.style.borderRadius = '50%';
            bannerImg.style.overflow = 'hidden';
            bannerImg.style.cursor = 'pointer';
            bannerImg.style.transition = 'all 0.3s ease';
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
				bannerImg.style.border = '';
            });
            
            bannerImg.addEventListener('mouseout', function() {
                this.style.opacity = '0.7';
                this.style.transform = 'scale(1)';
				bannerImg.style.border = '3px solid transparent';
            });
            
            bannerImg.addEventListener('click', function() {
				bannerImg.style.border = '';
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
//                    bannerImg.style.border = '3px solid transparent';
                }, 300);
            });
            
            bannerContainer.appendChild(bannerImg);
        }
    }
    
    const mainSection = document.querySelector('.main-section');
    if (mainSection) {
        mainSection.insertBefore(bannerContainer, mainSection.firstChild);
    } else {
        document.body.insertBefore(bannerContainer, document.body.firstChild);
    }
}


async function loadInitialTables() {
	const container = document.getElementById('tables-container');
	const fixedIds = [
        'ecvhao', 'inehine', 'jingburger1', 'lilpa0309', 'cotton1217',  'gosegu2', 'viichan6'
    ];
	let tablesCreated = 0
	
    if (!rankingData) {
        console.error("데이터가 아직 로드되지 않았습니다.");
        return;
    }
    
    if (!container) {
        console.error("tables-container 요소를 찾을 수 없습니다.");
        return;
    }
    container.innerHTML = '';

    for (const id of fixedIds) {
        if (allStreamers[id]) {
            createTables(id, allStreamers[id], container);
            tablesCreated++;
        } else {
            const errorMsg = document.createElement('div');
            errorMsg.innerHTML = `<p>ID '${id}'에 대한 데이터를 찾을 수 없습니다.</p>`;
            container.appendChild(errorMsg);
        }
    }
    
    if (tablesCreated === 0) {
        container.innerHTML = '<p>이제 막 열렸습니다. 몇시간 후에 찾아와주세요!</p>';
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

document.addEventListener('DOMContentLoaded', async function() {
	const mainSection = document.querySelector('.main-section');
	const searchSection = document.querySelector('.search-section');
	const container = document.querySelector('.container');
	const searchInput = document.getElementById('search-input');
    const autocompleteDropdown = document.getElementById('autocomplete-dropdown');
	
    rankingData = await fetchRankingData();
    if (rankingData) {
        const updatedTime = rankingData.updated;
        const banner = document.querySelector('.banner');
    if (banner) {
		
        const timeSpan = document.createElement('span');
        timeSpan.textContent = `갱신시간: ${updatedTime}`;
        timeSpan.style.display = "block";
        timeSpan.style.marginTop = "1vh";
		timeSpan.style.marginLeft = "1.5vw";
        timeSpan.style.fontSize = "15px";
        timeSpan.style.color = "black";

		const announcement = document.createElement('span');
		announcement.textContent = "방송 당일 포인트를 업데이트하지 못한 채 브라우저가 종료된 경우, 다음 날 브라우저를 실행하면 업데이트가 될 수 있습니다.\n이로 인해 리더보드 갱신이 다음 날 이루어질 수도 있습니다.";
        announcement.style.display = "block";
		announcement.style.whiteSpace = "pre-line";
		announcement.style.lineHeight = "1.4";
        announcement.style.marginTop = "1vh";
		announcement.style.marginLeft = "1.5vw";
        announcement.style.fontSize = "13px";
        announcement.style.color = "white";
		
		const warningText = document.createElement('span');
//        warningText.textContent = "부적절한 닉네임 사용시 영구차단될 수 있습니다";
		warningText.textContent = "닉네임 설정은 팝업창 세부설정탭에서 하실 수 있습니다.";
        warningText.style.display = "block";
        warningText.style.marginTop = "1vh";
		warningText.style.marginLeft = "1.5vw";
        warningText.style.fontSize = "16px";
        warningText.style.color = "purple";
		
		const countingImg = document.createElement('img');
		countingImg.src = 'https://hits.sh/hits.sh/idkwtsay.github.io/rankpage/ranking.svg?view=today-total&style=for-the-badge&label=%EB%B0%A9%EB%AC%B8%EC%88%98&color=575757&labelColor=ec7b9a&logo=data%3Aimage%2Fpng%3Bbase64%2CiVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8%2F9hAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAD80lEQVQ4yy1TeUybZRh%2F0c2YaMY2FkoPQIFytV9LKb2oXDvYIFyrY0NhS43ARDZgQ%2Bix9uv39YBeMI3ihIHMBTNmAopmbMk2FFkNC26oQ2VCpokbi0dMjPFq%2B72PL8Q%2F3uTJm%2Bd3PckP0TSNnE4W%2Bf0%2BFOwLbsx2ux2xLifq8fYgT28PYv%2F%2Fo%2B10DMsyyNPj3thzOBwIuciiyWTJKNbvm6k1PO8%2Bdcqe5vZ4EG21J3W0thecPNahd9jsQk%2BPB7ncbgJitr5yoivfbLKkMoQM%2BQNedNBQHxDEpcNTCVlQJC%2F5rUpXFsoTyf7QiSiQbheDOinn99rCyllDSc1Meor8QdyTIqjae%2BC9YF8AoUDQj%2FbtrhrLEMoixZn6v1R8CaQ9kQhlYjUcK6zhxLEpnCI%2BC%2BRxYtDy5aAQUjj2cR6385my6dOv9hMHQR%2BqrTjYrxHkgFZIhZUJWdHMbanR7pJabNl9CGdsTcVqAcWphFRULSIiycp%2FdIkqXLHXMOLzexFibDS1M1u%2FkktUlAnZURWf4rK3p2FP1QvYVWnEkjgxVgkonMeXEiIZpxZS%2F%2Br5CmhpeIlxkWMib8D3WNP%2BIwMaHgVakTysEckIKBUclUYYqO8ABU8CahJrPRoBY62ICqt2ZEJj9eHzveR%2B6wToSGndR5p4KeQn50Y0fAmWxaVBs74aJtucUJCUA%2FmJ1Ho8UPKycH6SPKImbg%2Foym%2F3%2BgiB08GKy6TFazoBBXnxWVxDcRXXXFkHsthUGG00QWuRAcpziqBCXgit1fVYFS%2BJ6oUyXK3Y873L7YpBnU1tJ0pSNH%2FqiIJ0Swr2W6z4DdYFRAlqpIXA1B0FY6kBju5%2FDp%2Fr7%2Bc0PEm0KCkPqnNLl1mnE6GTDa2jxU%2Brwopt6dDd0Mzd%2F3Iefxe6jm9d%2FhCHpibw%2FKVJvHDpA7w8ew3Wlj7HVuPLXPbmlIjp0Iu%2FTFx8V4lsjZ3v7EnLDxcIlLjDYAyfP%2FN6tLvtOHdtYhz%2FvLyIf%2FrmNp6%2FMoW72o9zF0cHOXdLZ6Rp17Nwc3wMLk9N1qO2hhZveXrB37uSNdExpxeWpifg69mrsHLzU7wyd51bvTHDrS7c4BZnrnChC2%2FD0tVpWF2cX7pwbrjSTjtiEEuzksO6moe1maVwtu81Zumzufd%2FWFx4cP%2FbLyL3QjNwL%2FQxrN29gx%2FevRP58auFX2%2FNfTIeCAR4Xd0mxDAMIXC7ENN9SmtvNxtphkE2O418Pt%2BWM28OZIyMDKvODg9ph4cGc4cG38oM9vXtsNloZLPZEMuyj5JiIeSg6UccpFWMm0WMw7GZZZhNNKmu1WpFZrMZWcwWZLZYkIU8%2BwaQ2UTAMetVJg7Qf7xZ2y9K2xlZAAAAAElFTkSuQmCC';
		
		countingImg.style.position = 'absolute';
		countingImg.style.right = '0';
		countingImg.style.top = '22%';
		
		
		
		
        banner.textContent = "";
		banner.appendChild(announcement);
//		banner.appendChild(warningText);
        banner.appendChild(timeSpan);
		banner.appendChild(countingImg);
		
		
    }
        allStreamers = rankingData.streamers;
        allIds = Object.keys(allStreamers);
        allNicknames = allIds.map(id => allStreamers[id].nickname);
        loadInitialTables();
    } else {
        console.error("데이터를 불러오지 못했습니다.");
        document.getElementById('tables-container').innerHTML = '<p>데이터를 불러오는 데 실패했습니다. 네트워크 연결을 확인해주세요.</p>';
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
        const scrollTop = window.scrollY || window.pageYOffset;
        
        const rightOffset = 25;
        const bottomOffset = 25;
        const buttonHeight = navButtonsDiv.offsetHeight;
        
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
        section.scrollTo({ top: section.scrollHeight - section.clientHeight, behavior: 'smooth' });
    });

    window.addEventListener('scroll', updateButtonPosition);
    window.addEventListener('resize', updateButtonPosition);
    section.addEventListener('scroll', updateButtonPosition);
    updateButtonPosition();
}
});