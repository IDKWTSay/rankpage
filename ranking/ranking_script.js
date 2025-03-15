let rankingData = null;
let allStreamers = null;
let allIds = [];
let allNicknames = [];

async function fetchRankingData() {
    try {
        const response = await fetch('ranking_data.json');
        if (!response.ok) {
            throw new Error(`HTTP 오류: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        return null;
    }
}


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
                } else if (index >= 1 && index <= 5) {
                    trophyImage = 'golden_trophy.webp';
                } else if (index >= 6 && index <= 10) {
                    trophyImage = 'silver_trophy.webp';
                }
                
                // Format rank change
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
                        <img src="${trophyImage}" width="13" height="20" alt="trophy">
                    </td>
                    <td class="rank-column">${index + 1}</td>
                    <td>
                        <span title="${entry.nickname}">${entry.nickname}</span>
                    </td>
                    <td class="change-column">${changeDisplay}</td>
                `;
                tbody.appendChild(row);
            });
        } else {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="4">No data available</td>`;
            tbody.appendChild(row);
        }
        
        table.appendChild(tbody);
        periodContainer.appendChild(table);
        periodTablesContainer.appendChild(periodContainer);
    });
    
    idContainer.appendChild(periodTablesContainer);
    container.appendChild(idContainer);
}


async function loadInitialTables() {
    if (!rankingData) {
        console.error("데이터가 아직 로드되지 않았습니다.");
        return;
    }
    const container = document.getElementById('tables-container');
    if (!container) {
        console.error("tables-container 요소를 찾을 수 없습니다.");
        return;
    }
    container.innerHTML = '';
    const fixedIds = [
        'ecvhao', 'inehine', 'jingburger1', 'lilpa0309', 'cotton1217',  'gosegu2', 'viichan6'
    ];
    let tablesCreated = 0;
    
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
        container.innerHTML = '<p>표시할 데이터가 없습니다.</p>';
    }
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
}

document.addEventListener('DOMContentLoaded', async function() {
    console.log("페이지 로드됨");
    rankingData = await fetchRankingData();
    if (rankingData) {
        const updatedTime = rankingData.updated;
        const banner = document.querySelector('.banner');
        if (banner) {
            banner.textContent = `갱신시간: ${updatedTime}`;
			banner.style.fontSize = "20px";
			banner.style.color = "black";
        }
        allStreamers = rankingData.streamers;
        allIds = Object.keys(allStreamers);
        allNicknames = allIds.map(id => allStreamers[id].nickname);
        loadInitialTables();
    } else {
        console.error("데이터를 불러오지 못했습니다.");
        document.getElementById('tables-container').innerHTML = '<p>데이터를 불러오는 데 실패했습니다. 네트워크 연결을 확인해주세요.</p>';
    }
    
    const searchInput = document.getElementById('search-input');
    const autocompleteDropdown = document.getElementById('autocomplete-dropdown');
    
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
});