let rankingData = null;
let allIds = [];

async function fetchRankingData() {
    try {
        const response = await fetch('ranking_data.json');
        if (!response.ok) {
            throw new Error(`HTTP 오류: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('JSON 데이터 불러오기 오류:', error);
        return null;
    }
}

function createTables(id, data, container) {
    const idContainer = document.createElement('div');
    idContainer.className = 'id-container';
    
    const h2 = document.createElement('h2');
    h2.textContent = `ID: ${id}`;
    idContainer.appendChild(h2);

    const periodTablesContainer = document.createElement('div');
    periodTablesContainer.className = 'period-tables';
    
    const periods = ['top_7_days', 'top_30_days', 'top_all_time'];
    const periodNames = {
        'top_7_days': '7 days',
        'top_30_days': '30 days',
        'top_all_time': 'All time'
    };
    
    periods.forEach(period => {
        const periodContainer = document.createElement('div');
        periodContainer.className = 'period-container';
        
        const periodTitle = document.createElement('h3');
        periodTitle.textContent = periodNames[period];
        periodContainer.appendChild(periodTitle);
        
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');
        
        thead.innerHTML = `
            <tr>
                <th>등수</th>
                <th>닉네임</th>
                <th>Score</th>
            </tr>
        `;
        
        table.appendChild(thead);
        
        if (data[period] && data[period].length > 0) {
            const sortedData = [...data[period]].sort((a, b) => b.score - a.score);
            const topEntries = sortedData.slice(0, 30);
            
            topEntries.forEach((entry, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td title="${entry.nickname}">${entry.nickname}</td>
                    <td>${entry.score}</td>
                `;
                tbody.appendChild(row);
            });
        } else {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="3">No data available</td>`;
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
        '243000', 'cotton1217', 'ecvhao', 'jingburger1', 
        'inehine', 'gosegu2', 'lilpa0309'
    ];
    let tablesCreated = 0;
    
    for (const id of fixedIds) {
        if (rankingData[id]) {
            createTables(id, rankingData[id], container);
            tablesCreated++;
        } else {
            console.warn(`ID '${id}'에 대한 데이터가 없습니다.`);
            const errorMsg = document.createElement('div');
            errorMsg.innerHTML = `<p>ID '${id}'에 대한 데이터를 찾을 수 없습니다.</p>`;
            container.appendChild(errorMsg);
        }
    }
    
    console.log(`${tablesCreated}개의 테이블이 생성되었습니다.`);
    if (tablesCreated === 0) {
        container.innerHTML = '<p>표시할 데이터가 없습니다. JSON 파일을 확인해주세요.</p>';
    }
}

async function searchId() {
    const input = document.getElementById('search-input').value.trim();
    const resultContainer = document.getElementById('search-result');
    resultContainer.innerHTML = '';
    
    if (!input) {
        resultContainer.textContent = 'ID를 입력해주세요.';
        return;
    }
    
    if (!rankingData) {
        resultContainer.textContent = '데이터를 불러오지 못했습니다.';
        return;
    }
    
    if (!rankingData[input]) {
        resultContainer.textContent = '해당 ID를 찾을 수 없습니다.';
        return;
    }
    
    createTables(input, rankingData[input], resultContainer);
}

document.addEventListener('DOMContentLoaded', async function() {
    console.log("페이지 로드됨");
    rankingData = await fetchRankingData();
    if (rankingData) {
        allIds = Object.keys(rankingData);
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
        
        const suggestions = allIds.filter(id => id.toLowerCase().startsWith(query));
        if (suggestions.length === 0) {
            autocompleteDropdown.innerHTML = '';
            autocompleteDropdown.style.display = 'none';
            return;
        }
        
        autocompleteDropdown.innerHTML = '';
        suggestions.forEach((id, index) => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            if (index === 0) item.classList.add('selected');
            item.textContent = id;
            item.addEventListener('click', function() {
                searchInput.value = id;
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
                searchInput.value = items[selectedIndex].textContent;
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